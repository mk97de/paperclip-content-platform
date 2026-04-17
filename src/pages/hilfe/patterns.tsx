import { useState } from "react";
import {
  PATTERN_DEFINITIONS,
  PATTERN_KEYS,
  FORMAT_BADGE_COLOR,
  type PatternFormat,
} from "@/lib/pattern-definitions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FORMAT_OPTIONS: (PatternFormat | "all")[] = [
  "all",
  "A-Roll",
  "B-Roll List",
  "B-Roll Progressive",
];

export const HilfePatterns = () => {
  const [formatFilter, setFormatFilter] = useState<PatternFormat | "all">("all");

  const visible = PATTERN_KEYS.filter((k) =>
    formatFilter === "all" ? true : PATTERN_DEFINITIONS[k].bestFormat === formatFilter
  );

  const formatCounts: Record<string, number> = { all: PATTERN_KEYS.length };
  for (const k of PATTERN_KEYS) {
    const f = PATTERN_DEFINITIONS[k].bestFormat;
    formatCounts[f] = (formatCounts[f] ?? 0) + 1;
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Hook-Patterns</h1>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
          Die 9 emotionalen Mechaniken, nach denen wir Hooks erzeugen und bewerten.
          Jeder Pattern hat ein bevorzugtes Video-Format (A-Roll gesprochen · B-Roll visuell).
          Die Beispiele stammen aus Alexandras eigenen viralen Hooks.
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {FORMAT_OPTIONS.map((opt) => (
          <Button
            key={opt}
            size="sm"
            variant={formatFilter === opt ? "default" : "outline"}
            className="h-8 px-3 text-xs"
            onClick={() => setFormatFilter(opt)}
          >
            {opt === "all" ? "Alle Formate" : opt} · {formatCounts[opt] ?? 0}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {visible.map((key) => {
          const def = PATTERN_DEFINITIONS[key];
          return (
            <Card key={key} className="border-border/60 h-full flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base">{def.label}</CardTitle>
                  <Badge
                    className={cn(
                      "text-[10px] font-normal border",
                      FORMAT_BADGE_COLOR[def.bestFormat]
                    )}
                  >
                    {def.bestFormat}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm flex-1">
                <p className="text-muted-foreground leading-relaxed">
                  {def.definition}
                </p>
                <div className="rounded-md bg-muted/40 border border-border/50 p-2.5">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                    Mechanik
                  </p>
                  <p className="text-xs leading-relaxed">{def.mechanic}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
                    Beispiele ({def.examples.length})
                  </p>
                  <ul className="space-y-2">
                    {def.examples.map((ex, i) => (
                      <li
                        key={i}
                        className="italic border-l-2 border-border pl-3 leading-relaxed text-[13px]"
                      >
                        {ex}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
