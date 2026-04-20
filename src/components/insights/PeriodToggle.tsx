import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export type Period = "7d" | "30d" | "90d" | "ytd";

const OPTIONS: { value: Period; label: string }[] = [
  { value: "7d", label: "7 Tage" },
  { value: "30d", label: "30 Tage" },
  { value: "90d", label: "90 Tage" },
  { value: "ytd", label: "YTD" },
];

export function periodToDateRange(period: Period): { start: Date; end: Date; prevStart: Date; prevEnd: Date } {
  const end = new Date();
  const start = new Date();
  if (period === "7d") start.setDate(end.getDate() - 7);
  else if (period === "30d") start.setDate(end.getDate() - 30);
  else if (period === "90d") start.setDate(end.getDate() - 90);
  else start.setMonth(0, 1);
  start.setHours(0, 0, 0, 0);

  const spanMs = end.getTime() - start.getTime();
  const prevEnd = new Date(start.getTime());
  const prevStart = new Date(start.getTime() - spanMs);
  return { start, end, prevStart, prevEnd };
}

export function PeriodToggle({
  value,
  onChange,
}: {
  value: Period;
  onChange: (v: Period) => void;
}) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => v && onChange(v as Period)}
      variant="outline"
      size="sm"
      className="inline-flex"
    >
      {OPTIONS.map((o) => (
        <ToggleGroupItem key={o.value} value={o.value} className="text-xs px-3">
          {o.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
