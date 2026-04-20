import { useMemo, useState } from "react";
import { useList } from "@refinedev/core";
import { Loader2, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/EmptyState";
import { CategoryFilter } from "@/components/shared/CategoryFilter";
import {
  PeriodToggle,
  periodToDateRange,
  type Period,
} from "@/components/insights/PeriodToggle";
import { HookLengthScatter } from "@/components/insights/HookLengthScatter";
import {
  ReelsDataTable,
  type TableReel,
} from "@/components/insights/ReelsDataTable";

type AnalyseRow = TableReel & {
  ig_media_id: string | null;
  ig_posted_at: string | null;
  captured_at: string | null;
};

function dedupeByMedia(rows: AnalyseRow[]): AnalyseRow[] {
  const byMedia = new Map<string, AnalyseRow>();
  for (const r of rows) {
    const key = r.ig_media_id ?? r.id;
    const prev = byMedia.get(key);
    const prevTs = prev?.captured_at ? new Date(prev.captured_at).getTime() : 0;
    const curTs = r.captured_at ? new Date(r.captured_at).getTime() : 0;
    if (!prev || curTs > prevTs) byMedia.set(key, r);
  }
  return Array.from(byMedia.values());
}

export const InsightsAnalyse = () => {
  const [period, setPeriod] = useState<Period>("90d");
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const range = useMemo(() => periodToDateRange(period), [period]);

  const {
    result,
    query: { isLoading },
  } = useList<AnalyseRow>({
    resource: "ig_post_performance",
    filters: [
      { field: "ig_posted_at", operator: "gte", value: range.start.toISOString() },
    ] as never,
    sorters: [{ field: "captured_at", order: "desc" }],
    pagination: { pageSize: 500 },
    meta: { noStatus: true },
  });

  const filtered = useMemo(() => {
    const raw = (result?.data ?? []) as AnalyseRow[];
    const deduped = dedupeByMedia(raw);
    const lower = search.trim().toLowerCase();
    return deduped.filter((r) => {
      if (categories.length > 0 && !(r.category && categories.includes(r.category))) return false;
      if (lower && !(r.ig_caption_preview ?? "").toLowerCase().includes(lower)) return false;
      return true;
    });
  }, [result?.data, categories, search]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analyse</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filtered.length} Reels · forensische Deep-Dive-Ansicht
          </p>
        </div>
        <PeriodToggle value={period} onChange={setPeriod} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Hook / Caption suchen..."
            className="pl-8 h-9 text-sm"
          />
        </div>
        <CategoryFilter value={categories} onChange={setCategories} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Search className="h-6 w-6" />}
          title="Keine Reels gefunden"
          description="Passe Suchbegriff, Zeitraum oder Kategorien an."
        />
      ) : (
        <>
          <HookLengthScatter reels={filtered} />
          <ReelsDataTable reels={filtered} />
        </>
      )}
    </div>
  );
};
