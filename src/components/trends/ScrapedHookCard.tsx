import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getAssetUrl } from "@/providers/directus";

export type ScrapedHook = {
  id: number;
  account_username: string | null;
  hook_text: string | null;
  visual_hook_text: string | null;
  spoken_hook: string | null;
  viral_tier: "S" | "A" | "B" | "C" | "D" | null;
  viral_score: number | null;
  views_count: number | null;
  posted_at: string | null;
  roll_type: string | null;
  thumbnail_file: string | null;
  thumbnail_url: string | null;
  post_url: string | null;
};

const TIER_STYLE: Record<string, string> = {
  S: "bg-amber-300 text-amber-950 border-amber-400 dark:bg-amber-400/90 dark:text-amber-950",
  A: "bg-zinc-200 text-zinc-900 border-zinc-300 dark:bg-zinc-300 dark:text-zinc-900",
  B: "bg-orange-200 text-orange-950 border-orange-300 dark:bg-orange-300 dark:text-orange-950",
  C: "bg-muted text-muted-foreground border-border",
  D: "bg-muted/60 text-muted-foreground/80 border-border",
};

function formatViews(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return `${n}`;
}

function relativeDate(iso: string | null): string {
  if (!iso) return "";
  const ms = Date.now() - new Date(iso).getTime();
  const days = Math.floor(ms / 86_400_000);
  if (days < 1) return "heute";
  if (days === 1) return "gestern";
  if (days < 7) return `vor ${days}T`;
  if (days < 30) return `vor ${Math.floor(days / 7)}W`;
  return `vor ${Math.floor(days / 30)}M`;
}

export function ScrapedHookCard({ hook }: { hook: ScrapedHook }) {
  const thumbSrc =
    getAssetUrl(hook.thumbnail_file) ?? hook.thumbnail_url ?? null;
  const text =
    hook.hook_text || hook.visual_hook_text || hook.spoken_hook || "—";
  const tierStyle = hook.viral_tier
    ? TIER_STYLE[hook.viral_tier] ?? TIER_STYLE.C
    : TIER_STYLE.C;

  const open = () => {
    if (hook.post_url && typeof window !== "undefined") {
      window.open(hook.post_url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <button
      type="button"
      onClick={open}
      className="group flex flex-col text-left rounded-lg border bg-card overflow-hidden hover:border-primary/40 hover:shadow-md transition-all"
    >
      <div className="relative aspect-[9/16] bg-muted overflow-hidden">
        {thumbSrc ? (
          <img
            src={thumbSrc}
            alt={text.slice(0, 60)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-xs text-muted-foreground">
            kein Thumbnail
          </div>
        )}
        {hook.viral_tier && (
          <Badge
            className={`absolute top-2 left-2 text-[10px] font-bold px-1.5 py-0 border ${tierStyle}`}
          >
            {hook.viral_tier}
          </Badge>
        )}
        <div className="absolute bottom-2 right-2 text-[10px] font-medium text-white bg-black/60 backdrop-blur px-1.5 py-0.5 rounded">
          {formatViews(hook.views_count)} Views
        </div>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="h-6 w-6 rounded-full bg-black/60 backdrop-blur flex items-center justify-center">
            <ExternalLink className="h-3 w-3 text-white" />
          </div>
        </div>
      </div>
      <div className="p-3 space-y-1.5">
        <p className="text-sm leading-snug line-clamp-3 font-medium">
          {text}
        </p>
        <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
          <span className="truncate">@{hook.account_username ?? "?"}</span>
          <span className="shrink-0">{relativeDate(hook.posted_at)}</span>
        </div>
      </div>
    </button>
  );
}
