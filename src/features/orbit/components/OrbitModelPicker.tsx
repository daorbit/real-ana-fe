import { Menu, Text, UnstyledButton } from "@mantine/core";
import { Check, ChevronDown } from "lucide-react";
import s from "./orbitModelPicker.module.css";

type ModelOption = { id: string; label: string; hint: string };

function ModelItems({
  options,
  selected,
  onSelect,
}: {
  options: ModelOption[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <>
      {options.map((m) => (
        <Menu.Item
          key={m.id}
          onClick={() => onSelect(m.id)}
          rightSection={m.id === selected && <Check size={14} />}
        >
          <Text size="sm" fw={600}>{m.label}</Text>
          <Text size="xs" c="dimmed">{m.hint}</Text>
        </Menu.Item>
      ))}
    </>
  );
}

export function OrbitModelPicker({
  models,
  model,
  onModel,
  imageModels,
  imageModel,
  onImageModel,
  drawing,
}: {
  models: ModelOption[];
  model: string;
  onModel: (id: string) => void;
  imageModels: ModelOption[];
  imageModel: string;
  onImageModel: (id: string) => void;
  drawing: boolean;
}) {
  const current = drawing
    ? imageModels.find((m) => m.id === imageModel)
    : models.find((m) => m.id === model);

  return (
    <Menu position="bottom-end" radius="md" withinPortal zIndex={400}>
      <Menu.Target>
        <UnstyledButton className={`tile ${s.trigger}`} aria-label="Choose Orbit model">
          {current?.label ?? "Model"}
          <ChevronDown size={12} />
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>
        {models.length > 0 && <Menu.Label>Chat</Menu.Label>}
        <ModelItems options={models} selected={model} onSelect={onModel} />
        {imageModels.length > 0 && (
          <>
            <Menu.Divider />
            <Menu.Label>Image</Menu.Label>
          </>
        )}
        <ModelItems options={imageModels} selected={imageModel} onSelect={onImageModel} />
      </Menu.Dropdown>
    </Menu>
  );
}
