import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Link } from "react-router";
import { PATTERN_DEFINITIONS, type PatternKey } from "@/lib/pattern-definitions";
import { useIsMobile } from "@/hooks/useMediaQuery";

type Props = {
  pattern: string | null | undefined;
  className?: string;
};

export function PatternBadge({ pattern, className }: Props) {
  const isMobile = useIsMobile();
  if (!pattern) return null;
  const def = PATTERN_DEFINITIONS[pattern as PatternKey];
  if (!def) {
    return (
      <Badge variant="outline" className={className}>
        {pattern}
      </Badge>
    );
  }

  const badge = (
    <Badge
      variant="outline"
      className={`font-normal cursor-help ${className ?? ""}`}
    >
      {def.label}
    </Badge>
  );

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <button type="button" className="inline-flex">{badge}</button>
        </SheetTrigger>
        <SheetContent side="bottom" className="max-h-[75vh] overflow-y-auto">
          <SheetHeader className="text-left">
            <SheetTitle>{def.label}</SheetTitle>
            <SheetDescription className="text-sm">
              {def.definition}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4 space-y-3 px-4 pb-6">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                Beispiel
              </p>
              <p className="text-sm italic border-l-2 pl-3">{def.examples[0]}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                Bestes Format
              </p>
              <p className="text-sm">{def.bestFormat}</p>
            </div>
            <Link
              to="/hilfe/patterns"
              className="text-sm text-[#7170ff] underline underline-offset-4 inline-block"
            >
              Alle Patterns ansehen →
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex">{badge}</span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-sm space-y-2 p-3">
          <p className="font-semibold">{def.label}</p>
          <p className="text-xs">{def.definition}</p>
          <p className="text-xs italic border-l-2 pl-2 opacity-80">
            {def.examples[0]}
          </p>
          <p className="text-[10px] uppercase tracking-wider opacity-70">
            Best: {def.bestFormat}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
