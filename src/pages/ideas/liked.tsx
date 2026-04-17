import { IdeasGrid } from "@/components/ideas/IdeasGrid";

export const IdeasLiked = () => (
  <IdeasGrid
    title="Gefällt mir"
    subtitle="Ideen · in Pipeline übernehmen oder verwerfen"
    status="liked"
    variant="liked"
    emptyTitle="Noch keine Favoriten"
    emptyDescription="Like Ideen in der Inbox, dann erscheinen sie hier zur Pipeline-Übernahme."
  />
);
