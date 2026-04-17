import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CategoryBadge } from "@/components/ideas/CategoryBadge";
import type { ContentPost } from "./types";

type Props = {
  post: ContentPost;
};

export function PostCard({ post }: Props) {
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
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card className="cursor-grab active:cursor-grabbing border-border/60 hover:shadow-md transition-shadow">
        <CardContent className="p-3 space-y-2">
          <div className="flex items-center justify-between gap-1 flex-wrap">
            <CategoryBadge category={post.category} className="text-[10px]" />
            {typeof post.eval_score === "number" && (
              <span className="text-[11px] font-mono text-muted-foreground">
                {post.eval_score.toFixed(1)}
              </span>
            )}
          </div>
          <p className="text-sm font-medium leading-snug line-clamp-4">
            {post.hook_text ?? "(ohne Hook)"}
          </p>
          <div className="flex flex-wrap items-center gap-1">
            {post.caption_type && (
              <Badge variant="outline" className="text-[10px] font-normal">
                {post.caption_type}
              </Badge>
            )}
            {post.posting_slot && (
              <span className="text-[10px] text-muted-foreground">
                {new Date(post.posting_slot).toLocaleDateString("de-DE", {
                  day: "2-digit",
                  month: "2-digit",
                })}
              </span>
            )}
          </div>
          {post.human_feedback && (
            <p className="text-[10px] text-muted-foreground italic border-l-2 pl-2 line-clamp-2">
              {post.human_feedback}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
