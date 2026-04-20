import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";

export type RankingReel = {
  category: string | null;
  engagement_rate: number | null;
  views: number | null;
};

const BAR_COLOR = "#10b981";
const BAR_COLOR_ALT = "#0ea5e9";

type AggRow = { category: string; avgEngagement: number; avgViews: number; count: number };

function aggregate(reels: RankingReel[]): AggRow[] {
  const groups = new Map<string, { engSum: number; engN: number; vSum: number; vN: number; count: number }>();
  for (const r of reels) {
    if (!r.category) continue;
    const g = groups.get(r.category) ?? { engSum: 0, engN: 0, vSum: 0, vN: 0, count: 0 };
    if (typeof r.engagement_rate === "number" && !Number.isNaN(r.engagement_rate)) {
      g.engSum += r.engagement_rate;
      g.engN++;
    }
    if (typeof r.views === "number" && !Number.isNaN(r.views)) {
      g.vSum += r.views;
      g.vN++;
    }
    g.count++;
    groups.set(r.category, g);
  }
  const rows: AggRow[] = [];
  for (const [category, g] of groups.entries()) {
    if (g.count < 2) continue;
    rows.push({
      category,
      avgEngagement: g.engN > 0 ? g.engSum / g.engN : 0,
      avgViews: g.vN > 0 ? g.vSum / g.vN : 0,
      count: g.count,
    });
  }
  return rows;
}

export function CategoryRankingCharts({ reels }: { reels: RankingReel[] }) {
  const byEngagement = useMemo(
    () => [...aggregate(reels)].sort((a, b) => b.avgEngagement - a.avgEngagement).slice(0, 8),
    [reels]
  );
  const byViews = useMemo(
    () => [...aggregate(reels)].sort((a, b) => b.avgViews - a.avgViews).slice(0, 8),
    [reels]
  );

  if (byEngagement.length === 0) {
    return (
      <Card className="border-border/60">
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Nicht genug Daten für Kategorie-Ranking (min. 2 Reels pro Kategorie).
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="border-border/60">
        <CardContent className="pt-5 pb-4 space-y-3">
          <div>
            <h3 className="text-sm font-medium">Kategorien nach Engagement</h3>
            <p className="text-xs text-muted-foreground">
              Ø Engagement-Rate pro Kategorie (min. 2 Reels)
            </p>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={byEngagement}
                layout="vertical"
                margin={{ top: 5, right: 16, bottom: 5, left: 12 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  type="number"
                  tickFormatter={(v) => `${(v * 100).toFixed(1)}%`}
                  tick={{ fontSize: 10 }}
                />
                <YAxis
                  type="category"
                  dataKey="category"
                  width={110}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const p = payload[0].payload as AggRow;
                    return (
                      <div className="rounded-md border border-border bg-background p-2 text-xs shadow">
                        <p className="font-medium">{p.category}</p>
                        <p className="text-muted-foreground">
                          Ø {(p.avgEngagement * 100).toFixed(2)}% · {p.count} Reels
                        </p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="avgEngagement" radius={[0, 4, 4, 0]}>
                  {byEngagement.map((_, i) => (
                    <Cell key={i} fill={BAR_COLOR} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardContent className="pt-5 pb-4 space-y-3">
          <div>
            <h3 className="text-sm font-medium">Kategorien nach Views</h3>
            <p className="text-xs text-muted-foreground">
              Ø Views pro Kategorie
            </p>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={byViews}
                layout="vertical"
                margin={{ top: 5, right: 16, bottom: 5, left: 12 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  type="number"
                  tickFormatter={(v) =>
                    v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(Math.round(v))
                  }
                  tick={{ fontSize: 10 }}
                />
                <YAxis
                  type="category"
                  dataKey="category"
                  width={110}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const p = payload[0].payload as AggRow;
                    return (
                      <div className="rounded-md border border-border bg-background p-2 text-xs shadow">
                        <p className="font-medium">{p.category}</p>
                        <p className="text-muted-foreground">
                          Ø {Math.round(p.avgViews).toLocaleString("de-DE")} Views · {p.count} Reels
                        </p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="avgViews" radius={[0, 4, 4, 0]}>
                  {byViews.map((_, i) => (
                    <Cell key={i} fill={BAR_COLOR_ALT} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
