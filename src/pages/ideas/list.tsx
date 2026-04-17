import { IdeasGrid } from "@/components/ideas/IdeasGrid";

export const IdeasList = () => (
  <IdeasGrid
    title="Inbox"
    subtitle="neue Ideen · Like, Dismiss oder Feedback geben"
    status="new"
    variant="inbox"
    emptyTitle="Inbox leer"
    emptyDescription="Keine neuen Ideen. Schau morgen wieder rein — der Scraper läuft Montags."
  />
);
