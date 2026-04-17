import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { CATEGORY_EVENT_HEX, CATEGORY_LABEL } from "@/lib/categories";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ContentPost } from "./types";

type Props = {
  post: ContentPost;
  dragOverlay?: boolean;
};

export function PostCard({ post, dragOverlay }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: post.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging && !dragOverlay ? 0.3 : 1,
    borderLeftColor: post.category
      ? CATEGORY_EVENT_HEX[post.category] ?? "#94a3b8"
      : "#94a3b8",
  };

  const categoryLabel = post.category
    ? CATEGORY_LABEL[post.category] ?? post.category
    : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group bg-card rounded-md border border-border/70 border-l-4 p-3 shadow-sm",
        "hover:shadow-md hover:border-border transition-shadow",
        dragOverlay && "shadow-xl ring-2 ring-primary/40"
      )}
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          type="button"
          className="mt-0.5 -ml-1 shrink-0 text-muted-foreground/50 hover:text-muted-foreground cursor-grab active:cursor-grabbing touch-none"
          aria-label="Ziehen"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {categoryLabel && (
              <span className="text-[10px] font-medium tracking-wide uppercase text-muted-foreground">
                {categoryLabel}
              </span>
            )}
            {typeof post.eval_score === "number" && (
              <span className="ml-auto text-[11px] font-mono text-muted-foreground">
                {post.eval_score.toFixed(1)}
              </span>
            )}
          </div>

          <p className="text-sm font-medium leading-snug line-clamp-4">
            {post.hook_text ?? "(ohne Hook)"}
          </p>

          <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
            {post.caption_type && (
              <Badge variant="outline" className="font-normal h-5">
                {post.caption_type}
              </Badge>
            )}
            {post.posting_slot && (
              <span className="text-muted-foreground font-mono">
                {new Date(post.posting_slot).toLocaleDateString("de-DE", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "2-digit",
                })}
              </span>
            )}
          </div>

          {post.human_feedback && (
            <p className="text-[11px] text-muted-foreground italic border-l-2 pl-2 line-clamp-2 leading-snug">
              {post.human_feedback}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
