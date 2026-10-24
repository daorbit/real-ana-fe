import { useEffect, useState } from "react";
import { Combobox, ScrollArea, UnstyledButton, useCombobox } from "@mantine/core";
import { Check, ChevronDown, FileText, Search, Zap } from "lucide-react";
import { num } from "@/shared/lib";
import { decodeStep, encodeStep, type Draft } from "../lib/funnelDraft";
import { filterOptions, type StepOptionGroup } from "../lib/funnelOptions";
import classes from "./Funnels.module.css";

export function FunnelStepPicker({
  index,
  step,
  groups,
  autoOpen,
  onAutoOpened,
  onChange,
}: {
  index: number;
  step: Draft;
  groups: StepOptionGroup[];
  autoOpen: boolean;
  onAutoOpened: () => void;
  onChange: (step: Draft) => void;
}) {
  const [query, setQuery] = useState("");
  const combobox = useCombobox({
    onDropdownClose: () => {
      combobox.resetSelectedOption();
      setQuery("");
    },
    onDropdownOpen: () => combobox.focusSearchInput(),
  });

  useEffect(() => {
    if (!autoOpen) return;
    combobox.openDropdown();
    onAutoOpened();
  }, [autoOpen, combobox, onAutoOpened]);

  const visible = filterOptions(groups, query);
  const current = encodeStep(step);
  const KindIcon = step.type === "event" ? Zap : FileText;

  return (
    <Combobox
      store={combobox}
      position="bottom-start"
      width={380}
      middlewares={{ flip: true, shift: true }}
      withinPortal
      onOptionSubmit={(value) => {
        onChange(decodeStep(value));
        combobox.closeDropdown();
      }}
    >
      <Combobox.Target targetType="button">
        <UnstyledButton
          className={classes.pickerField}
          data-empty={!step.value || undefined}
          data-open={combobox.dropdownOpened || undefined}
          onClick={() => combobox.toggleDropdown()}
          aria-label={step.value ? `Step ${index + 1}: ${step.value}. Change` : `Choose step ${index + 1}`}
        >
          {step.value ? (
            <>
              <KindIcon size={15} className={classes.pickerKindIcon} />
              <span className={classes.pickerValue}>{step.value}</span>
              <span className={classes.pickerKind}>{step.type === "event" ? "Event" : "Page"}</span>
            </>
          ) : (
            <span className={classes.pickerPlaceholder}>
              {index === 0 ? "Where does the journey start? Pick a page or event" : "Pick the next page or event"}
            </span>
          )}
          <ChevronDown size={15} className={classes.pickerCaret} />
        </UnstyledButton>
      </Combobox.Target>

      <Combobox.Dropdown className={classes.picker}>
        <Combobox.Search
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          placeholder="Search pages and events"
          leftSection={<Search size={14} />}
          classNames={{ input: classes.pickerSearch }}
        />
        <Combobox.Options>
          <ScrollArea.Autosize mah={320} type="scroll" scrollbars="y" classNames={{ content: classes.pickerScroll }}>
            {visible.length === 0 ? (
              <Combobox.Empty>Nothing with traffic in this range</Combobox.Empty>
            ) : (
              visible.map((group) => (
                <Combobox.Group key={group.group} label={group.group}>
                  {group.items.map((option) => {
                    const OptionIcon = option.type === "event" ? Zap : FileText;
                    const selected = option.value === current;
                    return (
                      <Combobox.Option
                        key={option.value}
                        value={option.value}
                        active={selected}
                        className={classes.option}
                        data-selected={selected || undefined}
                      >
                        <OptionIcon size={14} className={classes.optionIcon} />
                        <span className={classes.optionLabel}>{option.label}</span>
                        {option.count !== null && <span className={classes.optionCount}>{num(option.count)}</span>}
                        {selected && <Check size={14} className={classes.optionCheck} />}
                      </Combobox.Option>
                    );
                  })}
                </Combobox.Group>
              ))
            )}
          </ScrollArea.Autosize>
        </Combobox.Options>
        <div className={classes.pickerFoot}>Counts are visits in the selected range</div>
      </Combobox.Dropdown>
    </Combobox>
  );
}
