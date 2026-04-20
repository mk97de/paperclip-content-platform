import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type Delta = {
  value: string;
  direction: "up" | "down" | "flat";
  /** Whether "up" should be rendered as positive (green). For metrics where up is bad (skip-rate), set to false. */
  positiveWhenUp?: boolean;
};

type Props = {
  label: string;
  value: string;
  delta?: Delta | null;
  hint?: string;
  icon?: ReactNode;
};

export function KpiStatCard({ label, value, delta, hint, icon }: Props) {
  const positiveWhenUp = delta?.positiveWhenUp ?? true;
  const isPositive =
    delta?.direction === "up" ? positiveWhenUp :
    delta?.direction === "down" ? !positiveWhenUp :
    null;

  const DeltaIcon =
    delta?.direction === "up" ? ArrowUpRight :
    delta?.direction === "down" ? ArrowDownRight :
    Minus;

  return (
    <Card className="border-border/60">
      <CardContent className="pt-5 pb-4 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          {icon && <span className="text-muted-foreground shrink-0">{icon}</span>}
        </div>
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        {(delta || hint) && (
          <div className="flex items-center gap-2 text-xs">
            {delta && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 font-medium",
                  isPositive === true && "text-emerald-600 dark:text-emerald-400",
                  isPositive === false && "text-rose-600 dark:text-rose-400",
                  isPositive === null && "text-muted-foreground",
                )}
              >
                <DeltaIcon className="h-3 w-3" />
                {delta.value}
              </span>
            )}
            {hint && <span className="text-muted-foreground">{hint}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
