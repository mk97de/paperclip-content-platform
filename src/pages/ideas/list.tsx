import { useState, useMemo } from "react";
import { useList, useUpdate } from "@refinedev/core";
import { useQuery } from "@tanstack/react-query";
import { readItems } from "@directus/sdk";
import { AnimatePresence, motion } from "framer-motion";
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

import { directusClient } from "@/providers/directus";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

type HookIdea = {
  id: number;
  adapted_hook_text: string;
  category: string | null;
  hook_pattern: string | null;
  target_audience: string | null;
  rationale: string | null;
  status: "new" | "liked" | "dismissed" | "used";
  martin_feedback: string | null;
  scraped_hook_source_id: number | null;
};

type ScrapedHook = {
  id: number;
  hook_text: string | null;
  post_url: string | null;
  account_username: string | null;
  viral_tier: string | null;
};

const CATEGORY_LABEL: Record<string, string> = {
  darmgesundheit: "Darm",
  hormone: "Hormone",
  schilddruese: "Schilddrüse",
  blutzucker: "Blutzucker",
  ernaehrung: "Ernährung",
  schlaf: "Schlaf",
  stress: "Stress",
  bewegung: "Bewegung",
  mindset: "Mindset",
  sonstiges: "Sonstiges",
};

// Pastel color palette per category (works in both light and dark mode via opacity)
const CATEGORY_COLOR: Record<string, string> = {
  darmgesundheit:
    "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200 border-amber-200/60 dark:border-amber-800/60",
  hormone:
    "bg-rose-100 text-rose-900 dark:bg-rose-900/40 dark:text-rose-200 border-rose-200/60 dark:border-rose-800/60",
  schilddruese:
    "bg-sky-100 text-sky-900 dark:bg-sky-900/40 dark:text-sky-200 border-sky-200/60 dark:border-sky-800/60",
  blutzucker:
    "bg-orange-100 text-orange-900 dark:bg-orange-900/40 dark:text-orange-200 border-orange-200/60 dark:border-orange-800/60",
  ernaehrung:
    "bg-lime-100 text-lime-900 dark:bg-lime-900/40 dark:text-lime-200 border-lime-200/60 dark:border-lime-800/60",
  schlaf:
    "bg-indigo-100 text-indigo-900 dark:bg-indigo-900/40 dark:text-indigo-200 border-indigo-200/60 dark:border-indigo-800/60",
  stress:
    "bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-200 border-red-200/60 dark:border-red-800/60",
  bewegung:
    "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200 border-emerald-200/60 dark:border-emerald-800/60",
  mindset:
    "bg-violet-100 text-violet-900 dark:bg-violet-900/40 dark:text-violet-200 border-violet-200/60 dark:border-violet-800/60",
  sonstiges:
    "bg-slate-100 text-slate-900 dark:bg-slate-800/60 dark:text-slate-200 border-slate-200/60 dark:border-slate-700/60",
};

const PATTERN_LABEL: Record<string, string> = {
  gegenposition: "Gegenposition",
  identifikation: "Identifikation",
  ueberraschung: "Überraschung",
  warnung: "Warnung",
  neugier: "Neugier",
  autoritaet: "Autorität",
  fehler_aufdecken: "Fehler aufdecken",
  story_einstieg: "Story-Einstieg",
  dringlichkeit: "Dringlichkeit",
};

export const IdeasList = () => {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackIdea, setFeedbackIdea] = useState<HookIdea | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const {
    result,
    query: { isLoading, isError },
  } = useList<HookIdea>({
    resource: "hook_ideas",
    filters: [{ field: "status", operator: "eq", value: "new" }],
    sorters: [{ field: "date_created", order: "desc" }],
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

  // Direct Directus query — bypasses refine-directus filter-mapping quirks
  const { data: scrapedHooks } = useQuery({
    queryKey: ["scraped_hooks_for_ideas", sourceIds.sort().join(",")],
    queryFn: async () => {
      if (sourceIds.length === 0) return [] as ScrapedHook[];
      return directusClient.request(
        readItems("scraped_hooks" as never, {
          filter: { id: { _in: sourceIds } },
          fields: ["id", "hook_text", "post_url", "account_username", "viral_tier"],
          limit: sourceIds.length,
        } as never)
      ) as Promise<ScrapedHook[]>;
    },
    enabled: sourceIds.length > 0,
    staleTime: 60_000,
  });

  const sourceMap = useMemo(() => {
    const m = new Map<number, ScrapedHook>();
    (scrapedHooks ?? []).forEach((s: ScrapedHook) => m.set(s.id, s));
    return m;
  }, [scrapedHooks]);

  const {
    mutate: updateIdea,
    mutation: { isPending: isUpdating },
  } = useUpdate();

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

  const handleLike = (idea: HookIdea) => {
    updateIdea(
      {
        resource: "hook_ideas",
        id: idea.id,
        values: { status: "liked" },
        successNotification: false,
      },
      {
        onSuccess: () => toast.success("Gefällt mir"),
        onError: (e) => toast.error(`Fehler: ${e.message}`),
      }
    );
  };

  const handleDismiss = (idea: HookIdea) => {
    updateIdea(
      {
        resource: "hook_ideas",
        id: idea.id,
        values: { status: "dismissed" },
        successNotification: false,
      },
      {
        onSuccess: () => toast.success("Verworfen"),
        onError: (e) => toast.error(`Fehler: ${e.message}`),
      }
    );
  };

  const openFeedback = (idea: HookIdea) => {
    setFeedbackIdea(idea);
    setFeedbackText(idea.martin_feedback ?? "");
    setFeedbackOpen(true);
  };

  const submitFeedback = () => {
    if (!feedbackIdea) return;
    updateIdea(
      {
        resource: "hook_ideas",
        id: feedbackIdea.id,
        values: { martin_feedback: feedbackText.trim() || null },
        successNotification: false,
      },
      {
        onSuccess: () => {
          toast.success("Feedback gespeichert");
          setFeedbackOpen(false);
          setFeedbackIdea(null);
          setFeedbackText("");
        },
        onError: (e) => toast.error(`Fehler: ${e.message}`),
      }
    );
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
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Hook-Ideen</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {ideas.length}
          {categoryFilter ? ` von ${allIdeas.length}` : ""} neue Ideen · Like,
          Dismiss oder Feedback geben
        </p>
      </div>

      {availableCategories.length > 1 && (
        <div className="flex flex-wrap gap-1.5 mb-6">
          <Button
            variant={categoryFilter === null ? "default" : "outline"}
            size="sm"
            className="h-8 px-3 text-xs"
            onClick={() => setCategoryFilter(null)}
          >
            Alle · {allIdeas.length}
          </Button>
          {availableCategories.map((cat) => (
            <Button
              key={cat}
              variant={categoryFilter === cat ? "default" : "outline"}
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={() => setCategoryFilter(cat)}
            >
              {CATEGORY_LABEL[cat] ?? cat} · {categoryCounts[cat]}
            </Button>
          ))}
        </div>
      )}

      {ideas.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">
          {categoryFilter
            ? "Keine Ideen in dieser Kategorie."
            : "Keine neuen Ideen. Schau morgen wieder rein — der Scraper läuft Montags."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {ideas.map((idea: HookIdea) => {
              const source = idea.scraped_hook_source_id
                ? sourceMap.get(idea.scraped_hook_source_id)
                : undefined;
              return (
                <motion.div
                  key={idea.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="h-full flex flex-col shadow-sm hover:shadow-md dark:shadow-black/40 transition-shadow duration-200 border-border/60">
                    <CardContent className="flex-1 pt-6 space-y-4">
                      <div className="flex flex-wrap gap-1.5">
                        {idea.category && (
                          <Badge
                            className={`border ${
                              CATEGORY_COLOR[idea.category] ??
                              CATEGORY_COLOR.sonstiges
                            }`}
                          >
                            {CATEGORY_LABEL[idea.category] ?? idea.category}
                          </Badge>
                        )}
                        {idea.hook_pattern && (
                          <Badge variant="outline" className="font-normal">
                            {PATTERN_LABEL[idea.hook_pattern] ??
                              idea.hook_pattern}
                          </Badge>
                        )}
                      </div>

                      <p className="text-base font-semibold leading-snug">
                        {idea.adapted_hook_text}
                      </p>

                      {idea.target_audience && (
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium">Zielgruppe:</span>{" "}
                          {idea.target_audience}
                        </p>
                      )}

                      {idea.rationale && (
                        <p className="text-xs text-muted-foreground italic leading-relaxed">
                          {idea.rationale}
                        </p>
                      )}

                      {source && (
                        <div className="pt-3 border-t border-border space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                              Original
                            </span>
                            {source.account_username && (
                              <span className="text-[10px] text-muted-foreground font-mono">
                                @{source.account_username}
                                {source.viral_tier
                                  ? ` · ${source.viral_tier}-Tier`
                                  : ""}
                              </span>
                            )}
                          </div>
                          {source.hook_text && (
                            <p className="text-xs text-muted-foreground leading-snug line-clamp-3">
                              {source.hook_text}
                            </p>
                          )}
                          {source.post_url && (
                            <a
                              href={source.post_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-[#7170ff] hover:text-[#828fff] transition-colors"
                            >
                              Reel ansehen
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="gap-2 border-t pt-4">
                      <Button
                        size="default"
                        className="flex-1 h-10 border bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border-emerald-200/80 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 dark:text-emerald-200 dark:border-emerald-800/60 shadow-none"
                        disabled={isUpdating}
                        onClick={() => handleLike(idea)}
                        aria-label="Gefaellt mir"
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                      <Button
                        size="default"
                        className="flex-1 h-10 border bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-200/80 dark:bg-slate-800/60 dark:hover:bg-slate-800 dark:text-slate-200 dark:border-slate-700 shadow-none"
                        disabled={isUpdating}
                        onClick={() => openFeedback(idea)}
                        aria-label="Feedback"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Button
                        size="default"
                        className="flex-1 h-10 border bg-rose-100 hover:bg-rose-200 text-rose-900 border-rose-200/80 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 dark:text-rose-200 dark:border-rose-800/60 shadow-none"
                        disabled={isUpdating}
                        onClick={() => handleDismiss(idea)}
                        aria-label="Verwerfen"
                      >
                        <ThumbsDown className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Feedback zu dieser Idee</DialogTitle>
            <DialogDescription>
              Kurze Notiz — was soll anders werden? (Optional)
            </DialogDescription>
          </DialogHeader>
          {feedbackIdea && (
            <p className="text-sm text-muted-foreground border-l-2 pl-3 italic">
              {feedbackIdea.adapted_hook_text}
            </p>
          )}
          <Textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="z.B. bitte mit Fokus auf Hashimoto"
            rows={4}
          />
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setFeedbackOpen(false)}
              disabled={isUpdating}
            >
              Abbrechen
            </Button>
            <Button onClick={submitFeedback} disabled={isUpdating}>
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Speichern"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
