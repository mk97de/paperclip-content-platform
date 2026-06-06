import { IdeasGrid } from "@/components/ideas/IdeasGrid";

// Buendel O Phase 4c — "Lexis Top-Content": Hook-Ideen, die aus Alexandras EIGENEN
// S/A-Gewinner-Reels per strukturellem Pattern-Transfer generiert wurden
// (source_ig_media_id gesetzt, Quelle = ig_post_performance statt scraped_hooks).
export const IdeasOwn = () => (
  <IdeasGrid
    title="Lexis Top-Content"
    subtitle="Ideen aus eigenen Top-Reels · Like, Dismiss oder Feedback geben"
    status="new"
    variant="inbox"
    ownMode
    emptyTitle="Noch keine eigenen Ideen"
    emptyDescription="Der Generator läuft wöchentlich (So) aus deinen S/A-Gewinner-Reels. Nach dem Critic (täglich 07:32) erscheinen sie hier."
  />
);
