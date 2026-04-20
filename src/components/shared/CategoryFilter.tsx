import { Check, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CATEGORY_KEYS, CATEGORY_LABEL } from "@/lib/categories";
import { cn } from "@/lib/utils";

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
};

export function CategoryFilter({ value, onChange }: Props) {
  const toggle = (key: string) => {
    onChange(value.includes(key) ? value.filter((k) => k !== key) : [...value, key]);
  };
  const label =
    value.length === 0 ? "Alle Kategorien"
    : value.length === 1 ? CATEGORY_LABEL[value[0]] ?? value[0]
    : `${value.length} Kategorien`;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span className="text-xs">{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-1">
        <div className="space-y-0.5">
          {CATEGORY_KEYS.map((key) => {
            const active = value.includes(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggle(key)}
                className={cn(
                  "flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-xs hover:bg-accent",
                  active && "bg-accent/60",
                )}
              >
                <span>{CATEGORY_LABEL[key] ?? key}</span>
                {active && <Check className="h-3.5 w-3.5" />}
              </button>
            );
          })}
          {value.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="flex w-full items-center rounded-sm px-2 py-1.5 text-[11px] text-muted-foreground hover:bg-accent"
            >
              Zurücksetzen
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
