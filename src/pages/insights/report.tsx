import { useMemo } from "react";
import { useList } from "@refinedev/core";
import {
  Activity,
  BarChart3,
  Eye,
  FileText,
  Loader2,
  Trophy,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { KpiStatCard, type Delta } from "@/components/insights/KpiStatCard";
import { getAssetUrl } from "@/providers/directus";

type PerfRow = {
  id: string;
  ig_media_id: string | null;
  ig_shortcode: string | null;
  ig_permalink: string | null;
  ig_posted_at: string | null;
  thumbnail_url: string | null;
  ig_caption_preview: string | null;
  views: number | null;
  total_views: number | null;
  engagement_rate: number | null;
  viral_score: number | null;
  viral_tier: string | null;
  captured_at: string | null;
};

type PostRow = {
  id: string;
  hook_text: string | null;
  hook_pattern: string | null;
  status: string | null;
  published_date: string | null;
  date_created: string | null;
  date_updated: string | null;
  category: string | null;
};

function dedupeByMedia(rows: PerfRow[]): PerfRow[] {
  const byMedia = new Map<string, PerfRow>();
  for (const r of rows) {
    const key = r.ig_media_id ?? r.id;
    const prev = byMedia.get(key);
    const prevTs = prev?.captured_at ? new Date(prev.captured_at).getTime() : 0;
    const curTs = r.captured_at ? new Date(r.captured_at).getTime() : 0;
    if (!prev || curTs > prevTs) byMedia.set(key, r);
  }
  return Array.from(byMedia.values());
}

function mean(values: Array<number | null | undefined>): number | null {
  const ns = values.filter((v): v is number => typeof v === "number" && !Number.isNaN(v));
  if (ns.length === 0) return null;
  return ns.reduce((a, b) => a + b, 0) / ns.length;
}

function deltaInt(cur: number, prev: number, suffix = ""): Delta | null {
  const diff = cur - prev;
  const direction = diff === 0 ? "flat" : diff > 0 ? "up" : "down";
  return {
    value: `${diff > 0 ? "+" : ""}${diff}${suffix}`,
    direction,
  };
}

function deltaAbs(
  cur: number | null,
  prev: number | null,
  suffix = "",
  decimals = 1,
): Delta | null {
  if (cur == null || prev == null) return null;
  const diff = cur - prev;
  const direction = Math.abs(diff) < 0.05 ? "flat" : diff > 0 ? "up" : "down";
  return {
    value: `${diff > 0 ? "+" : ""}${diff.toFixed(decimals)}${suffix}`,
    direction,
  };
}

function formatViews(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return `${n}`;
}

export const InsightsReport = () => {
  const now = useMemo(() => Date.now(), []);
  const startCur = useMemo(() => new Date(now - 7 * 86_400_000), [now]);
  const startPrev = useMemo(() => new Date(now - 14 * 86_400_000), [now]);

  const {
    result: perfResult,
    query: { isLoading: perfLoading },
  } = useList<PerfRow>({
    resource: "ig_post_performance",
    filters: [
      {
        field: "ig_posted_at",
        operator: "gte",
        value: startPrev.toISOString(),
      },
    ] as never,
    sorters: [{ field: "captured_at", order: "desc" }],
    pagination: { pageSize: 500 },
    meta: { noStatus: true },
  });

  const {
    result: postsResult,
    query: { isLoading: postsLoading },
  } = useList<PostRow>({
    resource: "content_posts",
    filters: [
      {
        field: "date_updated",
        operator: "gte",
        value: startCur.toISOString(),
      },
    ] as never,
    sorters: [{ field: "date_updated", order: "desc" }],
    pagination: { pageSize: 200 },
    meta: { noStatus: true },
  });

  const { current, previous } = useMemo(() => {
    const raw = (perfResult?.data ?? []) as PerfRow[];
    const deduped = dedupeByMedia(
      raw.map((r) => ({ ...r, views: r.total_views ?? r.views })),
    );
    const cur: PerfRow[] = [];
    const prev: PerfRow[] = [];
    for (const r of deduped) {
      if (!r.ig_posted_at) continue;
      const t = new Date(r.ig_posted_at).getTime();
      if (t >= startCur.getTime()) cur.push(r);
      else if (t >= startPrev.getTime()) prev.push(r);
    }
    return { current: cur, previous: prev };
  }, [perfResult?.data, startCur, startPrev]);

  const posts = useMemo(
    () => (postsResult?.data ?? []) as PostRow[],
    [postsResult?.data],
  );

  const kpis = useMemo(() => {
    const curViews = mean(current.map((r) => r.views));
    const prevViews = mean(previous.map((r) => r.views));
    const curEng = mean(current.map((r) => r.engagement_rate));
    const prevEng = mean(previous.map((r) => r.engagement_rate));
    const topViews = current.reduce<number>(
      (max, r) => Math.max(max, r.views ?? 0),
      0,
    );

    return {
      posts: {
        value: `${current.length}`,
        delta: deltaInt(current.length, previous.length),
      },
      avgViews: {
        value: curViews == null ? "—" : formatViews(Math.round(curViews)),
        delta:
          curViews != null && prevViews != null
            ? {
                value: `${curViews > prevViews ? "+" : ""}${formatViews(Math.round(curViews - prevViews))}`,
                direction: (Math.abs(curViews - prevViews) < 1
                  ? "flat"
                  : curViews > prevViews
                    ? "up"
                    : "down") as Delta["direction"],
              }
            : null,
      },
      avgEng: {
        value: curEng == null ? "—" : `${(curEng * 100).toFixed(1)}%`,
        delta: deltaAbs(
          curEng == null ? null : curEng * 100,
          prevEng == null ? null : prevEng * 100,
          "pp",
        ),
      },
      topViews: {
        value: topViews > 0 ? formatViews(topViews) : "—",
        delta: null,
      },
    };
  }, [current, previous]);

  const patternStats = useMemo(() => {
    // content_posts groupBy hook_pattern, count only (no views available without join)
    const map = new Map<string, number>();
    for (const p of posts) {
      const k = p.hook_pattern || "(ohne Pattern)";
      map.set(k, (map.get(k) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .filter(([, n]) => n >= 2)
      .map(([pattern, count]) => ({ pattern, count }))
      .sort((a, b) => b.count - a.count);
  }, [posts]);

  const top3 = useMemo(
    () =>
      [...current]
        .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
        .slice(0, 3),
    [current],
  );

  if (perfLoading || postsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Weekly Report</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Performance der letzten 7 Tage · Vergleich zur Vorwoche
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiStatCard
          label="Posts diese Woche"
          value={kpis.posts.value}
          delta={kpis.posts.delta}
          hint="vs Vorwoche"
          icon={<FileText className="h-4 w-4" />}
        />
        <KpiStatCard
          label="Ø Views"
          value={kpis.avgViews.value}
          delta={kpis.avgViews.delta}
          hint="pro Reel"
          icon={<Eye className="h-4 w-4" />}
        />
        <KpiStatCard
          label="Ø Engagement"
          value={kpis.avgEng.value}
          delta={kpis.avgEng.delta}
          hint="Engagement-Rate"
          icon={<Activity className="h-4 w-4" />}
        />
        <KpiStatCard
          label="Top-Performer"
          value={kpis.topViews.value}
          hint={top3[0]?.ig_caption_preview?.slice(0, 30) ?? "—"}
          icon={<Trophy className="h-4 w-4" />}
        />
      </div>

      <Card>
        <CardContent className="pt-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">
              Posts nach Hook-Pattern
            </h2>
            <span className="text-xs text-muted-foreground">
              {posts.length} Posts in 7T · nur Patterns ≥ 2
            </span>
          </div>
          {patternStats.length === 0 ? (
            <EmptyState
              icon={<BarChart3 className="h-5 w-5" />}
              title="Noch keine wiederkehrenden Pattern"
              description="Brauche ≥ 2 Posts pro Pattern für Aggregation."
            />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={patternStats}
                  layout="vertical"
                  margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="pattern"
                    width={140}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-base font-semibold">Top-3 dieser Woche</h2>
        {top3.length === 0 ? (
          <EmptyState
            icon={<Trophy className="h-5 w-5" />}
            title="Noch keine Posts diese Woche"
            description="Sobald neue Reels gepostet und gepollt sind, erscheinen sie hier."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {top3.map((r, i) => (
              <TopReelTile key={r.id} reel={r} rank={i + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

function TopReelTile({ reel, rank }: { reel: PerfRow; rank: number }) {
  const open = () => {
    if (reel.ig_permalink && typeof window !== "undefined") {
      window.open(reel.ig_permalink, "_blank", "noopener,noreferrer");
    }
  };
  const thumb = reel.thumbnail_url ?? getAssetUrl(reel.ig_media_id);
  return (
    <button
      type="button"
      onClick={open}
      className="group flex flex-col text-left rounded-lg border bg-card overflow-hidden hover:border-primary/40 hover:shadow-md transition-all"
    >
      <div className="relative aspect-[9/16] bg-muted overflow-hidden">
        {thumb ? (
          <img
            src={thumb}
            alt={reel.ig_caption_preview?.slice(0, 60) ?? "Reel"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-xs text-muted-foreground">
            kein Thumbnail
          </div>
        )}
        <div className="absolute top-2 left-2 h-7 w-7 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center text-xs font-bold border-2 border-white">
          {rank}
        </div>
        <div className="absolute bottom-2 right-2 text-[10px] font-medium text-white bg-black/60 backdrop-blur px-1.5 py-0.5 rounded">
          {formatViews(reel.views)} Views
        </div>
      </div>
      <div className="p-3 space-y-1">
        <p className="text-sm leading-snug line-clamp-3 font-medium">
          {reel.ig_caption_preview ?? "(ohne Caption)"}
        </p>
        <p className="text-[11px] text-muted-foreground">
          {reel.ig_posted_at
            ? new Date(reel.ig_posted_at).toLocaleDateString("de-DE", {
                day: "2-digit",
                month: "short",
              })
            : ""}
        </p>
      </div>
    </button>
  );
}
