import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { readItems } from "@directus/sdk";
import { AnimatePresence } from "framer-motion";
import { Loader2, Inbox, Users, ChevronDown } from "lucide-react";

import { directusClient } from "@/providers/directus";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { CATEGORY_LABEL } from "@/lib/categories";
import { EmptyState } from "@/components/shared/EmptyState";
import { type HookIdea, type ScrapedHook, type IdeaCardVariant } from "./IdeaCard";
import { ReelGroupCard } from "./ReelGroupCard";
import { FeedbackDialog } from "./FeedbackDialog";

type StatusFilter = "new" | "liked" | "dismissed" | null;

type SortKey = "newest" | "oldest" | "score_high" | "score_low";

type FormatFilter = "all" | "a_roll" | "b_roll";
type TimeRangeFilter = "all" | "7" | "14" | "28";

const FORMAT_OPTIONS: { value: FormatFilter; label: string }[] = [
  { value: "all", label: "Alle" },
  { value: "a_roll", label: "A-Roll" },
  { value: "b_roll", label: "B-Roll" },
];

const TIME_RANGE_OPTIONS: { value: TimeRangeFilter; label: string; days: number | null }[] = [
  { value: "all", label: "Alle Reels", days: null },
  { value: "7", label: "Reel <7T", days: 7 },
  { value: "14", label: "Reel <14T", days: 14 },
  { value: "28", label: "Reel <28T", days: 28 },
];

const SORT_LABELS: Record<SortKey, string> = {
  newest: "Neueste zuerst",
  oldest: "\u00c4lteste zuerst",
  score_high: "Beste Bewertung",
  score_low: "Schlechteste Bewertung",
};

type Props = {
  title: string;
  subtitle?: string;
  status: StatusFilter;
  onlyCommented?: boolean;
  variant: IdeaCardVariant;
  emptyTitle: string;
  emptyDescription?: string;
};

const IDEA_FIELDS = [
  "id",
  "adapted_hook_text",
  "category",
  "hook_pattern",
  "target_audience",
  "rationale",
  "status",
  "martin_feedback",
  "scraped_hook_source_id",
  "eval_score",
  "date_created",
  "feedback_intent",
  "human_eval_score",
];

export function IdeasGrid({
  title,
  subtitle,
  status,
  onlyCommented,
  variant,
  emptyTitle,
  emptyDescription,
}: Props) {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackIdea, setFeedbackIdea] = useState<HookIdea | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [formatFilter, setFormatFilter] = useState<FormatFilter>("all");
  const [timeRangeFilter, setTimeRangeFilter] = useState<TimeRangeFilter>("all");
  const [creatorFilter, setCreatorFilter] = useState<Set<string>>(new Set());
  const [hideIncomplete, setHideIncomplete] = useState(false);

  const filterKey = `${status ?? "any"}-${onlyCommented ? "commented" : "all"}`;

  const {
    data: ideasData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["hook_ideas_grid", filterKey],
    queryFn: async () => {
      const filter: Record<string, unknown> = {};
      if (status) filter.status = { _eq: status };
      if (onlyCommented) filter.martin_feedback = { _nnull: true };
      return directusClient.request(
        readItems("hook_ideas" as never, {
          filter,
          fields: IDEA_FIELDS,
          sort: ["-date_created"],
          limit: 200,
        } as never)
      ) as Promise<HookIdea[]>;
    },
    staleTime: 30_000,
  });

  const allIdeas = ideasData ?? [];

  const sourceIds = useMemo(
    () =>
      Array.from(
        new Set(
          allIdeas
            .map((i) => i.scraped_hook_source_id)
            .filter((x): x is number => typeof x === "number")
        )
      ),
    [allIdeas]
  );

  const { data: scrapedHooks } = useQuery({
    queryKey: ["scraped_hooks_for_ideas", sourceIds.sort().join(",")],
    queryFn: async () => {
      if (sourceIds.length === 0) return [] as ScrapedHook[];
      return directusClient.request(
        readItems("scraped_hooks" as never, {
          filter: { id: { _in: sourceIds } },
          fields: [
            "id",
            "hook_text",
            "visual_hook_text",
            "full_caption",
            "post_url",
            "account_username",
            "viral_tier",
            "roll_type",
            "image_url",
            "thumbnail_url",
            "thumbnail_file",
            "posted_at",
            "views_count",
            "hook_type",
            "hook_structure",
            "transcript_first_30s",
            "spoken_hook",
            "spoken_hook_de",
          ],
          limit: sourceIds.length,
        } as never)
      ) as Promise<ScrapedHook[]>;
    },
    enabled: sourceIds.length > 0,
    staleTime: 60_000,
  });

  const sourceMap = useMemo(() => {
    const m = new Map<number, ScrapedHook>();
    (scrapedHooks ?? []).forEach((s) => m.set(s.id, s));
    return m;
  }, [scrapedHooks]);

  const timeRangeCutoffMs = useMemo(() => {
    const opt = TIME_RANGE_OPTIONS.find((o) => o.value === timeRangeFilter);
    if (!opt?.days) return null;
    return Date.now() - opt.days * 24 * 60 * 60 * 1000;
  }, [timeRangeFilter]);

  const getPostedAtMs = (idea: HookIdea, map: Map<number, ScrapedHook>): number => {
    if (!idea.scraped_hook_source_id) return 0;
    const src = map.get(idea.scraped_hook_source_id);
    if (!src?.posted_at) return 0;
    const t = new Date(src.posted_at).getTime();
    return Number.isFinite(t) ? t : 0;
  };

  // "Vollstaendig" = mindestens ein Visual-Asset (thumbnail_file oder image_url) UND
  // mindestens ein Hook-Signal (visual_hook_text, spoken_hook, hook_text). Reels ohne
  // jegliches Visual ODER ohne jegliche Hook werden ausgefiltert — thumbnail_file alleine
  // ist zu streng, weil die Backfill-Pipeline hinterherhinkt.
  const isComplete = (src: ScrapedHook | undefined): boolean => {
    if (!src) return false;
    const hasVisual = Boolean(src.thumbnail_file || src.image_url || src.thumbnail_url);
    const hasHookSignal = Boolean(
      src.visual_hook_text || src.spoken_hook || src.hook_text
    );
    return hasVisual && hasHookSignal;
  };

  // Pre-creator-filter ideas (category + format + time + incomplete applied).
  // Used both for deriving creator counts AND for final filtered+sorted list.
  const ideasBeforeCreator = useMemo(() => {
    return allIdeas.filter((i) => {
      if (categoryFilter && i.category !== categoryFilter) return false;
      const src = i.scraped_hook_source_id
        ? sourceMap.get(i.scraped_hook_source_id)
        : undefined;
      if (formatFilter !== "all" && src?.roll_type !== formatFilter) return false;
      if (timeRangeCutoffMs !== null) {
        const paMs = getPostedAtMs(i, sourceMap);
        if (paMs < timeRangeCutoffMs) return false;
      }
      if (hideIncomplete && !isComplete(src)) return false;
      return true;
    });
  }, [allIdeas, sourceMap, categoryFilter, formatFilter, timeRangeCutoffMs, hideIncomplete]);

  const availableCreators = useMemo(() => {
    const counts = new Map<string, number>();
    ideasBeforeCreator.forEach((i) => {
      if (!i.scraped_hook_source_id) return;
      const src = sourceMap.get(i.scraped_hook_source_id);
      if (!src?.account_username) return;
      counts.set(src.account_username, (counts.get(src.account_username) ?? 0) + 1);
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [ideasBeforeCreator, sourceMap]);

  const ideas = useMemo(() => {
    const filtered = ideasBeforeCreator.filter((i) => {
      if (creatorFilter.size === 0) return true;
      const src = i.scraped_hook_source_id
        ? sourceMap.get(i.scraped_hook_source_id)
        : undefined;
      if (!src?.account_username) return false;
      return creatorFilter.has(src.account_username);
    });
    return [...filtered].sort((a, b) => {
      const paA = getPostedAtMs(a, sourceMap);
      const paB = getPostedAtMs(b, sourceMap);
      if (sortKey === "newest") return paB - paA;
      if (sortKey === "oldest") return paA - paB;
      const evA = a.eval_score ?? 0;
      const evB = b.eval_score ?? 0;
      if (sortKey === "score_high") {
        if (evB !== evA) return evB - evA;
        return paB - paA;
      }
      if (sortKey === "score_low") {
        if (evA !== evB) return evA - evB;
        return paB - paA;
      }
      return 0;
    });
  }, [ideasBeforeCreator, sourceMap, creatorFilter, sortKey]);

  // Group ideas by scraped_hook_source_id for the reel-centric layout.
  const groupedReels = useMemo(() => {
    const groups = new Map<number | string, { source: ScrapedHook | undefined; ideas: HookIdea[] }>();
    ideas.forEach((idea) => {
      const key = idea.scraped_hook_source_id ?? `_orphan_${idea.id}`;
      const source = idea.scraped_hook_source_id
        ? sourceMap.get(idea.scraped_hook_source_id)
        : undefined;
      const existing = groups.get(key);
      if (existing) {
        existing.ideas.push(idea);
      } else {
        groups.set(key, { source, ideas: [idea] });
      }
    });
    return Array.from(groups.values());
  }, [ideas, sourceMap]);

  const totalIdeaCount = ideas.length;

  const categoryCounts = allIdeas.reduce<Record<string, number>>((acc, i) => {
    if (i.category) acc[i.category] = (acc[i.category] ?? 0) + 1;
    return acc;
  }, {});
  const availableCategories = Object.keys(categoryCounts).sort(
    (a, b) => categoryCounts[b] - categoryCounts[a]
  );

  const openFeedback = (idea: HookIdea) => {
    setFeedbackIdea(idea);
    setFeedbackOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center space-y-2">
        <p className="text-destructive">Fehler beim Laden der Hook-Ideen.</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Neu laden
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {groupedReels.length} Reel{groupedReels.length !== 1 ? "s" : ""}
            {" · "}
            {totalIdeaCount}{" "}
            {subtitle ?? "Ideen"}
            {categoryFilter || creatorFilter.size > 0 || formatFilter !== "all" || timeRangeCutoffMs !== null
              ? ` (gefiltert von ${allIdeas.length})`
              : ""}
          </p>
        </div>
        <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
          <SelectTrigger className="h-9 w-[200px] text-xs">
            <SelectValue placeholder="Sortierung" />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
              <SelectItem key={key} value={key} className="text-xs">
                {SORT_LABELS[key]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {availableCategories.length > 1 && (
        <ScrollArea className="mb-3 w-full whitespace-nowrap">
          <div className="flex gap-1.5 pb-2">
            <Button
              variant={categoryFilter === null ? "default" : "outline"}
              size="sm"
              className="h-8 px-3 text-xs shrink-0"
              onClick={() => setCategoryFilter(null)}
            >
              Alle · {allIdeas.length}
            </Button>
            {availableCategories.map((cat) => (
              <Button
                key={cat}
                variant={categoryFilter === cat ? "default" : "outline"}
                size="sm"
                className="h-8 px-3 text-xs shrink-0"
                onClick={() => setCategoryFilter(cat)}
              >
                {CATEGORY_LABEL[cat] ?? cat} · {categoryCounts[cat]}
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <div className="flex gap-1">
          {FORMAT_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              variant={formatFilter === opt.value ? "default" : "outline"}
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={() => setFormatFilter(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
        <div className="flex gap-1">
          {TIME_RANGE_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              variant={timeRangeFilter === opt.value ? "default" : "outline"}
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={() => setTimeRangeFilter(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
        {availableCreators.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={creatorFilter.size > 0 ? "default" : "outline"}
                size="sm"
                className="h-8 px-3 text-xs gap-1"
              >
                <Users className="h-3.5 w-3.5" />
                {creatorFilter.size === 0
                  ? "Creators"
                  : `${creatorFilter.size} Creator${creatorFilter.size > 1 ? "s" : ""}`}
                <ChevronDown className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0" align="start">
              <div className="flex items-center justify-between border-b px-3 py-2">
                <span className="text-xs font-medium">Creators</span>
                {creatorFilter.size > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[11px]"
                    onClick={() => setCreatorFilter(new Set())}
                  >
                    Zuruecksetzen
                  </Button>
                )}
              </div>
              <ScrollArea className="max-h-64">
                <div className="p-2 space-y-1">
                  {availableCreators.map(({ name, count }) => {
                    const checked = creatorFilter.has(name);
                    return (
                      <label
                        key={name}
                        className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-accent cursor-pointer"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(v) => {
                            setCreatorFilter((prev) => {
                              const next = new Set(prev);
                              if (v) next.add(name);
                              else next.delete(name);
                              return next;
                            });
                          }}
                        />
                        <span className="flex-1 text-xs truncate">@{name}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {count}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
        )}
        <label className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
          <Switch
            checked={hideIncomplete}
            onCheckedChange={setHideIncomplete}
            aria-label="Unvollstaendige verbergen"
          />
          Unvollstaendige verbergen
        </label>
      </div>

      {groupedReels.length === 0 ? (
        <EmptyState
          icon={<Inbox className="h-6 w-6" />}
          title={emptyTitle}
          description={emptyDescription}
        />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {groupedReels.map((group) => (
              <ReelGroupCard
                key={group.ideas[0].scraped_hook_source_id ?? `orphan-${group.ideas[0].id}`}
                source={group.source}
                ideas={group.ideas}
                variant={variant}
                onFeedback={openFeedback}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <FeedbackDialog
        open={feedbackOpen}
        onOpenChange={setFeedbackOpen}
        idea={feedbackIdea}
      />
    </div>
  );
}
