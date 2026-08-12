import { useEffect, useMemo, useState } from "react";
import { useUpdateFormMutation } from "@/app/store";
import { notify, errMessage } from "@/shared/lib/notify";
import { makeField, type Form, type FormField, type FormSettings, type PaletteEntry } from "@/features/forms/lib/types";

/**
 * The builder's working copy of a form.
 *
 * Edits are local until Save, rather than a mutation per keystroke: a form is a
 * dozen linked decisions, and saving each one separately means a half-built
 * form is briefly the live one — which for a *published* form is a real visitor
 * seeing a field that is mid-rename.
 *
 * The rule this hook exists to enforce in the UI is field-key immutability.
 * Once a form has responses the server refuses to rename a key, change a
 * field's type, or delete a field. The builder has to say so *at edit time* —
 * discovering it on Save, after ten minutes of work, is the worst version of
 * this.
 */
export function useFormBuilder(form: Form | undefined) {
  const [name, setName] = useState("");
  const [fields, setFields] = useState<FormField[]>([]);
  const [settings, setSettings] = useState<FormSettings | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  const [save, { isLoading: saving }] = useUpdateFormMutation();

  // Reset when a different form loads. Keyed on id rather than the object so a
  // refetch of the same form does not discard edits in progress.
  useEffect(() => {
    if (!form) return;
    setName(form.name);
    setFields(form.fields);
    setSettings(form.settings);
    setSelectedKey(null);
    setDirty(false);
  }, [form?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Whether edits are constrained by existing responses.
   *
   * Read from the counter rather than fetched: the list page already carries
   * it, and being wrong in the safe direction (warning about a form that turns
   * out to be empty) costs nothing.
   */
  const locked = (form?.submissionCount ?? 0) > 0;

  const selected = useMemo(
    () => fields.find((f) => f.key === selectedKey) ?? null,
    [fields, selectedKey],
  );

  const mark = () => setDirty(true);

  const addField = (entry: PaletteEntry) => {
    const field = makeField(entry, fields.map((f) => f.key), fields.length);
    setFields([...fields, field]);
    setSelectedKey(field.key);
    mark();
  };

  /**
   * Update one field.
   *
   * The key is carried through unchanged even when the label changes — that is
   * the whole of key immutability, and doing it here means no call site can
   * forget it.
   */
  const updateField = (next: FormField) => {
    setFields(fields.map((f) => (f.key === next.key ? { ...next, key: f.key } : f)));
    mark();
  };

  /**
   * Remove a field, or hide it if responses exist.
   *
   * Hiding rather than deleting is what keeps stored answers readable: the
   * column stays in the responses table and in the CSV, describing data that
   * would otherwise sit under a key nothing names. The server does the same
   * thing to a field left out of a save, so this only makes the outcome visible
   * before it happens.
   */
  const removeField = (key: string) => {
    if (locked) {
      setFields(fields.map((f) => (f.key === key ? { ...f, hidden: true } : f)));
      notify.info(
        "The field is hidden from the form. Responses already collected keep their column.",
        "Field hidden, not deleted",
      );
    } else {
      setFields(fields.filter((f) => f.key !== key).map((f, i) => ({ ...f, order: i })));
    }
    setSelectedKey(null);
    mark();
  };

  /** Move a field one place up or down among the fields actually on the form. */
  const moveField = (key: string, direction: -1 | 1) => {
    const visible = fields.filter((f) => !f.hidden).sort((a, b) => a.order - b.order);
    const index = visible.findIndex((f) => f.key === key);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= visible.length) return;

    const reordered = [...visible];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];

    const orderByKey = new Map(reordered.map((f, i) => [f.key, i]));
    setFields(
      fields.map((f) =>
        orderByKey.has(f.key) ? { ...f, order: orderByKey.get(f.key)! } : f,
      ),
    );
    mark();
  };

  const updateSettings = (patch: Partial<FormSettings>) => {
    setSettings((s) => (s ? { ...s, ...patch } : s));
    mark();
  };

  const rename = (value: string) => {
    setName(value);
    mark();
  };

  const persist = async () => {
    if (!form) return false;
    try {
      await save({ id: form.id, name: name.trim(), fields, settings: settings ?? undefined }).unwrap();
      setDirty(false);
      notify.success("Form saved");
      return true;
    } catch (e) {
      // A 409 here is the server refusing an edit that would orphan responses —
      // its message names the field, so it is shown rather than replaced.
      notify.error(errMessage(e, "Could not save this form"));
      return false;
    }
  };

  return {
    name, rename,
    fields, addField, updateField, removeField, moveField,
    settings, updateSettings,
    selected, selectedKey, setSelectedKey,
    locked, dirty, saving, persist,
  };
}
