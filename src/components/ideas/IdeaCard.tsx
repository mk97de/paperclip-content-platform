import { useUpdate, useCreate } from "@refinedev/core";
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  ExternalLink,
  RotateCcw,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { CategoryBadge } from "./CategoryBadge";
import { PatternBadge } from "./PatternBadge";
import { RollTypeBadge } from "./RollTypeBadge";
import { ScreenshotPreview } from "./ScreenshotPreview";

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
};

export type ScrapedHook = {
  id: number;
  hook_text: string | null;
  post_url: string | null;
  account_username: string | null;
  viral_tier: string | null;
  roll_type?: string | null;
  image_url?: string | null;
  thumbnail_url?: string | null;
};

export type IdeaCardVariant = "inbox" | "liked" | "commented" | "dismissed";

type Props = {
  idea: HookIdea;
  source?: ScrapedHook;
  variant: IdeaCardVariant;
  onFeedback: (idea: HookIdea) => void;
};

export function IdeaCard({ idea, source, variant, onFeedback }: Props) {
  const {
    mutate: updateIdea,
    mutation: { isPending: isUpdating },
  } = useUpdate();
  const { mutate: createPost, mutation: { isPending: isCreating } } = useCreate();

  const busy = isUpdating || isCreating;

  const setStatus = (status: HookIdea["status"], label: string) => {
    updateIdea(
      {
        resource: "hook_ideas",
        id: idea.id,
        values: { status },
        successNotification: false,
      },
      {
        onSuccess: () => toast.success(label),
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
              onSuccess: () => toast.success("In Pipeline übernommen"),
              onError: (e) => toast.error(`Fehler: ${e.message}`),
            }
          );
        },
        onError: (e) => toast.error(`Fehler: ${e.message}`),
      }
    );
  };

  const rollType = source?.roll_type ?? null;
  const screenshotSrc = source?.image_url ?? source?.thumbnail_url ?? null;

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
          <div className="flex flex-wrap items-center gap-1.5">
            <CategoryBadge category={idea.category} />
            <PatternBadge pattern={idea.hook_pattern} />
            <RollTypeBadge rollType={rollType} />
            {typeof idea.eval_score === "number" && (
              <span className="ml-auto text-xs font-mono text-muted-foreground">
                {idea.eval_score.toFixed(1)}
              </span>
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
              <div className="flex items-center justify-between gap-2">
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
              <ScreenshotPreview src={screenshotSrc} />
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
          {variant === "inbox" && (
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
                onClick={() => setStatus("dismissed", "Verworfen")}
                aria-label="Verwerfen"
              >
                <ThumbsDown className="h-4 w-4" />
              </Button>
            </>
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
