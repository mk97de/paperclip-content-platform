import { useList } from "@refinedev/core";
import { Loader2, Archive } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CategoryBadge } from "@/components/ideas/CategoryBadge";
import { EmptyState } from "@/components/shared/EmptyState";

type ContentPost = {
  id: number;
  hook_text: string | null;
  category: string | null;
  status: string | null;
  caption_type: string | null;
  published_date: string | null;
  date_updated: string | null;
};

export const ArchiveList = () => {
  const {
    result,
    query: { isLoading },
  } = useList<ContentPost>({
    resource: "content_posts",
    filters: [
      { field: "status", operator: "in", value: "published,archived" as never },
    ] as never,
    sorters: [{ field: "date_updated", order: "desc" }],
    pagination: { pageSize: 200 },
  });

  const posts = result?.data ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Archiv</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {posts.length} veröffentlichte oder archivierte Posts
        </p>
      </div>

      {posts.length === 0 ? (
        <EmptyState
          icon={<Archive className="h-6 w-6" />}
          title="Archiv leer"
          description="Sobald Posts den Status 'published' oder 'archived' haben, tauchen sie hier auf."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((p) => (
            <Card key={p.id} className="border-border/60">
              <CardContent className="pt-6 space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  <CategoryBadge category={p.category} />
                  {p.status && (
                    <Badge variant="outline" className="text-[10px]">
                      {p.status}
                    </Badge>
                  )}
                  {p.caption_type && (
                    <Badge variant="outline" className="text-[10px]">
                      {p.caption_type}
                    </Badge>
                  )}
                </div>
                <p className="text-sm font-semibold leading-snug line-clamp-4">
                  {p.hook_text ?? "(ohne Hook)"}
                </p>
                {p.published_date && (
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Veröffentlicht: {new Date(p.published_date).toLocaleDateString("de-DE")}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
