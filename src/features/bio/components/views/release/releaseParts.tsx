import { Disc3 } from "lucide-react";

export function ReleaseArt({ url, title, className, imageClassName }: { url: string; title: string; className: string; imageClassName: string }) {
  return (
    <div className={className}>
      {url ? <img src={url} alt={title} className={imageClassName} /> : <Disc3 size={56} strokeWidth={1.2} aria-hidden />}
    </div>
  );
}

export function ArtBackdrop({ url, backdropClassName, scrimClassName }: { url: string; backdropClassName: string; scrimClassName: string }) {
  return (
    <>
      {url && <img src={url} alt="" aria-hidden className={backdropClassName} />}
      <div className={scrimClassName} data-art={url ? true : undefined} aria-hidden />
    </>
  );
}
