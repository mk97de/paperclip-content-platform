import { IdeasGrid } from "@/components/ideas/IdeasGrid";

export const IdeasDismissed = () => (
  <IdeasGrid
    title="Verworfen"
    subtitle="Ideen · reaktivieren falls doch brauchbar"
    status="dismissed"
    variant="dismissed"
    emptyTitle="Nichts verworfen"
    emptyDescription="Verworfene Ideen landen hier und können jederzeit reaktiviert werden."
  />
);
