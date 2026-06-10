import { useUpdate } from "@refinedev/core";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  RotateCcw,
  X,
  Check,
  Loader2,
  Mic,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CategoryBadge } from "./CategoryBadge";

// Teil F (Yapping) — Review-Karte fuer ein volles 4-Schichten-Yap-Skript (yap_ideas).
// Spiegelt die Rating-Mechanik von CaptionRow (Resource yap_ideas), zeigt aber zusaetzlich
// die Skript-Schichten (hook_line/script_body/beat_structure/voice_notes), persona und den
// Handwerks-Score (craft_tier/craft_score + weakest_axis als Coaching-Hebel — KEINE
// Reichweiten-Prognose, siehe yapping-coach Session-D).
export type YapIdea = {
  id: number;
  persona: "autoritaet" | "mix";
  hook_line: string;
  script_body: string;
  beat_structure: string | null;
  voice_notes: string | null;
  category: string | null;
  target_audience: string | null;
  rationale: string | null;
  craft_score: number | null;
  craft_tier: "stark" | "solide" | "luecken" | "flop" | null;
  weakest_axis: string | null;
  critic_verdict: "pass" | "revised" | "dropped" | null;
  critic_notes: string | null;
  status: "new" | "pending_critique" | "liked" | "dismissed" | "used";
  martin_feedback: string | null;
};

const PERSONA_LABEL: Record<string, string> = {
  autoritaet: "Autorität",
  mix: "Autorität + Lived-Experience",
};

const TIER_STYLE: Record<string, string> = {
  stark: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  solide: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200",
  luecken: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  flop: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200",
};

const AXIS_LABEL: Record<string, string> = {
  hook_claim: "Hook-Claim",
  hook_formel: "Hook-Formel",
  stake: "Open-Loop/Stake",
  themen_treue: "Themen-Treue",
  storyline: "Storyline/Hold",
  voice: "Voice",
  lived_exp: "Lived-Experience",
  cta: "CTA-Sog",
};

const INVALIDATE_KEY = "yap_ideas_review";

export function YapReviewCard({ yap }: { yap: YapIdea }) {
  const [dismissMenuOpen, setDismissMenuOpen] = useState(false);
  const [likeMenuOpen, setLikeMenuOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const queryClient = useQueryClient();
  const {
    mutate: updateYap,
    mutation: { isPending: busy },
  } = useUpdate();

  useEffect(() => {
    setFeedbackText(yap.martin_feedback ?? "");
  }, [yap.martin_feedback]);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [INVALIDATE_KEY] });

  const patch = (
    values: Record<string, unknown>,
    label: string,
    after?: () => void
  ) => {
    updateYap(
      { resource: "yap_ideas", id: yap.id, values, successNotification: false },
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

  const isNew = yap.status === "new";
  const isLiked = yap.status === "liked" || yap.status === "used";
  const isDismissed = yap.status === "dismissed";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.18 }}
    >
      <Card
        className={`border shadow-sm ${
          isDismissed
            ? "border-border/50 bg-muted/30 opacity-70"
            : isLiked
              ? "border-emerald-200/70 bg-emerald-50/40 dark:border-emerald-800/50 dark:bg-emerald-900/15"
              : "border-border/60"
        }`}
      >
        <CardContent className="pt-5 space-y-3">
          {/* Badges */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 rounded bg-[#7170ff]/10 text-[#7170ff] px-1.5 py-0.5 text-[10px] font-medium">
              <Mic className="h-3 w-3" />
              {PERSONA_LABEL[yap.persona] ?? yap.persona}
            </span>
            <CategoryBadge category={yap.category} />
            {yap.craft_tier && (
              <span
                className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${
                  TIER_STYLE[yap.craft_tier] ?? "bg-muted text-muted-foreground"
                }`}
                title="Handwerks-Score (kein Reichweiten-Versprechen)"
              >
                {yap.craft_tier}
                {typeof yap.craft_score === "number" ? ` · ${yap.craft_score}/24` : ""}
              </span>
            )}
            {yap.weakest_axis && (
              <span className="inline-flex items-center rounded bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300 px-1.5 py-0.5 text-[10px] font-mono">
                schwächste Achse: {AXIS_LABEL[yap.weakest_axis] ?? yap.weakest_axis}
              </span>
            )}
            {yap.critic_verdict === "revised" && (
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

          {/* Schicht 1 — Hook */}
          <p className="text-base font-semibold leading-snug">{yap.hook_line}</p>

          {yap.target_audience && (
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Zielgruppe:</span> {yap.target_audience}
            </p>
          )}

          {/* Schicht 1/2 — volles Sprech-Skript */}
          <div className="rounded-md border border-border/60 bg-muted/20 px-3 py-2.5">
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium mb-1">
              Skript
            </p>
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
              {yap.script_body}
            </p>
          </div>

          {/* Schicht 2 — Beat-Struktur */}
          {yap.beat_structure && (
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              <span className="font-medium uppercase tracking-wider text-[9px]">
                Beat-Struktur:
              </span>{" "}
              {yap.beat_structure}
            </p>
          )}

          {/* Schicht 3 — Voice/Delivery */}
          {yap.voice_notes && (
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              <span className="font-medium uppercase tracking-wider text-[9px]">
                Voice:
              </span>{" "}
              {yap.voice_notes}
            </p>
          )}

          {yap.rationale && (
            <p className="text-[11px] text-muted-foreground italic leading-relaxed">
              {yap.rationale}
            </p>
          )}

          {/* Schicht 3 — Critic-Handwerksnotiz */}
          {yap.critic_notes && (
            <div className="rounded bg-muted/60 border border-border/60 px-2.5 py-1.5">
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">
                Craft-Notiz (Handwerk, keine Reichweite)
              </p>
              <p className="text-[11px] leading-relaxed">{yap.critic_notes}</p>
            </div>
          )}

          {yap.martin_feedback && (
            <div className="rounded bg-muted/60 border border-border/60 px-2.5 py-1.5">
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">
                Dein Feedback
              </p>
              <p className="text-[11px] leading-relaxed">{yap.martin_feedback}</p>
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
                  patch({ status: "liked" }, "Gefällt mir", () =>
                    setLikeMenuOpen(false)
                  )
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
                  Wirklich verwerfen?
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
              <Button
                size="sm"
                variant="outline"
                className="w-full h-8 text-xs"
                disabled={busy}
                onClick={() =>
                  patch({ status: "dismissed" }, "Verworfen", () =>
                    setDismissMenuOpen(false)
                  )
                }
              >
                <ThumbsDown className="h-3.5 w-3.5 mr-1" />
                Verwerfen
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full h-8 text-xs"
                disabled={busy}
                onClick={() =>
                  patch({ status: "dismissed" }, "Verworfen — Notiz folgt", () => {
                    setDismissMenuOpen(false);
                    setFeedbackOpen(true);
                  })
                }
              >
                <MessageSquare className="h-3.5 w-3.5 mr-1" />
                Verwerfen — mit Begründung
              </Button>
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
                <DialogTitle>Feedback zu diesem Yap-Skript</DialogTitle>
                <DialogDescription>
                  Optional — kurze Notiz, was am Skript gut/schwach ist. Hilft Claude
                  beim Lernen (Feedback-Loop, Teil G).
                </DialogDescription>
              </DialogHeader>
              <p className="text-sm text-muted-foreground border-l-2 pl-3 italic line-clamp-3">
                {yap.hook_line}
              </p>
              <Textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="z.B. Hook zu abstrakt, konkreteren Anker in Satz 1"
                rows={4}
              />
              <DialogFooter>
                <Button
                  variant="ghost"
                  onClick={() => setFeedbackOpen(false)}
                  disabled={busy}
                >
                  Abbrechen
                </Button>
                <Button onClick={submitFeedback} disabled={busy}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Speichern"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </motion.div>
  );
}
