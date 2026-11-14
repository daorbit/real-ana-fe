import { Button, Group, Loader, Modal } from "@mantine/core";
import { Download } from "lucide-react";
import { useQrCode } from "@/features/bio/hooks/useQrCode";
import { publicBioDisplay, publicBioUrl } from "@/features/bio/lib/bioOptions";
import { qrUrl } from "@/features/bio/lib/bioSource";
import type { BioPage } from "@/features/bio/types";
import classes from "./QrDialog.module.css";

export function QrDialog({ page, onClose }: { page: Pick<BioPage, "slug" | "title"> | null; onClose: () => void }) {
  const { image, downloadPng, downloadSvg } = useQrCode(page ? qrUrl(publicBioUrl(page.slug)) : null);
  const filename = page ? `qr-${page.slug}` : "qr";

  return (
    <Modal opened={Boolean(page)} onClose={onClose} title="QR code" centered size="sm">
      <div className={classes.body}>
        <div className={classes.code}>
          {image ? <img src={image} alt={`QR code for ${page?.title ?? "this page"}`} className={classes.image} /> : <Loader size="sm" />}
        </div>
        {page && <span className={classes.address}>{publicBioDisplay(page.slug)}</span>}
        <p className={classes.note}>Scans are counted as their own source, so you can see how many came from print.</p>
        <Group grow gap="xs" className={classes.actions}>
          <Button variant="default" leftSection={<Download size={15} />} disabled={!image} onClick={() => void downloadPng(filename)}>
            PNG
          </Button>
          <Button variant="default" leftSection={<Download size={15} />} disabled={!image} onClick={() => downloadSvg(filename)}>
            SVG
          </Button>
        </Group>
      </div>
    </Modal>
  );
}
