import { FileIcon, defaultStyles, type DefaultExtensionType } from "react-file-icon";

function extensionOf(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  return dot === -1 ? "" : fileName.slice(dot + 1).toLowerCase();
}

export function FileTypeIcon({ fileName, size = 22 }: { fileName: string; size?: number }) {
  const ext = extensionOf(fileName);
  const style = defaultStyles[ext as DefaultExtensionType];
  return (
    <span style={{ display: "inline-flex", width: size, height: size, flexShrink: 0 }}>
      <FileIcon extension={ext} {...style} />
    </span>
  );
}
