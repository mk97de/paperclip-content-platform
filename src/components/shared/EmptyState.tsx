import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionDisabled?: boolean;
};

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionDisabled,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-24 gap-4">
      {icon && (
        <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
          {icon}
        </div>
      )}
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      {description && (
        <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && (
        <Button
          disabled={actionDisabled}
          onClick={onAction}
          variant={actionDisabled ? "secondary" : "default"}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
