import { useMemo, useState, type FormEvent } from "react";
import { Button, Select, TextInput } from "@mantine/core";
import type { SearchFilter, SearchFilterDimension, SearchFilterOperator, SearchType } from "@/shared/types";
import { FILTER_FIELDS, MENU_FIELDS, fieldAllowed } from "../../searchFilters";
import classes from "./filters.module.css";

const IN_POPOVER = { withinPortal: false, radius: "md" } as const;
const MAX_LENGTH = 500;

export function SearchFilterForm({
  type,
  onSubmit,
}: {
  type: SearchType;
  onSubmit: (filter: SearchFilter) => void;
}) {
  const fields = MENU_FIELDS.filter((dimension) => fieldAllowed(dimension, type));
  const [dimension, setDimension] = useState<SearchFilterDimension>(fields[0]);
  const [operator, setOperator] = useState<SearchFilterOperator>(FILTER_FIELDS[fields[0]].operators[0].value);
  const [expression, setExpression] = useState("");
  const field = FILTER_FIELDS[dimension];
  const options = useMemo(() => FILTER_FIELDS[dimension].options?.(), [dimension]);

  const changeDimension = (next: SearchFilterDimension) => {
    setDimension(next);
    setOperator(FILTER_FIELDS[next].operators[0].value);
    setExpression("");
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const value = expression.trim();
    if (value) onSubmit({ dimension, operator, expression: value });
  };

  return (
    <form className={classes.form} onSubmit={submit}>
      <div className={classes.pair}>
        <Select
          size="sm"
          label="Filter by"
          allowDeselect={false}
          comboboxProps={IN_POPOVER}
          data={fields.map((value) => ({ value, label: FILTER_FIELDS[value].label }))}
          value={dimension}
          onChange={(v) => v && changeDimension(v as SearchFilterDimension)}
        />
        <Select
          size="sm"
          label="Condition"
          allowDeselect={false}
          comboboxProps={IN_POPOVER}
          data={field.operators}
          value={operator}
          onChange={(v) => v && setOperator(v as SearchFilterOperator)}
        />
      </div>
      {options ? (
        <Select
          size="sm"
          label="Value"
          placeholder={`Choose a ${field.label.toLowerCase()}`}
          searchable={options.length > 5}
          allowDeselect={false}
          comboboxProps={IN_POPOVER}
          data={options}
          value={expression || null}
          onChange={(v) => setExpression(v ?? "")}
        />
      ) : (
        <TextInput
          size="sm"
          label="Value"
          placeholder={field.placeholder}
          maxLength={MAX_LENGTH}
          value={expression}
          onChange={(e) => setExpression(e.currentTarget.value)}
        />
      )}
      <Button type="submit" size="sm" disabled={!expression.trim()}>
        Apply filter
      </Button>
    </form>
  );
}
