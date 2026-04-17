import { Badge } from "@/components/ui/badge";
import { CATEGORY_COLOR, CATEGORY_LABEL } from "@/lib/categories";
import { cn } from "@/lib/utils";

type Props = {
  category: string | null | undefined;
  className?: string;
};

export function CategoryBadge({ category, className }: Props) {
  if (!category) return null;
  const color = CATEGORY_COLOR[category] ?? "bg-muted text-foreground border-border";
  return (
    <Badge className={cn("border", color, className)}>
      {CATEGORY_LABEL[category] ?? category}
    </Badge>
  );
}
