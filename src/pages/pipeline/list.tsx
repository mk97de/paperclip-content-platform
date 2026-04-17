import { KanbanBoard } from "@/components/pipeline/KanbanBoard";

export const PipelineList = () => (
  <div className="p-4 md:p-8 max-w-[1800px] mx-auto">
    <div className="mb-6">
      <h1 className="text-2xl font-semibold tracking-tight">Pipeline</h1>
      <p className="text-sm text-muted-foreground mt-1">
        content_posts nach Status · Karten zwischen Spalten ziehen ändert den DB-Status
      </p>
    </div>
    <KanbanBoard />
  </div>
);
