import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { PostCard } from "./PostCard";
import type { ContentPost, PipelineStatus } from "./types";
import { cn } from "@/lib/utils";

type Props = {
  status: PipelineStatus;
  label: string;
  posts: ContentPost[];
};

export function KanbanColumn({ status, label, posts }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="flex flex-col min-w-[260px] md:min-w-0 md:flex-1">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </h3>
        <span className="text-xs text-muted-foreground font-mono">
          {posts.length}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 min-h-[60vh] rounded-lg border border-dashed border-border/60 p-2 space-y-2 transition-colors",
          isOver && "bg-muted/40 border-primary/40"
        )}
      >
        <SortableContext
          items={posts.map((p) => p.id)}
          strategy={verticalListSortingStrategy}
        >
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </SortableContext>
        {posts.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8">
            Leer
          </p>
        )}
      </div>
    </div>
  );
}
