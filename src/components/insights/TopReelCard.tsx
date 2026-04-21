import { ExternalLink, Eye, Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CategoryBadge } from "@/components/ideas/CategoryBadge";
import { cn } from "@/lib/utils";

const TIER_COLOR: Record<string, string> = {
  S: "bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-900/40 dark:text-amber-200 dark:border-amber-800/60",
  A: "bg-emerald-100 text-emerald-900 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-800/60",
  B: "bg-sky-100 text-sky-900 border-sky-200 dark:bg-sky-900/40 dark:text-sky-200 dark:border-sky-800/60",
  C: "bg-slate-100 text-slate-900 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700",
  D: "bg-rose-100/60 text-rose-900 border-rose-200 dark:bg-rose-900/30 dark:text-rose-200 dark:border-rose-900/60",
};

export type TopReel = {
  id: string;
  ig_media_id: string | null;
  ig_shortcode: string | null;
  ig_permalink: string | null;
  ig_posted_at: string | null;
  thumbnail_url: string | null;
  ig_caption_preview: string | null;
  views: number | null;
  engagement_rate: number | null;
  viral_tier: string | null;
  category: string | null;
  is_trial_reel: boolean | null;
};

function formatNumber(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
}

type TopReelCardProps = {
  reel: TopReel;
  onClick?: (reel: TopReel) => void;
};

export function TopReelCard({ reel, onClick }: TopReelCardProps) {
  const tierClass = reel.viral_tier
    ? TIER_COLOR[reel.viral_tier] ?? "bg-muted text-foreground"
    : "bg-muted text-foreground";

  const CardInner = (
    <>
      <div className="relative aspect-[9/16] w-full overflow-hidden bg-muted">
        {reel.thumbnail_url ? (
          <img
            src={reel.thumbnail_url}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs">
            kein Thumbnail
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

        {reel.viral_tier && (
          <Badge className={cn("absolute top-2 left-2 border text-[10px] font-bold", tierClass)}>
            {reel.viral_tier}
          </Badge>
        )}
        {reel.is_trial_reel && (
          <Badge
            variant="outline"
            className="absolute top-2 right-2 text-[9px] bg-background/80 backdrop-blur"
          >
            Trial
          </Badge>
        )}

        <div className="absolute bottom-2 left-2 right-2 space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-medium text-white">
            <span className="inline-flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {formatNumber(reel.views)}
            </span>
            {reel.engagement_rate != null && (
              <span className="inline-flex items-center gap-1">
                <Heart className="h-3 w-3" />
                {(reel.engagement_rate * 100).toFixed(1)}%
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-3 space-y-2">
        <p className="text-xs leading-snug line-clamp-3 min-h-[3em]">
          {reel.ig_caption_preview ?? "(kein Caption)"}
        </p>
        <div className="flex items-center justify-between gap-2">
          <CategoryBadge category={reel.category} className="text-[9px] py-0 px-1.5" />
          {reel.ig_permalink && <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />}
        </div>
      </div>
    </>
  );

  const baseCls =
    "overflow-hidden border-border/60 transition-colors hover:border-border";

  if (onClick) {
    return (
      <button
        type="button"
        onClick={() => onClick(reel)}
        className="block text-left w-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
      >
        <Card className={cn(baseCls, "hover:shadow-md")}>{CardInner}</Card>
      </button>
    );
  }

  if (reel.ig_permalink) {
    return (
      <a
        href={reel.ig_permalink}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <Card className={baseCls}>{CardInner}</Card>
      </a>
    );
  }
  return <Card className={baseCls}>{CardInner}</Card>;
}
