import { useQuery } from "@tanstack/react-query";
import { readItems } from "@directus/sdk";
import { AnimatePresence } from "framer-motion";
import { Loader2, Mic } from "lucide-react";

import { directusClient } from "@/providers/directus";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { YapReviewCard, type YapIdea } from "./YapReviewCard";

// Teil F (Yapping) — Review-Surface fuer volle 4-Schichten-Yap-Skripte (yap_ideas).
// yap-idea-gen erzeugt 2 Persona-Skripte (Autoritaet + Mix) pro Donor-Yap, yap-critic
// finalisiert sie auf status=new mit Handwerks-Score. Hier bewertet Martin sie
// (Like/Feedback/Dismiss) — analog zur Caption-Review, aber als flache Skript-Liste.

const YAP_FIELDS = [
  "id",
  "persona",
  "hook_line",
  "script_body",
  "beat_structure",
  "voice_notes",
  "category",
  "target_audience",
  "rationale",
  "craft_score",
  "craft_tier",
  "weakest_axis",
  "critic_verdict",
  "critic_notes",
  "status",
  "martin_feedback",
];

export function YapReviewGrid() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["yap_ideas_review"],
    queryFn: async () =>
      directusClient.request(
        readItems("yap_ideas" as never, {
          filter: { status: { _in: ["new", "liked", "dismissed"] } },
          fields: YAP_FIELDS,
          sort: ["-date_created"],
          limit: 200,
        } as never)
      ) as Promise<YapIdea[]>,
    staleTime: 30_000,
  });

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
        <p className="text-destructive">Fehler beim Laden der Yap-Skripte.</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Neu laden
        </Button>
      </div>
    );
  }

  const yaps = data ?? [];
  const newCount = yaps.filter((y) => y.status === "new").length;

  return (
    <div className="p-4 md:p-8 max-w-[1100px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Yapping</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {yaps.length} Yap-Skript{yaps.length !== 1 ? "e" : ""}
          {" · "}
          {newCount} neu · volle Sprech-Skripte (Hook + Beats + Voice), je 2 Personas pro
          Donor-Yap · Like, Dismiss oder Feedback
        </p>
      </div>

      {yaps.length === 0 ? (
        <EmptyState
          icon={<Mic className="h-6 w-6" />}
          title="Noch keine Yap-Skripte"
          description="Sobald ein Yap-Donor (heal.with.fifi, catts_corner) transkribiert ist, erzeugt yap-idea-gen (alle 2 Tage 07:10) zwei Persona-Skripte pro Donor-Yap, die der yap-critic (07:47) finalisiert — sie erscheinen dann hier."
        />
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {yaps.map((yap) => (
              <YapReviewCard key={yap.id} yap={yap} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
