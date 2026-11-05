import { useState } from "react";
import { Button, SegmentedControl, Slider, Switch, Text, TextInput, Textarea } from "@mantine/core";
import { AlignCenter, AlignLeft, AlignRight, Image as ImageIcon } from "lucide-react";
import { MediaPickerModal } from "@/features/media/components/MediaPickerModal";
import type { EmailAlign, EmailBlock } from "@/features/campaigns/types";
import classes from "./Editor.module.css";

interface Props {
  block: EmailBlock;
  onChange: (patch: Partial<EmailBlock>) => void;
}

const ALIGN_OPTIONS = [
  { value: "left", label: <AlignLeft size={15} aria-label="Left" /> },
  { value: "center", label: <AlignCenter size={15} aria-label="Center" /> },
  { value: "right", label: <AlignRight size={15} aria-label="Right" /> },
];

function AlignField({ value, onChange }: { value: EmailAlign; onChange: (value: EmailAlign) => void }) {
  return (
    <SegmentedControl size="xs" fullWidth data={ALIGN_OPTIONS} value={value} onChange={(next) => onChange(next as EmailAlign)} aria-label="Alignment" />
  );
}

function SliderField({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (value: number) => void }) {
  return (
    <div>
      <Text size="sm" fw={500} mb={6}>{label}: {value}</Text>
      <Slider min={min} max={max} value={value} onChange={onChange} label={null} aria-label={label} />
    </div>
  );
}

function ImageFields({ block, onChange }: { block: Extract<EmailBlock, { type: "image" }>; onChange: Props["onChange"] }) {
  const [picking, setPicking] = useState(false);
  return (
    <>
      <Button variant="default" leftSection={<ImageIcon size={15} />} onClick={() => setPicking(true)}>
        {block.url ? "Change image" : "Choose an image"}
      </Button>
      <TextInput label="Or paste an image address" placeholder="https://" value={block.url} onChange={(e) => onChange({ url: e.currentTarget.value })} />
      <TextInput label="Description" description="Shown when images are blocked." value={block.alt} onChange={(e) => onChange({ alt: e.currentTarget.value })} />
      <TextInput label="Link" placeholder="https://" value={block.link} onChange={(e) => onChange({ link: e.currentTarget.value })} />
      <SliderField label="Width %" value={block.width} min={20} max={100} onChange={(width) => onChange({ width })} />
      <SliderField label="Corner radius" value={block.radius} min={0} max={32} onChange={(radius) => onChange({ radius })} />
      <MediaPickerModal opened={picking} onClose={() => setPicking(false)} onPick={(asset) => onChange({ url: asset.url })} kind="image" title="Choose an image" />
    </>
  );
}

export function BlockFields({ block, onChange }: Props) {
  switch (block.type) {
    case "brand":
      return (
        <>
          <AlignField value={block.align} onChange={(align) => onChange({ align })} />
          <Text size="xs" c="dimmed">Change your logo and name in Branding.</Text>
        </>
      );
    case "heading":
      return (
        <>
          <Textarea aria-label="Heading text" autosize minRows={2} value={block.text} onChange={(e) => onChange({ text: e.currentTarget.value })} />
          <SegmentedControl
            size="xs"
            fullWidth
            aria-label="Heading size"
            data={[{ value: "s", label: "Small" }, { value: "m", label: "Medium" }, { value: "l", label: "Large" }, { value: "xl", label: "Huge" }]}
            value={block.size}
            onChange={(size) => onChange({ size } as Partial<EmailBlock>)}
          />
          <AlignField value={block.align} onChange={(align) => onChange({ align })} />
        </>
      );
    case "text":
      return (
        <>
          <Textarea
            aria-label="Text"
            description="Use **bold**. Write {{name}} for the person's name. Links become clickable."
            autosize
            minRows={4}
            value={block.text}
            onChange={(e) => onChange({ text: e.currentTarget.value })}
          />
          <SegmentedControl
            size="xs"
            fullWidth
            aria-label="Text size"
            data={[{ value: "s", label: "Small" }, { value: "m", label: "Medium" }, { value: "l", label: "Large" }]}
            value={block.size}
            onChange={(size) => onChange({ size } as Partial<EmailBlock>)}
          />
          <AlignField value={block.align} onChange={(align) => onChange({ align })} />
        </>
      );
    case "button":
      return (
        <>
          <div className={classes.inlineRow}>
            <TextInput label="Button text" value={block.label} onChange={(e) => onChange({ label: e.currentTarget.value })} />
            <TextInput label="Link" placeholder="https://" value={block.url} onChange={(e) => onChange({ url: e.currentTarget.value })} />
          </div>
          <AlignField value={block.align} onChange={(align) => onChange({ align })} />
          <Switch label="Full width" checked={block.fullWidth} onChange={(e) => onChange({ fullWidth: e.currentTarget.checked })} />
        </>
      );
    case "image":
      return <ImageFields block={block} onChange={onChange} />;
    case "spacer":
      return <SliderField label="Height" value={block.height} min={4} max={120} onChange={(height) => onChange({ height })} />;
    case "columns":
      return (
        <div className={classes.inlineRow}>
          <TextInput label="Left title" value={block.leftTitle} onChange={(e) => onChange({ leftTitle: e.currentTarget.value })} />
          <TextInput label="Right title" value={block.rightTitle} onChange={(e) => onChange({ rightTitle: e.currentTarget.value })} />
          <Textarea label="Left text" autosize minRows={3} value={block.leftText} onChange={(e) => onChange({ leftText: e.currentTarget.value })} />
          <Textarea label="Right text" autosize minRows={3} value={block.rightText} onChange={(e) => onChange({ rightText: e.currentTarget.value })} />
        </div>
      );
    case "divider":
      return null;
  }
}
