import { useMemo } from "react";
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";

export type ScatterReel = {
  id: string;
  ig_caption_preview: string | null;
  reels_skip_rate: number | null;
  views: number | null;
  viral_tier: string | null;
};

const TIER_HEX: Record<string, string> = {
  S: "#f59e0b",
  A: "#10b981",
  B: "#0ea5e9",
  C: "#64748b",
  D: "#f43f5e",
};

function hookLengthChars(caption: string | null): number {
  if (!caption) return 0;
  return caption.split(/\s+/).slice(0, 5).join(" ").length;
}

export function HookLengthScatter({ reels }: { reels: ScatterReel[] }) {
  const points = useMemo(
    () =>
      reels
        .map((r) => ({
          x: hookLengthChars(r.ig_caption_preview),
          y: r.reels_skip_rate,
          z: r.views ?? 0,
          tier: r.viral_tier ?? "C",
          caption: (r.ig_caption_preview ?? "").slice(0, 80),
        }))
        .filter((p) => p.x > 0 && p.y != null),
    [reels],
  );

  const groups = useMemo(() => {
    const g: Record<string, typeof points> = {};
    for (const p of points) {
      (g[p.tier] ||= []).push(p);
    }
    return g;
  }, [points]);

  if (points.length === 0) {
    return (
      <Card className="border-border/60">
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Keine Daten für Scatter-Plot (Skip-Rate fehlt).
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60">
      <CardContent className="pt-6 pb-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-sm font-medium">Hook-Länge vs. Skip-Rate</h3>
            <p className="text-xs text-muted-foreground">
              X: Zeichen in ersten 5 Wörtern · Y: Skip-Rate in % · Größe: Views
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-[10px]">
            {Object.entries(TIER_HEX).map(([tier, color]) => (
              <span key={tier} className="inline-flex items-center gap-1">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
                {tier}
              </span>
            ))}
          </div>
        </div>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                type="number"
                dataKey="x"
                name="Hook-Länge"
                unit=" Z."
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Skip-Rate"
                unit="%"
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
              />
              <ZAxis type="number" dataKey="z" range={[40, 400]} name="Views" />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const p = payload[0].payload as (typeof points)[number];
                  return (
                    <div className="rounded-md border border-border bg-background p-2 text-xs shadow">
                      <p className="font-medium line-clamp-2 max-w-[240px]">{p.caption}</p>
                      <div className="mt-1 space-y-0.5 text-muted-foreground">
                        <div>Hook: {p.x} Z.</div>
                        <div>Skip: {typeof p.y === "number" ? p.y.toFixed(1) : "—"}%</div>
                        <div>Views: {p.z.toLocaleString("de-DE")}</div>
                        <div>Tier: {p.tier}</div>
                      </div>
                    </div>
                  );
                }}
              />
              {Object.entries(groups).map(([tier, pts]) => (
                <Scatter key={tier} name={tier} data={pts} fill={TIER_HEX[tier] ?? "#64748b"} />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
