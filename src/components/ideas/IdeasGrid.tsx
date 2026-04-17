import { useMemo, useState } from "react";
import { useList } from "@refinedev/core";
import { useQuery } from "@tanstack/react-query";
import { readItems } from "@directus/sdk";
import { AnimatePresence } from "framer-motion";
import { Loader2, Inbox } from "lucide-react";

import { directusClient } from "@/providers/directus";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { CATEGORY_LABEL } from "@/lib/categories";
import { EmptyState } from "@/components/shared/EmptyState";
import { IdeaCard, type HookIdea, type ScrapedHook, type IdeaCardVariant } from "./IdeaCard";
import { FeedbackDialog } from "./FeedbackDialog";

type StatusFilter = "new" | "liked" | "dismissed" | null;

type Props = {
  title: string;
  subtitle?: string;
  status: StatusFilter;
  onlyCommented?: boolean;
  variant: IdeaCardVariant;
  emptyTitle: string;
  emptyDescription?: string;
};

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

  const filters = useMemo(() => {
    const list: Array<{ field: string; operator: string; value: unknown }> = [];
    if (status) list.push({ field: "status", operator: "eq", value: status });
    if (onlyCommented)
      list.push({ field: "martin_feedback", operator: "nnull", value: true });
    return list;
  }, [status, onlyCommented]);

  const {
    result,
    query: { isLoading, isError },
  } = useList<HookIdea>({
    resource: "hook_ideas",
    filters: filters as never,
    sorters: [{ field: onlyCommented ? "date_updated" : "date_created", order: "desc" }],
    pagination: { pageSize: 200 },
  });

  const allIdeas = result?.data ?? [];

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
            "post_url",
            "account_username",
            "viral_tier",
            "roll_type",
            "image_url",
            "thumbnail_url",
            "posted_at",
            "views_count",
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

  const ideas = categoryFilter
    ? allIdeas.filter((i) => i.category === categoryFilter)
    : allIdeas;

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
      <div className="p-8 text-center text-destructive">
        Fehler beim Laden der Hook-Ideen.
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {ideas.length}
          {categoryFilter ? ` von ${allIdeas.length}` : ""}{" "}
          {subtitle ?? "Ideen"}
        </p>
      </div>

      {availableCategories.length > 1 && (
        <ScrollArea className="mb-6 w-full whitespace-nowrap">
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

      {ideas.length === 0 ? (
        <EmptyState
          icon={<Inbox className="h-6 w-6" />}
          title={emptyTitle}
          description={emptyDescription}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {ideas.map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                source={
                  idea.scraped_hook_source_id
                    ? sourceMap.get(idea.scraped_hook_source_id)
                    : undefined
                }
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
