import { PATTERN_DEFINITIONS, PATTERN_KEYS } from "@/lib/pattern-definitions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const HilfePatterns = () => (
  <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Hook-Patterns</h1>
      <p className="text-sm text-muted-foreground mt-1">
        Die 9 emotionalen Mechaniken, nach denen wir Hooks erzeugen und bewerten.
        Jeder Pattern hat ein bevorzugtes Video-Format (A-Roll gesprochen · B-Roll visuell).
      </p>
    </div>

    <div className="grid gap-4 md:grid-cols-2">
      {PATTERN_KEYS.map((key) => {
        const def = PATTERN_DEFINITIONS[key];
        return (
          <Card key={key} className="border-border/60">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">{def.label}</CardTitle>
                <Badge variant="outline" className="text-[10px] font-normal">
                  {def.bestFormat}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground leading-relaxed">
                {def.definition}
              </p>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  Beispiel
                </p>
                <p className="italic border-l-2 pl-3 leading-relaxed">
                  {def.example}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  </div>
);
