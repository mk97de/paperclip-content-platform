import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  src: string | null | undefined;
  alt?: string;
};

export function ScreenshotPreview({ src, alt = "Original-Screenshot" }: Props) {
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  if (!src || failed) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="block w-full overflow-hidden rounded-md border border-border bg-muted transition hover:opacity-90"
      >
        <img
          src={src}
          alt={alt}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="h-24 w-full object-cover"
        />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          <DialogTitle className="sr-only">{alt}</DialogTitle>
          <img
            src={src}
            alt={alt}
            referrerPolicy="no-referrer"
            className="w-full h-auto object-contain"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
