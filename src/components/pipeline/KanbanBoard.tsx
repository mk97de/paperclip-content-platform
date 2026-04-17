import { useMemo, useState } from "react";
import { useList, useUpdate } from "@refinedev/core";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { KanbanColumn } from "./KanbanColumn";
import { PostCard } from "./PostCard";
import {
  PIPELINE_COLUMNS,
  type ContentPost,
  type PipelineStatus,
} from "./types";

export function KanbanBoard() {
  const {
    result,
    query: { isLoading, isError, refetch },
  } = useList<ContentPost>({
    resource: "content_posts",
    pagination: { pageSize: 500 },
    sorters: [{ field: "date_updated", order: "desc" }],
  });

  const posts = result?.data ?? [];

  const { mutate: updatePost } = useUpdate();
  const [activeId, setActiveId] = useState<number | null>(null);
  const [optimistic, setOptimistic] = useState<Record<number, PipelineStatus>>({});

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  const grouped = useMemo(() => {
    const g: Record<PipelineStatus, ContentPost[]> = {
      draft: [],
      ready: [],
      on_hold: [],
      approved: [],
      published: [],
      archived: [],
    };
    for (const p of posts) {
      const effectiveStatus = optimistic[p.id] ?? p.status;
      if (effectiveStatus in g) {
        g[effectiveStatus as PipelineStatus].push({ ...p, status: effectiveStatus });
      }
    }
    return g;
  }, [posts, optimistic]);

  const activePost = activeId
    ? posts.find((p) => p.id === activeId) ?? null
    : null;

  const onDragStart = (e: DragStartEvent) => {
    setActiveId(Number(e.active.id));
  };

  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    if (!e.over) return;
    const postId = Number(e.active.id);
    const newStatus = String(e.over.id) as PipelineStatus;
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    const prevStatus = optimistic[postId] ?? post.status;
    if (prevStatus === newStatus) return;

    setOptimistic((m) => ({ ...m, [postId]: newStatus }));

    updatePost(
      {
        resource: "content_posts",
        id: postId,
        values: { status: newStatus },
        successNotification: false,
      },
      {
        onSuccess: () => {
          toast.success(`→ ${newStatus}`);
          refetch();
        },
        onError: (err) => {
          toast.error(`Fehler: ${err.message}`);
          setOptimistic((m) => {
            const next = { ...m };
            delete next[postId];
            return next;
          });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-destructive">
        Fehler beim Laden der content_posts.
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-3 lg:grid-cols-6 md:overflow-visible">
        {PIPELINE_COLUMNS.map((col) => (
          <KanbanColumn
            key={col.status}
            status={col.status}
            label={col.label}
            posts={grouped[col.status]}
          />
        ))}
      </div>
      <DragOverlay>
        {activePost ? <PostCard post={activePost} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
