import { useMemo, useState } from "react";
import { useList } from "@refinedev/core";
import {
  Activity,
  BarChart3,
  Bookmark,
  Clock,
  Loader2,
  Sparkles,
} from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { CategoryFilter } from "@/components/shared/CategoryFilter";
import {
  KpiStatCard,
  type Delta,
} from "@/components/insights/KpiStatCard";
import {
  PeriodToggle,
  periodToDateRange,
  type Period,
} from "@/components/insights/PeriodToggle";
import {
  TopReelCard,
  type TopReel,
} from "@/components/insights/TopReelCard";

type PerformanceRow = TopReel & {
  captured_at: string | null;
  reach: number | null;
  save_rate: number | null;
  ig_reels_avg_watch_time_ms: number | null;
  viral_score: number | null;
};

type TierCount = { S: number; A: number; B: number; C: number; D: number };

function dedupeByMedia(rows: PerformanceRow[]): PerformanceRow[] {
  const byMedia = new Map<string, PerformanceRow>();
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

function tierCount(rows: PerformanceRow[]): TierCount {
  const t: TierCount = { S: 0, A: 0, B: 0, C: 0, D: 0 };
  for (const r of rows) {
    const tier = r.viral_tier as keyof TierCount | null;
    if (tier && tier in t) t[tier]++;
  }
  return t;
}

function deltaPct(cur: number | null, prev: number | null): Delta | null {
  if (cur == null || prev == null || prev === 0) return null;
  const pct = ((cur - prev) / prev) * 100;
  const direction = Math.abs(pct) < 0.5 ? "flat" : pct > 0 ? "up" : "down";
  return { value: `${pct > 0 ? "+" : ""}${pct.toFixed(1)}%`, direction };
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

export const InsightsPerformance = () => {
  const [period, setPeriod] = useState<Period>("30d");
  const [categories, setCategories] = useState<string[]>([]);

  const range = useMemo(() => periodToDateRange(period), [period]);

  const {
    result,
    query: { isLoading },
  } = useList<PerformanceRow>({
    resource: "ig_post_performance",
    filters: [
      {
        field: "ig_posted_at",
        operator: "gte",
        value: range.prevStart.toISOString(),
      },
    ] as never,
    sorters: [{ field: "captured_at", order: "desc" }],
    pagination: { pageSize: 500 },
  });

  const { currentReels, previousReels } = useMemo(() => {
    const raw = (result?.data ?? []) as PerformanceRow[];
    const deduped = dedupeByMedia(raw);
    const filtered = categories.length === 0
      ? deduped
      : deduped.filter((r) => r.category && categories.includes(r.category));

    const cur: PerformanceRow[] = [];
    const prev: PerformanceRow[] = [];
    for (const r of filtered) {
      if (!r.ig_posted_at) continue;
      const t = new Date(r.ig_posted_at).getTime();
      if (t >= range.start.getTime() && t <= range.end.getTime()) cur.push(r);
      else if (t >= range.prevStart.getTime() && t < range.start.getTime()) prev.push(r);
    }
    return { currentReels: cur, previousReels: prev };
  }, [result?.data, categories, range]);

  const kpis = useMemo(() => {
    const curEng = mean(currentReels.map((r) => r.engagement_rate));
    const prevEng = mean(previousReels.map((r) => r.engagement_rate));
    const curSave = mean(currentReels.map((r) => r.save_rate));
    const prevSave = mean(previousReels.map((r) => r.save_rate));
    const curWatchMs = mean(currentReels.map((r) => r.ig_reels_avg_watch_time_ms));
    const prevWatchMs = mean(previousReels.map((r) => r.ig_reels_avg_watch_time_ms));
    const curTiers = tierCount(currentReels);

    return {
      engagement: {
        value: curEng == null ? "—" : `${(curEng * 100).toFixed(1)}%`,
        delta: deltaAbs(
          curEng == null ? null : curEng * 100,
          prevEng == null ? null : prevEng * 100,
          "pp",
        ),
      },
      save: {
        value: curSave == null ? "—" : `${(curSave * 100).toFixed(1)}%`,
        delta: deltaAbs(
          curSave == null ? null : curSave * 100,
          prevSave == null ? null : prevSave * 100,
          "pp",
        ),
      },
      watch: {
        value: curWatchMs == null ? "—" : `${(curWatchMs / 1000).toFixed(1)}s`,
        delta: deltaAbs(
          curWatchMs == null ? null : curWatchMs / 1000,
          prevWatchMs == null ? null : prevWatchMs / 1000,
          "s",
        ),
      },
      tiers: curTiers,
      totalReels: currentReels.length,
    };
  }, [currentReels, previousReels]);

  const topReels = useMemo(
    () =>
      [...currentReels]
        .sort((a, b) => (b.viral_score ?? 0) - (a.viral_score ?? 0))
        .slice(0, 12),
    [currentReels],
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const tiersValue =
    `S:${kpis.tiers.S} A:${kpis.tiers.A} B:${kpis.tiers.B} C:${kpis.tiers.C}`;

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Performance</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {kpis.totalReels} Reels im Zeitraum
          </p>
        </div>
        <PeriodToggle value={period} onChange={setPeriod} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiStatCard
          label="Engagement-Rate"
          value={kpis.engagement.value}
          delta={kpis.engagement.delta}
          hint="Ø über Zeitraum"
          icon={<Activity className="h-4 w-4" />}
        />
        <KpiStatCard
          label="Save-Rate"
          value={kpis.save.value}
          delta={kpis.save.delta}
          hint="Ø über Zeitraum"
          icon={<Bookmark className="h-4 w-4" />}
        />
        <KpiStatCard
          label="Watch Time"
          value={kpis.watch.value}
          delta={kpis.watch.delta}
          hint="Ø pro Reel"
          icon={<Clock className="h-4 w-4" />}
        />
        <KpiStatCard
          label="Viral-Mix"
          value={tiersValue}
          hint={`D:${kpis.tiers.D}`}
          icon={<Sparkles className="h-4 w-4" />}
        />
      </div>

      <div className="flex items-center gap-2">
        <CategoryFilter value={categories} onChange={setCategories} />
      </div>

      {topReels.length === 0 ? (
        <EmptyState
          icon={<BarChart3 className="h-6 w-6" />}
          title="Keine Reels im Zeitraum"
          description="Passe Zeitraum oder Kategorien an."
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {topReels.map((reel) => (
            <TopReelCard key={reel.id} reel={reel} />
          ))}
        </div>
      )}
    </div>
  );
};
