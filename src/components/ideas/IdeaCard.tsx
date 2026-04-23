import { useUpdate, useCreate } from "@refinedev/core";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  ExternalLink,
  RotateCcw,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Quote,
  X,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { getAssetUrl } from "@/providers/directus";
import { CategoryBadge } from "./CategoryBadge";
import { PatternBadge } from "./PatternBadge";
import { RollTypeBadge } from "./RollTypeBadge";
import { ScreenshotPreview } from "./ScreenshotPreview";

export type FeedbackIntent = "data_quality" | "content_quality" | null;

export type HookIdea = {
  id: number;
  adapted_hook_text: string;
  category: string | null;
  hook_pattern: string | null;
  target_audience: string | null;
  rationale: string | null;
  status: "new" | "liked" | "dismissed" | "used";
  martin_feedback: string | null;
  scraped_hook_source_id: number | null;
  eval_score?: number | null;
  date_created?: string | null;
  feedback_intent?: FeedbackIntent;
};

export type HookType =
  | "classical"
  | "information_list"
  | "statement"
  | "question"
  | "story_opener"
  | "promise_preview"
  | null;

export type HookStructureItem = {
  category?: string;
  items?: string[];
};

export type ScrapedHook = {
  id: number;
  hook_text: string | null;
  visual_hook_text?: string | null;
  full_caption?: string | null;
  post_url: string | null;
  account_username: string | null;
  viral_tier: string | null;
  roll_type?: string | null;
  image_url?: string | null;
  thumbnail_url?: string | null;
  thumbnail_file?: string | null;
  posted_at?: string | null;
  views_count?: number | null;
  hook_type?: HookType;
  hook_structure?: HookStructureItem[] | null;
  transcript_first_30s?: string | null;
  spoken_hook?: string | null;
  spoken_hook_de?: string | null;
};

const DATE_FMT = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
});

function formatViews(n: number | null | undefined): string | null {
  if (typeof n !== "number") return null;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return `${n}`;
}

export type IdeaCardVariant = "inbox" | "liked" | "commented" | "dismissed";

type Props = {
  idea: HookIdea;
  source?: ScrapedHook;
  variant: IdeaCardVariant;
  onFeedback: (idea: HookIdea) => void;
};

export function IdeaCard({ idea, source, variant, onFeedback }: Props) {
  const [captionOpen, setCaptionOpen] = useState(false);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [dismissMenuOpen, setDismissMenuOpen] = useState(false);
  const queryClient = useQueryClient();
  const {
    mutate: updateIdea,
    mutation: { isPending: isUpdating },
  } = useUpdate();
  const { mutate: createPost, mutation: { isPending: isCreating } } = useCreate();

  const busy = isUpdating || isCreating;

  const invalidateIdeas = () => {
    queryClient.invalidateQueries({ queryKey: ["hook_ideas_grid"] });
  };

  const setStatus = (status: HookIdea["status"], label: string) => {
    updateIdea(
      {
        resource: "hook_ideas",
        id: idea.id,
        values: { status },
        successNotification: false,
      },
      {
        onSuccess: () => {
          toast.success(label);
          invalidateIdeas();
        },
        onError: (e) => toast.error(`Fehler: ${e.message}`),
      }
    );
  };

  const dismissWithIntent = (intent: FeedbackIntent, label: string) => {
    updateIdea(
      {
        resource: "hook_ideas",
        id: idea.id,
        values: { status: "dismissed", feedback_intent: intent },
        successNotification: false,
      },
      {
        onSuccess: () => {
          toast.success(label);
          setDismissMenuOpen(false);
          invalidateIdeas();
        },
        onError: (e) => toast.error(`Fehler: ${e.message}`),
      }
    );
  };

  const moveToPipeline = () => {
    createPost(
      {
        resource: "content_posts",
        values: {
          hook_text: idea.adapted_hook_text,
          category: idea.category,
          status: "draft",
          source_idea_id: idea.id,
        },
        successNotification: false,
      },
      {
        onSuccess: () => {
          updateIdea(
            {
              resource: "hook_ideas",
              id: idea.id,
              values: { status: "used" },
              successNotification: false,
            },
            {
              onSuccess: () => {
                toast.success("In Pipeline übernommen");
                invalidateIdeas();
                queryClient.invalidateQueries({ queryKey: ["content_posts"] });
              },
              onError: (e) => toast.error(`Fehler: ${e.message}`),
            }
          );
        },
        onError: (e) => toast.error(`Fehler: ${e.message}`),
      }
    );
  };

  const rollType = source?.roll_type ?? null;
  const screenshotSrc =
    getAssetUrl(source?.thumbnail_file) ??
    source?.image_url ??
    source?.thumbnail_url ??
    null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full flex flex-col shadow-sm hover:shadow-md dark:shadow-black/40 transition-shadow duration-200 border-border/60">
        <CardContent className="flex-1 pt-6 space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5 min-w-0">
              <CategoryBadge category={idea.category} />
              <PatternBadge pattern={idea.hook_pattern} />
              <RollTypeBadge rollType={rollType} />
            </div>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono whitespace-nowrap shrink-0 pt-0.5">
              {idea.date_created && (
                <span title={`Idee erzeugt: ${new Date(idea.date_created).toLocaleString("de-DE")}`}>
                  {DATE_FMT.format(new Date(idea.date_created))}
                </span>
              )}
              {typeof idea.eval_score === "number" && (
                <span>· {idea.eval_score.toFixed(1)}</span>
              )}
            </div>
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

          {idea.martin_feedback && variant === "commented" && (
            <div className="rounded-md bg-muted/60 border border-border/60 p-3 space-y-1">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                Dein Feedback
              </p>
              <p className="text-xs leading-relaxed">{idea.martin_feedback}</p>
            </div>
          )}

          {source && (
            <div className="pt-3 border-t border-border space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                  Original
                </span>
                {source.account_username && (
                  <span className="text-[10px] text-muted-foreground font-mono">
                    @{source.account_username}
                    {source.viral_tier ? ` · ${source.viral_tier}-Tier` : ""}
                  </span>
                )}
              </div>
              {(source.posted_at || formatViews(source.views_count)) && (
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                  {source.posted_at && (
                    <span title={new Date(source.posted_at).toLocaleString("de-DE")}>
                      gepostet {DATE_FMT.format(new Date(source.posted_at))}
                    </span>
                  )}
                  {formatViews(source.views_count) && (
                    <span>· {formatViews(source.views_count)} Views</span>
                  )}
                </div>
              )}
              <ScreenshotPreview src={screenshotSrc} />
              {source.hook_type === "information_list" &&
                Array.isArray(source.hook_structure) &&
                source.hook_structure.length > 0 && (
                  <div className="rounded-md border border-amber-200/70 bg-amber-50/70 dark:bg-amber-900/20 dark:border-amber-800/40 px-3 py-2 space-y-2">
                    <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-medium text-amber-700 dark:text-amber-300">
                      <Quote className="h-3 w-3" />
                      Original Hook (Liste, Video)
                    </div>
                    <div className="space-y-1.5">
                      {source.hook_structure.map((block, i) => (
                        <div key={i} className="space-y-0.5">
                          {block.category && (
                            <p className="text-[11px] font-semibold text-foreground leading-snug">
                              {block.category}
                            </p>
                          )}
                          {Array.isArray(block.items) && block.items.length > 0 && (
                            <ul className="list-disc list-inside text-xs text-foreground/90 leading-snug space-y-0.5">
                              {block.items.map((item, j) => (
                                <li key={j}>{item}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              {source.visual_hook_text &&
                source.hook_type !== "information_list" && (
                  <div className="rounded-md border border-amber-200/70 bg-amber-50/70 dark:bg-amber-900/20 dark:border-amber-800/40 px-3 py-2 space-y-1">
                    <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-medium text-amber-700 dark:text-amber-300">
                      <Quote className="h-3 w-3" />
                      Original Hook (Video)
                    </div>
                    <p className="text-xs font-medium leading-snug text-foreground">
                      {source.visual_hook_text}
                    </p>
                  </div>
                )}
              {(source.spoken_hook || source.transcript_first_30s) && (
                <div className="rounded-md border border-sky-200/70 bg-sky-50/70 dark:bg-sky-900/20 dark:border-sky-800/40 px-3 py-2 space-y-1">
                  <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-medium text-sky-700 dark:text-sky-300">
                    <Quote className="h-3 w-3" />
                    Gesprochener Hook (A-Roll)
                  </div>
                  {source.spoken_hook_de ? (
                    <p className="text-xs font-medium leading-snug text-foreground">
                      {source.spoken_hook_de}
                    </p>
                  ) : source.spoken_hook ? (
                    <p className="text-xs font-medium leading-snug text-foreground">
                      {source.spoken_hook}
                    </p>
                  ) : null}
                  {source.spoken_hook && source.spoken_hook_de && (
                    <p className="text-[11px] italic text-muted-foreground leading-snug">
                      EN: {source.spoken_hook}
                    </p>
                  )}
                  {source.transcript_first_30s && (
                    <Collapsible open={transcriptOpen} onOpenChange={setTranscriptOpen}>
                      <CollapsibleTrigger className="inline-flex items-center gap-1 text-[11px] text-sky-700 dark:text-sky-300 hover:text-sky-900 dark:hover:text-sky-100 transition-colors">
                        {transcriptOpen ? (
                          <>
                            <ChevronUp className="h-3 w-3" />
                            Transkript einklappen
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-3 w-3" />
                            Transkript lesen (erste 30s)
                          </>
                        )}
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <p className="mt-2 text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                          {source.transcript_first_30s}
                        </p>
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                </div>
              )}
              {source.hook_text && (
                <p className="text-xs text-muted-foreground leading-snug line-clamp-3">
                  {source.hook_text}
                </p>
              )}
              {source.full_caption &&
                source.full_caption.trim() !== (source.hook_text ?? "").trim() && (
                  <Collapsible open={captionOpen} onOpenChange={setCaptionOpen}>
                    <CollapsibleTrigger className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
                      {captionOpen ? (
                        <>
                          <ChevronUp className="h-3 w-3" />
                          Caption einklappen
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3 w-3" />
                          Komplette Caption lesen
                        </>
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <p className="mt-2 text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {source.full_caption}
                      </p>
                    </CollapsibleContent>
                  </Collapsible>
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

        <CardFooter className="gap-2 border-t pt-4 flex-col items-stretch">
          {variant === "inbox" && !dismissMenuOpen && (
            <div className="flex gap-2">
              <Button
                size="default"
                className="flex-1 h-10 border bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border-emerald-200/80 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 dark:text-emerald-200 dark:border-emerald-800/60 shadow-none"
                disabled={busy}
                onClick={() => setStatus("liked", "Gefällt mir")}
                aria-label="Gefaellt mir"
              >
                <ThumbsUp className="h-4 w-4" />
              </Button>
              <Button
                size="default"
                className="flex-1 h-10 border bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-200/80 dark:bg-slate-800/60 dark:hover:bg-slate-800 dark:text-slate-200 dark:border-slate-700 shadow-none"
                disabled={busy}
                onClick={() => onFeedback(idea)}
                aria-label="Feedback"
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
              <Button
                size="default"
                className="flex-1 h-10 border bg-rose-100 hover:bg-rose-200 text-rose-900 border-rose-200/80 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 dark:text-rose-200 dark:border-rose-800/60 shadow-none"
                disabled={busy}
                onClick={() => setDismissMenuOpen(true)}
                aria-label="Verwerfen"
              >
                <ThumbsDown className="h-4 w-4" />
              </Button>
            </div>
          )}
          {variant === "inbox" && dismissMenuOpen && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-muted-foreground">
                  Warum verwerfen?
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => setDismissMenuOpen(false)}
                  aria-label="Abbrechen"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 h-9 text-xs"
                  disabled={busy}
                  onClick={() => dismissWithIntent("data_quality", "Verworfen (Daten-Fehler)")}
                  title="Thumbnail/Hook/Reel defekt - kein Learning-Signal"
                >
                  <AlertCircle className="h-3.5 w-3.5 mr-1" />
                  Daten-Fehler
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 h-9 text-xs"
                  disabled={busy}
                  onClick={() => dismissWithIntent("content_quality", "Verworfen (Content-Veto)")}
                  title="Idee passt inhaltlich nicht - Agent soll lernen"
                >
                  <ThumbsDown className="h-3.5 w-3.5 mr-1" />
                  Passt nicht
                </Button>
              </div>
            </div>
          )}

          {variant === "liked" && (
            <>
              <Button
                size="default"
                className="flex-1 h-10"
                disabled={busy}
                onClick={moveToPipeline}
              >
                <ArrowRight className="h-4 w-4 mr-1" />
                In Pipeline
              </Button>
              <Button
                size="default"
                variant="outline"
                className="h-10"
                disabled={busy}
                onClick={() => onFeedback(idea)}
                aria-label="Feedback"
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
              <Button
                size="default"
                variant="outline"
                className="h-10"
                disabled={busy}
                onClick={() => setStatus("dismissed", "Verworfen")}
                aria-label="Verwerfen"
              >
                <ThumbsDown className="h-4 w-4" />
              </Button>
            </>
          )}

          {variant === "commented" && (
            <>
              <Button
                size="default"
                className="flex-1 h-10 border bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border-emerald-200/80 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 dark:text-emerald-200 dark:border-emerald-800/60 shadow-none"
                disabled={busy}
                onClick={() => setStatus("liked", "Gefällt mir")}
                aria-label="Gefaellt mir"
              >
                <ThumbsUp className="h-4 w-4" />
              </Button>
              <Button
                size="default"
                variant="outline"
                className="flex-1 h-10"
                disabled={busy}
                onClick={() => onFeedback(idea)}
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                Feedback bearbeiten
              </Button>
              <Button
                size="default"
                variant="outline"
                className="h-10"
                disabled={busy}
                onClick={() => setStatus("dismissed", "Verworfen")}
                aria-label="Verwerfen"
              >
                <ThumbsDown className="h-4 w-4" />
              </Button>
            </>
          )}

          {variant === "dismissed" && (
            <>
              <Button
                size="default"
                className="flex-1 h-10"
                variant="secondary"
                disabled={busy}
                onClick={() => setStatus("new", "Reaktiviert")}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reaktivieren
              </Button>
              <Button
                size="default"
                variant="outline"
                className="h-10"
                disabled={busy}
                onClick={() => onFeedback(idea)}
                aria-label="Feedback"
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
