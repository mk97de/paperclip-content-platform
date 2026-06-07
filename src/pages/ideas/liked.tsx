import { IdeasGrid } from "@/components/ideas/IdeasGrid";

export const IdeasLiked = () => (
  <IdeasGrid
    title="Gefällt mir"
    subtitle="Ideen · in Pipeline übernehmen oder verwerfen"
    status="liked"
    variant="liked"
    unified
    emptyTitle="Noch keine Favoriten"
    emptyDescription="Like Ideen in der Inbox oder in Lexis Top-Content, dann erscheinen sie hier zur Pipeline-Übernahme."
  />
);
