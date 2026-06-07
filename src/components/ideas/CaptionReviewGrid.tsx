import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { readItems } from "@directus/sdk";
import { AnimatePresence } from "framer-motion";
import { Loader2, Inbox } from "lucide-react";

import { directusClient } from "@/providers/directus";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { CategoryBadge } from "./CategoryBadge";
import { CaptionRow, type CaptionIdea } from "./CaptionRow";

// Buendel O Phase 4d — "Caption-Review": gelikte EIGENE Hooks (hook_ideas status=liked,
// source_ig_media_id gesetzt) mit ihren Caption-Vorschlaegen (caption_ideas). Ergebnis =
// approved Hook + approved Caption = 1 Beitrag. Eigene Ansicht, weil gelikte Hooks die
// "Lexis Top-Content"-Inbox (status=new) verlassen.

type LikedHook = {
  id: number;
  adapted_hook_text: string;
  category: string | null;
  target_audience: string | null;
  source_ig_media_id: string | null;
  date_created: string | null;
};

const HOOK_FIELDS = [
  "id",
  "adapted_hook_text",
  "category",
  "target_audience",
  "source_ig_media_id",
  "date_created",
];

const CAPTION_FIELDS = [
  "id",
  "hook_idea_id",
  "caption_text",
  "caption_variant",
  "caption_pattern",
  "category",
  "target_audience",
  "rationale",
  "status",
  "martin_feedback",
  "feedback_intent",
  "critic_verdict",
  "critic_notes",
];

export function CaptionReviewGrid() {
  const {
    data: hooks,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["caption_review_hooks"],
    queryFn: async () =>
      directusClient.request(
        readItems("hook_ideas" as never, {
          filter: {
            status: { _eq: "liked" },
            source_ig_media_id: { _nnull: true },
          },
          fields: HOOK_FIELDS,
          sort: ["-date_created"],
          limit: 200,
        } as never)
      ) as Promise<LikedHook[]>,
    staleTime: 30_000,
  });

  const hookIds = useMemo(() => (hooks ?? []).map((h) => h.id), [hooks]);

  const { data: captions } = useQuery({
    queryKey: ["caption_ideas_review", hookIds.slice().sort((a, b) => a - b).join(",")],
    queryFn: async () => {
      if (hookIds.length === 0) return [] as CaptionIdea[];
      return directusClient.request(
        readItems("caption_ideas" as never, {
          filter: {
            hook_idea_id: { _in: hookIds },
            status: { _in: ["new", "liked", "dismissed"] },
          },
          fields: CAPTION_FIELDS,
          sort: ["caption_variant"],
          limit: -1,
        } as never)
      ) as Promise<CaptionIdea[]>;
    },
    enabled: hookIds.length > 0,
    staleTime: 30_000,
  });

  const captionsByHook = useMemo(() => {
    const m = new Map<number, CaptionIdea[]>();
    (captions ?? []).forEach((c) => {
      const arr = m.get(c.hook_idea_id) ?? [];
      arr.push(c);
      m.set(c.hook_idea_id, arr);
    });
    return m;
  }, [captions]);

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
        <p className="text-destructive">Fehler beim Laden der Captions.</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Neu laden
        </Button>
      </div>
    );
  }

  const likedHooks = hooks ?? [];
  const totalCaptions = captions?.length ?? 0;

  return (
    <div className="p-4 md:p-8 max-w-[1100px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Caption-Review</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {likedHooks.length} gelikte{likedHooks.length !== 1 ? "" : "r"} eigene
          {likedHooks.length !== 1 ? "" : "r"} Hook{likedHooks.length !== 1 ? "s" : ""}
          {" · "}
          {totalCaptions} Caption-Vorschl{totalCaptions !== 1 ? "äge" : "ag"} · Like, Dismiss oder Feedback
        </p>
      </div>

      {likedHooks.length === 0 ? (
        <EmptyState
          icon={<Inbox className="h-6 w-6" />}
          title="Noch keine gelikten eigenen Hooks"
          description="Like zuerst einen Hook unter „Lexis Top-Content“. Danach generiert der Caption-Generator (täglich 08:30) passende Captions, die der Critic (08:45) finalisiert — sie erscheinen dann hier."
        />
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {likedHooks.map((hook) => {
              const caps = captionsByHook.get(hook.id) ?? [];
              return (
                <Card key={hook.id} className="border-border/60 shadow-sm">
                  <CardContent className="pt-5 space-y-3">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <CategoryBadge category={hook.category} />
                        <span className="inline-flex items-center rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200 px-1.5 py-0.5 text-[10px] font-medium">
                          Hook gelikt
                        </span>
                      </div>
                    </div>
                    <p className="text-base font-semibold leading-snug">
                      {hook.adapted_hook_text}
                    </p>
                    {hook.target_audience && (
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">Zielgruppe:</span>{" "}
                        {hook.target_audience}
                      </p>
                    )}

                    <div className="pt-2 border-t border-border space-y-2">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                        Caption-Vorschläge ({caps.length})
                      </p>
                      {caps.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic">
                          Captions werden generiert (täglich 08:30 → Critic 08:45). Schau später nochmal rein.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          <AnimatePresence mode="popLayout">
                            {caps.map((c) => (
                              <CaptionRow key={c.id} caption={c} />
                            ))}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
