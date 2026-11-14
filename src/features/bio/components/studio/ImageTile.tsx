import { useState, type ReactNode } from "react";
import { Camera, Crop, ImagePlus, Trash2 } from "lucide-react";
import AvatarCropper from "@/shared/ui/AvatarCropper";
import { MediaPickerModal } from "@/features/media/components/MediaPickerModal";
import { useWorkspace } from "@/features/workspace/context";
import { useImageCrop } from "@/features/bio/hooks/useImageCrop";
import { PopoverPanel } from "./ui/PopoverPanel";
import list from "./ui/List.module.css";
import classes from "./Editor.module.css";

export function ImageTile({
  url,
  shape,
  placeholder,
  pickerTitle,
  onChange,
}: {
  url: string;
  shape: "circle" | "square";
  placeholder: ReactNode;
  pickerTitle: string;
  onChange: (url: string) => void;
}) {
  const { active } = useWorkspace();
  const [menu, setMenu] = useState(false);
  const noun = shape === "circle" ? "photo" : "artwork";
  const crop = useImageCrop(active?._id, shape === "circle" ? "bio-photo" : "bio-artwork", onChange);

  const tile = (
    <button
      type="button"
      className={classes.imageTile}
      data-shape={shape}
      aria-label={url ? `Edit ${noun}` : `Add ${noun}`}
      onClick={() => (url ? setMenu((open) => !open) : crop.openPicker())}
    >
      {url ? <img src={url} alt="" className={classes.imageFill} /> : placeholder}
      <span className={classes.imageOverlay} aria-hidden>
        <Camera size={18} />
      </span>
    </button>
  );

  return (
    <div className={classes.imageCol}>
      {url ? (
        <PopoverPanel opened={menu} onChange={setMenu} width={200} position="bottom-start" target={tile}>
          <div className={list.options}>
            <button
              type="button"
              className={list.option}
              onClick={() => {
                setMenu(false);
                crop.adjust(url);
              }}
            >
              <Crop size={15} />
              Adjust crop
            </button>
            <button
              type="button"
              className={list.option}
              onClick={() => {
                setMenu(false);
                crop.openPicker();
              }}
            >
              <ImagePlus size={15} />
              Replace {noun}
            </button>
            <button
              type="button"
              className={`${list.option} ${list.optionDanger}`}
              onClick={() => {
                setMenu(false);
                onChange("");
              }}
            >
              <Trash2 size={15} />
              Remove
            </button>
          </div>
        </PopoverPanel>
      ) : (
        tile
      )}

      <MediaPickerModal opened={crop.picking} onClose={crop.closePicker} kind="image" title={pickerTitle} onPick={crop.pick}
        onUploadFile={crop.cropUpload}
      />
      <AvatarCropper
        file={crop.cropFile}
        busy={crop.busy}
        title={shape === "circle" ? "Crop your photo" : "Crop your artwork"}
        shape={shape === "circle" ? "round" : "rect"}
        outputSize={shape === "circle" ? 400 : 800}
        onCancel={crop.cancelCrop}
        onConfirm={(blob) => void crop.save(blob)}
      />
    </div>
  );
}
