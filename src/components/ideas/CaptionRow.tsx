import { useUpdate } from "@refinedev/core";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  RotateCcw,
  X,
  AlertCircle,
  Check,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { type FeedbackIntent } from "./IdeaCard";

// Buendel O Phase 4d — Caption-Kandidat zu einem gelikten eigenen Hook.
// Spiegelt die Rating-Mechanik von IdeaCard (Resource caption_ideas), bleibt aber
// eigenstaendig, damit die taeglich genutzte Hook-Inbox unangetastet bleibt.
export type CaptionIdea = {
  id: number;
  hook_idea_id: number;
  caption_text: string;
  caption_variant: number | null;
  caption_pattern: string | null;
  category: string | null;
  target_audience: string | null;
  rationale: string | null;
  status: "new" | "pending_critique" | "liked" | "dismissed" | "used";
  martin_feedback: string | null;
  feedback_intent?: FeedbackIntent;
  critic_verdict?: string | null;
  critic_notes?: string | null;
};

const PATTERN_LABEL: Record<string, string> = {
  liste: "LISTE",
  story: "STORY",
  pasc: "PASC",
};

const INVALIDATE_KEY = "caption_ideas_review";

export function CaptionRow({ caption }: { caption: CaptionIdea }) {
  const [dismissMenuOpen, setDismissMenuOpen] = useState(false);
  const [likeMenuOpen, setLikeMenuOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const queryClient = useQueryClient();
  const {
    mutate: updateCaption,
    mutation: { isPending: busy },
  } = useUpdate();

  useEffect(() => {
    setFeedbackText(caption.martin_feedback ?? "");
  }, [caption.martin_feedback]);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [INVALIDATE_KEY] });

  const patch = (
    values: Record<string, unknown>,
    label: string,
    after?: () => void
  ) => {
    updateCaption(
      { resource: "caption_ideas", id: caption.id, values, successNotification: false },
      {
        onSuccess: () => {
          toast.success(label);
          invalidate();
          after?.();
        },
        onError: (e) => toast.error(`Fehler: ${e.message}`),
      }
    );
  };

  const submitFeedback = () => {
    patch(
      { martin_feedback: feedbackText.trim() || null },
      "Feedback gespeichert",
      () => setFeedbackOpen(false)
    );
  };

  const isNew = caption.status === "new";
  const isLiked = caption.status === "liked" || caption.status === "used";
  const isDismissed = caption.status === "dismissed";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.18 }}
      className={`rounded-md border p-3 space-y-2 ${
        isDismissed
          ? "border-border/50 bg-muted/30 opacity-70"
          : isLiked
            ? "border-emerald-200/70 bg-emerald-50/40 dark:border-emerald-800/50 dark:bg-emerald-900/15"
            : "border-border/60 bg-background"
      }`}
    >
      <div className="flex items-center gap-1.5 flex-wrap">
        {caption.caption_pattern && (
          <span className="inline-flex items-center rounded bg-[#7170ff]/10 text-[#7170ff] px-1.5 py-0.5 text-[10px] font-mono font-medium">
            {PATTERN_LABEL[caption.caption_pattern] ?? caption.caption_pattern}
          </span>
        )}
        {typeof caption.caption_variant === "number" && (
          <span className="text-[10px] text-muted-foreground font-mono">
            Variante {caption.caption_variant}
          </span>
        )}
        {caption.critic_verdict === "revised" && (
          <span className="text-[10px] text-amber-700 dark:text-amber-300 font-mono">
            · vom Critic überarbeitet
          </span>
        )}
        {isLiked && (
          <span className="ml-auto inline-flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-300 font-medium">
            <Check className="h-3 w-3" /> Gefällt mir
          </span>
        )}
      </div>

      <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
        {caption.caption_text}
      </p>

      {caption.rationale && (
        <p className="text-[11px] text-muted-foreground italic leading-relaxed">
          {caption.rationale}
        </p>
      )}

      {caption.martin_feedback && (
        <div className="rounded bg-muted/60 border border-border/60 px-2.5 py-1.5">
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">
            Dein Feedback
          </p>
          <p className="text-[11px] leading-relaxed">{caption.martin_feedback}</p>
        </div>
      )}

      {/* Rating-Footer */}
      {isNew && !dismissMenuOpen && !likeMenuOpen && (
        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            className="flex-1 h-8 border bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border-emerald-200/80 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 dark:text-emerald-200 dark:border-emerald-800/60 shadow-none"
            disabled={busy}
            onClick={() => setLikeMenuOpen(true)}
            aria-label="Gefaellt mir"
          >
            <ThumbsUp className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            className="flex-1 h-8 border bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-200/80 dark:bg-slate-800/60 dark:hover:bg-slate-800 dark:text-slate-200 dark:border-slate-700 shadow-none"
            disabled={busy}
            onClick={() => setFeedbackOpen(true)}
            aria-label="Feedback"
          >
            <MessageSquare className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            className="flex-1 h-8 border bg-rose-100 hover:bg-rose-200 text-rose-900 border-rose-200/80 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 dark:text-rose-200 dark:border-rose-800/60 shadow-none"
            disabled={busy}
            onClick={() => setDismissMenuOpen(true)}
            aria-label="Verwerfen"
          >
            <ThumbsDown className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {isNew && likeMenuOpen && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground">
              Gefällt mir — wie?
            </span>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={() => setLikeMenuOpen(false)}
              aria-label="Abbrechen"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="w-full h-8 text-xs"
            disabled={busy}
            onClick={() =>
              patch({ status: "liked" }, "Gefällt mir", () => setLikeMenuOpen(false))
            }
          >
            <ThumbsUp className="h-3.5 w-3.5 mr-1" />
            Gefällt mir
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="w-full h-8 text-xs"
            disabled={busy}
            onClick={() =>
              patch({ status: "liked" }, "Gefällt mir — Notiz folgt", () => {
                setLikeMenuOpen(false);
                setFeedbackOpen(true);
              })
            }
          >
            <MessageSquare className="h-3.5 w-3.5 mr-1" />
            Gefällt mir — mit Begründung
          </Button>
        </div>
      )}

      {isNew && dismissMenuOpen && (
        <div className="space-y-2 pt-1">
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
              className="flex-1 h-8 text-xs"
              disabled={busy}
              onClick={() =>
                patch(
                  { status: "dismissed", feedback_intent: "data_quality" },
                  "Verworfen (Daten-Fehler)",
                  () => setDismissMenuOpen(false)
                )
              }
              title="Anzeige/Daten defekt - kein Learning-Signal"
            >
              <AlertCircle className="h-3.5 w-3.5 mr-1" />
              Daten-Fehler
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-8 text-xs"
              disabled={busy}
              onClick={() =>
                patch(
                  { status: "dismissed", feedback_intent: "content_quality" },
                  "Verworfen (Content-Veto)",
                  () => setDismissMenuOpen(false)
                )
              }
              title="Caption passt inhaltlich nicht - Agent soll lernen"
            >
              <ThumbsDown className="h-3.5 w-3.5 mr-1" />
              Passt nicht
            </Button>
          </div>
        </div>
      )}

      {(isLiked || isDismissed) && (
        <div className="flex gap-2 pt-1">
          {isDismissed && (
            <Button
              size="sm"
              variant="secondary"
              className="flex-1 h-8 text-xs"
              disabled={busy}
              onClick={() => patch({ status: "new" }, "Reaktiviert")}
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Reaktivieren
            </Button>
          )}
          {isLiked && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-8 text-xs"
              disabled={busy}
              onClick={() => patch({ status: "dismissed" }, "Verworfen")}
            >
              <ThumbsDown className="h-3.5 w-3.5 mr-1" />
              Doch verwerfen
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            disabled={busy}
            onClick={() => setFeedbackOpen(true)}
            aria-label="Feedback"
          >
            <MessageSquare className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Feedback zu dieser Caption</DialogTitle>
            <DialogDescription>
              Optional — kurze Notiz, warum die Caption passt (oder nicht). Hilft Claude beim Lernen.
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground border-l-2 pl-3 italic line-clamp-3">
            {caption.caption_text}
          </p>
          <Textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="z.B. CTA zu werblich, bitte sanfter"
            rows={4}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setFeedbackOpen(false)} disabled={busy}>
              Abbrechen
            </Button>
            <Button onClick={submitFeedback} disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Speichern"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
