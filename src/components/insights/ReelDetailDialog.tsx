import { useState, useEffect } from "react";
import { useUpdate } from "@refinedev/core";
import {
  Copy,
  ExternalLink,
  Eye,
  Heart,
  Bookmark,
  Share2,
  Clock,
  TrendingDown,
  UserPlus,
  Sparkles,
  RotateCw,
  Loader2,
  Check,
} from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CategoryBadge } from "@/components/ideas/CategoryBadge";
import { cn } from "@/lib/utils";

export type DetailReel = {
  id: string;
  ig_media_id: string | null;
  ig_shortcode: string | null;
  ig_permalink: string | null;
  ig_posted_at: string | null;
  ig_caption_preview: string | null;
  thumbnail_url: string | null;
  category: string | null;
  viral_tier: string | null;
  is_trial_reel: boolean | null;
  views: number | null;
  reach: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  saved: number | null;
  engagement_rate: number | null;
  save_rate: number | null;
  reels_skip_rate: number | null;
  ig_reels_avg_watch_time_ms: number | null;
  follower_delta_24h: number | null;
  follower_delta_source: string | null;
  follower_delta_captured_at: string | null;
  ai_commentary: string | null;
  ai_hook_score: number | null;
  ai_drop_off_hypothesis: string | null;
  ai_analyzed_at: string | null;
  ai_analysis_version: number | null;
};

const TIER_COLOR: Record<string, string> = {
  S: "bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-900/40 dark:text-amber-200 dark:border-amber-800/60",
  A: "bg-emerald-100 text-emerald-900 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-800/60",
  B: "bg-sky-100 text-sky-900 border-sky-200 dark:bg-sky-900/40 dark:text-sky-200 dark:border-sky-800/60",
  C: "bg-slate-100 text-slate-900 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700",
  D: "bg-rose-100/60 text-rose-900 border-rose-200 dark:bg-rose-900/30 dark:text-rose-200 dark:border-rose-900/60",
};

function fmtNum(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
}

function fmtPct(v: number | null, multiplier = 100): string {
  if (v == null) return "—";
  return `${(v * multiplier).toFixed(1)}%`;
}

function fmtWatch(v: number | null): string {
  if (v == null) return "—";
  return `${(v / 1000).toFixed(1)}s`;
}

function fmtDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function hookScoreColor(score: number | null): string {
  if (score == null) return "bg-muted text-muted-foreground";
  if (score >= 8) return "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200";
  if (score >= 6) return "bg-sky-100 text-sky-900 dark:bg-sky-900/40 dark:text-sky-200";
  if (score >= 4) return "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200";
  return "bg-rose-100 text-rose-900 dark:bg-rose-900/40 dark:text-rose-200";
}

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  reel: DetailReel | null;
};

export function ReelDetailDialog({ open, onOpenChange, reel }: Props) {
  const [followerInput, setFollowerInput] = useState("");
  const [copied, setCopied] = useState(false);

  const { mutate: updateReel, mutation: { isPending: isSaving } } = useUpdate();

  useEffect(() => {
    if (reel) {
      setFollowerInput(
        reel.follower_delta_24h != null ? String(reel.follower_delta_24h) : ""
      );
      setCopied(false);
    }
  }, [reel]);

  if (!reel) return null;

  const copyShortcode = async () => {
    if (!reel.ig_shortcode) return;
    try {
      await navigator.clipboard.writeText(reel.ig_shortcode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Konnte nicht kopieren");
    }
  };

  const saveFollowerDelta = () => {
    const trimmed = followerInput.trim();
    const parsed = trimmed === "" ? null : Number(trimmed);
    if (parsed != null && (!Number.isFinite(parsed) || parsed < 0)) {
      toast.error("Bitte eine nicht-negative Zahl eintragen (oder leer lassen)");
      return;
    }
    updateReel(
      {
        resource: "ig_post_performance",
        id: reel.id,
        values: {
          follower_delta_24h: parsed,
          follower_delta_source: parsed != null ? "manual" : null,
          follower_delta_captured_at: parsed != null ? new Date().toISOString() : null,
        },
        meta: { noStatus: true },
        successNotification: false,
      },
      {
        onSuccess: () => toast.success("Follower-Zahl gespeichert"),
        onError: (e) => toast.error(`Fehler: ${e.message}`),
      }
    );
  };

  const requestReanalysis = () => {
    updateReel(
      {
        resource: "ig_post_performance",
        id: reel.id,
        values: { request_reanalysis: true },
        meta: { noStatus: true },
        successNotification: false,
      },
      {
        onSuccess: () => toast.success("Neue Analyse angefordert"),
        onError: (e) => toast.error(`Fehler: ${e.message}`),
      }
    );
  };

  const tierClass = reel.viral_tier
    ? TIER_COLOR[reel.viral_tier] ?? "bg-muted text-foreground"
    : "bg-muted text-foreground";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[92vh] p-0 gap-0">
        <DialogHeader className="px-6 pt-5 pb-3 border-b border-border/50">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                {reel.viral_tier && (
                  <Badge className={cn("border text-[11px] font-bold", tierClass)}>
                    {reel.viral_tier}
                  </Badge>
                )}
                <CategoryBadge category={reel.category} className="text-[10px]" />
                {reel.is_trial_reel && (
                  <Badge variant="outline" className="text-[10px]">Trial</Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  {fmtDate(reel.ig_posted_at)}
                </span>
              </div>
              <DialogTitle className="text-sm font-mono flex items-center gap-2">
                <span className="text-muted-foreground">ID:</span>
                <span>{reel.ig_shortcode ?? "—"}</span>
                {reel.ig_shortcode && (
                  <button
                    onClick={copyShortcode}
                    className="inline-flex items-center justify-center h-5 w-5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                    title="Shortcode kopieren"
                  >
                    {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                  </button>
                )}
              </DialogTitle>
            </div>
            {reel.ig_permalink && (
              <Button variant="outline" size="sm" asChild className="shrink-0">
                <a href={reel.ig_permalink} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                  Auf Instagram
                </a>
              </Button>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(92vh-80px)]">
          <div className="px-6 py-5 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-5">
              <div className="aspect-[9/16] rounded-md overflow-hidden bg-muted shrink-0">
                {reel.thumbnail_url ? (
                  <img
                    src={reel.thumbnail_url}
                    alt=""
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">
                    kein Thumbnail
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <Kpi icon={<Eye className="h-3.5 w-3.5" />} label="Views" value={fmtNum(reel.views)} />
                <Kpi icon={<Eye className="h-3.5 w-3.5 opacity-60" />} label="Reach" value={fmtNum(reel.reach)} />
                <Kpi
                  icon={<UserPlus className="h-3.5 w-3.5" />}
                  label="Follower +"
                  value={reel.follower_delta_24h != null ? fmtNum(reel.follower_delta_24h) : "—"}
                  emphasis
                />
                <Kpi icon={<Heart className="h-3.5 w-3.5" />} label="Engagement" value={fmtPct(reel.engagement_rate)} />
                <Kpi icon={<Bookmark className="h-3.5 w-3.5" />} label="Save" value={fmtPct(reel.save_rate)} />
                <Kpi icon={<Share2 className="h-3.5 w-3.5" />} label="Shares" value={fmtNum(reel.shares)} />
                <Kpi icon={<TrendingDown className="h-3.5 w-3.5" />} label="Skip" value={fmtPct(reel.reels_skip_rate, 1)} />
                <Kpi icon={<Clock className="h-3.5 w-3.5" />} label="Watch" value={fmtWatch(reel.ig_reels_avg_watch_time_ms)} />
                <Kpi icon={<Heart className="h-3.5 w-3.5 opacity-60" />} label="Likes" value={fmtNum(reel.likes)} />
              </div>
            </div>

            <Separator />

            <section className="space-y-2">
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                Caption
              </h3>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {reel.ig_caption_preview ?? "(keine Caption)"}
              </p>
            </section>

            <Separator />

            <section className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-medium inline-flex items-center gap-1.5">
                  <UserPlus className="h-3.5 w-3.5" />
                  Follower gewonnen (manuell)
                </h3>
                {reel.follower_delta_captured_at && (
                  <span className="text-[10px] text-muted-foreground">
                    Eingetragen {fmtDate(reel.follower_delta_captured_at)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={followerInput}
                  onChange={(e) => setFollowerInput(e.target.value)}
                  placeholder="z.B. 24"
                  className="max-w-[140px]"
                />
                <Button size="sm" onClick={saveFollowerDelta} disabled={isSaving}>
                  {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Speichern"}
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Aus der Instagram Edits App oder Business Suite abgelesen. Leer lassen = unbekannt.
              </p>
            </section>

            <Separator />

            <section className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-medium inline-flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  AI-Analyse
                </h3>
                {reel.ai_analyzed_at && (
                  <span className="text-[10px] text-muted-foreground">
                    Analysiert {fmtDate(reel.ai_analyzed_at)}
                    {reel.ai_analysis_version && reel.ai_analysis_version > 1 ? ` · v${reel.ai_analysis_version}` : ""}
                  </span>
                )}
              </div>

              {reel.ai_commentary ? (
                <div className="space-y-3">
                  {reel.ai_hook_score != null && (
                    <div className="inline-flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Hook-Score:</span>
                      <Badge className={cn("text-xs font-bold", hookScoreColor(reel.ai_hook_score))}>
                        {reel.ai_hook_score}/10
                      </Badge>
                    </div>
                  )}
                  <div className="text-sm leading-relaxed whitespace-pre-wrap rounded-md border border-border/60 bg-muted/30 p-3">
                    {reel.ai_commentary}
                  </div>
                  {reel.ai_drop_off_hypothesis && (
                    <div className="text-xs rounded-md border border-border/60 bg-muted/20 p-3 space-y-1">
                      <p className="uppercase tracking-wider text-muted-foreground font-medium text-[10px]">
                        Drop-off-Hypothese
                      </p>
                      <p className="leading-relaxed">{reel.ai_drop_off_hypothesis}</p>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={requestReanalysis}
                    disabled={isSaving}
                  >
                    <RotateCw className="h-3.5 w-3.5 mr-1.5" />
                    Neu analysieren lassen
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  Wird 4 Tage nach Posting automatisch analysiert.
                </p>
              )}
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function Kpi({
  label,
  value,
  icon,
  emphasis,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  emphasis?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-md border border-border/60 px-2.5 py-2 space-y-0.5",
        emphasis && "bg-primary/5 border-primary/30"
      )}
    >
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <p
        className={cn(
          "text-sm font-semibold tabular-nums",
          emphasis && "text-primary"
        )}
      >
        {value}
      </p>
    </div>
  );
}
