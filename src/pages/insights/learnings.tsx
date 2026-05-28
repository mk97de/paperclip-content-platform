import { useMemo } from "react";
import { useList } from "@refinedev/core";
import {
  Brain,
  Heart,
  Loader2,
  MessageSquare,
  Trash2,
  Sparkles,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CATEGORY_LABEL,
  CATEGORY_EVENT_HEX,
} from "@/lib/categories";

type IdeaRow = {
  id: number;
  status: "new" | "liked" | "dismissed" | string | null;
  category: string | null;
  hook_pattern: string | null;
  adapted_hook_text: string | null;
  martin_feedback: string | null;
  date_created: string | null;
};

const STATUS_COLORS: Record<string, string> = {
  liked: "#10b981",
  dismissed: "#94a3b8",
  new: "#6366f1",
  commented: "#f59e0b",
};

const STATUS_LABEL: Record<string, string> = {
  liked: "Liked",
  dismissed: "Dismissed",
  new: "Neu",
  commented: "Mit Feedback",
};

export const InsightsLearnings = () => {
  const since = useMemo(
    () => new Date(Date.now() - 30 * 86_400_000).toISOString(),
    [],
  );

  const {
    result,
    query: { isLoading },
  } = useList<IdeaRow>({
    resource: "hook_ideas",
    filters: [
      { field: "date_created", operator: "gte", value: since },
    ] as never,
    sorters: [{ field: "date_created", order: "desc" }],
    pagination: { pageSize: 500 },
    meta: { noStatus: true },
  });

  const ideas = useMemo(() => (result?.data ?? []) as IdeaRow[], [result?.data]);

  const statusBreakdown = useMemo(() => {
    const counts: Record<string, number> = {
      liked: 0,
      dismissed: 0,
      new: 0,
    };
    let withFeedback = 0;
    for (const idea of ideas) {
      const s = (idea.status ?? "new") as string;
      counts[s] = (counts[s] ?? 0) + 1;
      if (idea.martin_feedback && idea.martin_feedback.trim().length > 0) {
        withFeedback++;
      }
    }
    const pie = (["liked", "dismissed", "new"] as const)
      .map((s) => ({ name: STATUS_LABEL[s], key: s, value: counts[s] ?? 0 }))
      .filter((d) => d.value > 0);
    return { counts, pie, withFeedback };
  }, [ideas]);

  const categoryLikeRate = useMemo(() => {
    const map = new Map<string, { liked: number; dismissed: number }>();
    for (const idea of ideas) {
      const cat = idea.category ?? "(ohne)";
      if (!map.has(cat)) map.set(cat, { liked: 0, dismissed: 0 });
      const entry = map.get(cat)!;
      if (idea.status === "liked") entry.liked++;
      else if (idea.status === "dismissed") entry.dismissed++;
    }
    return Array.from(map.entries())
      .map(([cat, { liked, dismissed }]) => {
        const total = liked + dismissed;
        return {
          category: cat,
          label: CATEGORY_LABEL[cat] ?? cat,
          color: CATEGORY_EVENT_HEX[cat] ?? "#94a3b8",
          rate: total === 0 ? 0 : (liked / total) * 100,
          liked,
          dismissed,
          total,
        };
      })
      .filter((r) => r.total >= 2)
      .sort((a, b) => b.rate - a.rate);
  }, [ideas]);

  const topPatterns = useMemo(() => {
    const map = new Map<string, number>();
    for (const idea of ideas) {
      if (idea.status !== "liked") continue;
      const p = idea.hook_pattern ?? "(ohne)";
      map.set(p, (map.get(p) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([pattern, count]) => ({ pattern, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [ideas]);

  const dismissSamples = useMemo(() => {
    const filtered = ideas.filter(
      (i) =>
        i.status === "dismissed" &&
        i.martin_feedback &&
        i.martin_feedback.trim().length > 0,
    );
    // Pick up to 10 — pseudo-random by id mod
    const shuffled = [...filtered].sort((a, b) => (a.id * 7919) % 100 - (b.id * 7919) % 100);
    return shuffled.slice(0, 10);
  }, [ideas]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (ideas.length === 0) {
    return (
      <div className="p-4 md:p-8">
        <EmptyState
          icon={<Brain className="h-6 w-6" />}
          title="Noch keine Ideen"
          description="Sobald der Generator Hook-Ideen erzeugt, erscheinen Learnings hier."
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Agent Learnings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {ideas.length} Ideen der letzten 30 Tage · was lernen die Agenten?
        </p>
      </div>

      {/* Section 1: Status donut */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="md:col-span-2">
          <CardContent className="pt-6">
            <h2 className="text-base font-semibold mb-3">
              Status-Verteilung
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusBreakdown.pie}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={2}
                    >
                      {statusBreakdown.pie.map((entry) => (
                        <Cell
                          key={entry.key}
                          fill={STATUS_COLORS[entry.key] ?? "#94a3b8"}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 text-sm">
                {statusBreakdown.pie.map((s) => (
                  <div key={s.key} className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-sm"
                      style={{ background: STATUS_COLORS[s.key] }}
                    />
                    <span className="flex-1">{s.name}</span>
                    <span className="font-semibold tabular-nums">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h2 className="text-base font-semibold">Engagement</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                  <Heart className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-semibold leading-none">
                    {statusBreakdown.counts.liked ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground">geliked</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-semibold leading-none">
                    {statusBreakdown.withFeedback}
                  </p>
                  <p className="text-xs text-muted-foreground">mit Feedback</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-900/40 flex items-center justify-center">
                  <Trash2 className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                </div>
                <div>
                  <p className="text-2xl font-semibold leading-none">
                    {statusBreakdown.counts.dismissed ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground">verworfen</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section 2: Like-Rate per Category */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">Like-Rate pro Kategorie</h2>
            <span className="text-xs text-muted-foreground">
              liked / (liked + dismissed)
            </span>
          </div>
          {categoryLikeRate.length === 0 ? (
            <EmptyState
              icon={<Sparkles className="h-5 w-5" />}
              title="Zu wenig Daten"
              description="Brauche ≥ 2 bewertete Ideen pro Kategorie."
            />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryLikeRate}
                  margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11 }}
                    interval={0}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    unit="%"
                    domain={[0, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      fontSize: 12,
                    }}
                    formatter={(v: number) => `${v.toFixed(1)}%`}
                  />
                  <Bar dataKey="rate" radius={4}>
                    {categoryLikeRate.map((d) => (
                      <Cell key={d.category} fill={d.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 3: Top Patterns */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-base font-semibold mb-3">Top liked Patterns</h2>
          {topPatterns.length === 0 ? (
            <EmptyState
              icon={<Sparkles className="h-5 w-5" />}
              title="Noch keine likes"
              description="Sobald Ideen geliked werden, erscheinen die Pattern hier."
            />
          ) : (
            <div className="space-y-1.5">
              {topPatterns.map((p, i) => (
                <div
                  key={p.pattern}
                  className="flex items-center gap-3 py-1.5 px-2 rounded hover:bg-muted/50"
                >
                  <span className="text-xs text-muted-foreground font-mono w-5">
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm font-medium">
                    {p.pattern}
                  </span>
                  <Badge variant="secondary">{p.count} likes</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 4: Dismiss-Samples */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">
              Dismiss-Gründe (Sample)
            </h2>
            <span className="text-xs text-muted-foreground">
              10 zufällige verworfene Ideen mit Begründung
            </span>
          </div>
          {dismissSamples.length === 0 ? (
            <EmptyState
              icon={<Trash2 className="h-5 w-5" />}
              title="Keine Begründungen"
              description="Verworfene Ideen wurden noch nicht kommentiert."
            />
          ) : (
            <div className="space-y-3">
              {dismissSamples.map((idea) => (
                <div
                  key={idea.id}
                  className="border-l-2 border-amber-400 pl-3 py-1.5 space-y-1"
                >
                  <p className="text-sm font-medium leading-snug">
                    {idea.adapted_hook_text ?? "(ohne Hook-Text)"}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {(idea.martin_feedback ?? "").slice(0, 200)}
                    {(idea.martin_feedback ?? "").length > 200 ? "…" : ""}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
