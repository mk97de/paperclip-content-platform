import { useMemo, useState } from "react";
import { useList } from "@refinedev/core";
import { Loader2, TrendingUp } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import {
  ScrapedHookCard,
  type ScrapedHook,
} from "@/components/trends/ScrapedHookCard";

type Tier = "S" | "A" | "B" | "C" | "all";
type Period = "7d" | "14d" | "28d" | "all";

const PERIOD_DAYS: Record<Period, number | null> = {
  "7d": 7,
  "14d": 14,
  "28d": 28,
  all: null,
};

export const TrendsTop = () => {
  const [tier, setTier] = useState<Tier>("all");
  const [period, setPeriod] = useState<Period>("28d");

  const sinceIso = useMemo(() => {
    const days = PERIOD_DAYS[period];
    if (days == null) return null;
    return new Date(Date.now() - days * 86_400_000).toISOString();
  }, [period]);

  const filters = useMemo(() => {
    const f: Array<{ field: string; operator: string; value: unknown }> = [];
    if (sinceIso) {
      f.push({ field: "posted_at", operator: "gte", value: sinceIso });
    }
    if (tier !== "all") {
      f.push({ field: "viral_tier", operator: "eq", value: tier });
    }
    return f;
  }, [sinceIso, tier]);

  const {
    result,
    query: { isLoading },
  } = useList<ScrapedHook>({
    resource: "scraped_hooks",
    filters: filters as never,
    sorters: [{ field: "viral_score", order: "desc" }],
    pagination: { pageSize: 30 },
    meta: { noStatus: true },
  });

  const hooks = (result?.data ?? []) as ScrapedHook[];

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Top Performer
          </h1>
          <p className="text-sm text-muted-foreground">
            Top-30 scraped Hooks sortiert nach Viral-Score
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <TierPills value={tier} onChange={setTier} />
        <div className="h-6 w-px bg-border mx-2" aria-hidden />
        <PeriodPills value={period} onChange={setPeriod} />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : hooks.length === 0 ? (
        <EmptyState
          icon={<TrendingUp className="h-6 w-6" />}
          title="Keine Hooks im Zeitraum"
          description="Passe Tier oder Zeitraum an, oder wähle 'Alle'."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {hooks.map((h) => (
            <ScrapedHookCard key={h.id} hook={h} />
          ))}
        </div>
      )}
    </div>
  );
};

function TierPills({
  value,
  onChange,
}: {
  value: Tier;
  onChange: (t: Tier) => void;
}) {
  const tiers: Tier[] = ["all", "S", "A", "B", "C"];
  return (
    <div className="flex gap-1">
      {tiers.map((t) => (
        <Button
          key={t}
          size="sm"
          variant={value === t ? "default" : "outline"}
          onClick={() => onChange(t)}
          className="h-8 px-3 text-xs"
        >
          {t === "all" ? "Alle" : t}
        </Button>
      ))}
    </div>
  );
}

function PeriodPills({
  value,
  onChange,
}: {
  value: Period;
  onChange: (p: Period) => void;
}) {
  const periods: { id: Period; label: string }[] = [
    { id: "7d", label: "7T" },
    { id: "14d", label: "14T" },
    { id: "28d", label: "28T" },
    { id: "all", label: "Alle" },
  ];
  return (
    <div className="flex gap-1">
      {periods.map((p) => (
        <Button
          key={p.id}
          size="sm"
          variant={value === p.id ? "default" : "outline"}
          onClick={() => onChange(p.id)}
          className="h-8 px-3 text-xs"
        >
          {p.label}
        </Button>
      ))}
    </div>
  );
}
