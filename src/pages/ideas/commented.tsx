import { IdeasGrid } from "@/components/ideas/IdeasGrid";

export const IdeasCommented = () => (
  <IdeasGrid
    title="Kommentiert"
    subtitle="Ideen mit Feedback · zum Nacharbeiten"
    status={null}
    onlyCommented
    variant="commented"
    emptyTitle="Keine kommentierten Ideen"
    emptyDescription="Ideen mit Feedback landen hier automatisch, sortiert nach letzter Änderung."
  />
);
