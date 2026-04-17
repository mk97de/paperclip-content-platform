import { Badge } from "@/components/ui/badge";
import { Mic, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  rollType: "a_roll" | "b_roll" | string | null | undefined;
  className?: string;
};

export function RollTypeBadge({ rollType, className }: Props) {
  if (rollType !== "a_roll" && rollType !== "b_roll") return null;
  const isA = rollType === "a_roll";
  return (
    <Badge
      variant="outline"
      className={cn("font-normal gap-1 text-[10px]", className)}
    >
      {isA ? <Mic className="h-3 w-3" /> : <Layers className="h-3 w-3" />}
      {isA ? "A-Roll" : "B-Roll"}
    </Badge>
  );
}
