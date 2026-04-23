import { useState } from "react";
import { ImageOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  src: string | null | undefined;
  alt?: string;
};

function Placeholder({ label }: { label: string }) {
  return (
    <div className="flex aspect-[9/16] w-full items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/40 text-[11px] text-muted-foreground">
      <ImageOff className="h-3.5 w-3.5" />
      {label}
    </div>
  );
}

export function ScreenshotPreview({ src, alt = "Original-Screenshot" }: Props) {
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);

  if (!src) return <Placeholder label="kein Thumbnail" />;
  if (failed) return <Placeholder label="Thumbnail abgelaufen" />;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="block w-full overflow-hidden rounded-md border border-border bg-black transition hover:opacity-90"
      >
        <img
          src={src}
          alt={alt}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="aspect-[9/16] w-full object-contain"
        />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-black">
          <DialogTitle className="sr-only">{alt}</DialogTitle>
          <img
            src={src}
            alt={alt}
            referrerPolicy="no-referrer"
            className="max-h-[85vh] w-full object-contain"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
