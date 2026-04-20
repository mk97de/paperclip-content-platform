import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, ExternalLink } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CategoryBadge } from "@/components/ideas/CategoryBadge";
import { cn } from "@/lib/utils";

export type TableReel = {
  id: string;
  ig_shortcode: string | null;
  ig_permalink: string | null;
  ig_posted_at: string | null;
  ig_caption_preview: string | null;
  thumbnail_url: string | null;
  category: string | null;
  viral_tier: string | null;
  views: number | null;
  reach: number | null;
  engagement_rate: number | null;
  save_rate: number | null;
  reels_skip_rate: number | null;
  ig_reels_avg_watch_time_ms: number | null;
  follower_delta_24h: number | null;
};

type SortKey =
  | "ig_posted_at"
  | "views"
  | "reach"
  | "follower_delta_24h"
  | "engagement_rate"
  | "save_rate"
  | "reels_skip_rate"
  | "ig_reels_avg_watch_time_ms";

type SortDir = "asc" | "desc";

type Column = {
  key: SortKey;
  label: string;
  format: (v: number | string | null) => string;
  className?: string;
};

const COLUMNS: Column[] = [
  { key: "ig_posted_at", label: "Datum", format: (v) => fmtDate(v as string | null), className: "hidden md:table-cell" },
  { key: "views", label: "Views", format: (v) => fmtNum(v as number | null) },
  { key: "follower_delta_24h", label: "Follower +", format: (v) => fmtFollower(v as number | null) },
  { key: "reach", label: "Reach", format: (v) => fmtNum(v as number | null), className: "hidden md:table-cell" },
  { key: "engagement_rate", label: "Eng %", format: (v) => fmtPct(v as number | null, 100) },
  { key: "save_rate", label: "Save %", format: (v) => fmtPct(v as number | null, 100), className: "hidden md:table-cell" },
  { key: "reels_skip_rate", label: "Skip %", format: (v) => fmtPct(v as number | null, 1), className: "hidden lg:table-cell" },
  { key: "ig_reels_avg_watch_time_ms", label: "Watch", format: (v) => fmtWatch(v as number | null), className: "hidden lg:table-cell" },
];

function fmtNum(v: number | null): string {
  if (v == null) return "—";
  if (v >= 1000) return (v / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(v);
}

function fmtFollower(v: number | null): string {
  if (v == null) return "—";
  return `+${v}`;
}

function fmtPct(v: number | null, multiplier: number): string {
  if (v == null) return "—";
  return `${(v * multiplier).toFixed(1)}%`;
}

function fmtWatch(v: number | null): string {
  if (v == null) return "—";
  return `${(v / 1000).toFixed(1)}s`;
}

function fmtDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
}

export function ReelsDataTable({
  reels,
  onRowClick,
}: {
  reels: TableReel[];
  onRowClick?: (reel: TableReel) => void;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("ig_posted_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sorted = useMemo(() => {
    const copy = [...reels];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (sortKey === "ig_posted_at") {
        const at = av ? new Date(av as string).getTime() : 0;
        const bt = bv ? new Date(bv as string).getTime() : 0;
        return sortDir === "desc" ? bt - at : at - bt;
      }
      const an = (av ?? -Infinity) as number;
      const bn = (bv ?? -Infinity) as number;
      return sortDir === "desc" ? bn - an : an - bn;
    });
    return copy;
  }, [reels, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="h-3 w-3 opacity-40" />;
    return sortDir === "desc" ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />;
  };

  return (
    <div className="rounded-md border border-border/60 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-[60px] hidden sm:table-cell"></TableHead>
              <TableHead>Hook / Caption</TableHead>
              <TableHead className="hidden lg:table-cell">Kategorie</TableHead>
              <TableHead className="w-[50px]">Tier</TableHead>
              {COLUMNS.map((c) => (
                <TableHead
                  key={c.key}
                  className={cn(
                    "text-right cursor-pointer select-none whitespace-nowrap",
                    c.className,
                  )}
                  onClick={() => toggleSort(c.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {c.label}
                    <SortIcon col={c.key} />
                  </span>
                </TableHead>
              ))}
              <TableHead className="w-[40px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={COLUMNS.length + 5}
                  className="text-center text-xs text-muted-foreground py-6"
                >
                  Keine Reels.
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((r) => (
                <TableRow
                  key={r.id}
                  className={cn(
                    "text-xs",
                    onRowClick && "cursor-pointer hover:bg-muted/40",
                  )}
                  onClick={onRowClick ? () => onRowClick(r) : undefined}
                >
                  <TableCell className="hidden sm:table-cell">
                    {r.thumbnail_url && (
                      <img
                        src={r.thumbnail_url}
                        alt=""
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="h-10 w-7 rounded object-cover"
                      />
                    )}
                  </TableCell>
                  <TableCell className="max-w-[280px]">
                    <p className="line-clamp-2 leading-snug">
                      {r.ig_caption_preview ?? "(kein Caption)"}
                    </p>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <CategoryBadge category={r.category} className="text-[9px] py-0 px-1.5" />
                  </TableCell>
                  <TableCell>
                    {r.viral_tier && (
                      <Badge
                        variant="outline"
                        className={cn("text-[9px] font-bold px-1.5 py-0")}
                      >
                        {r.viral_tier}
                      </Badge>
                    )}
                  </TableCell>
                  {COLUMNS.map((c) => {
                    const value = r[c.key];
                    const emphasize = c.key === "follower_delta_24h" && value != null;
                    return (
                      <TableCell
                        key={c.key}
                        className={cn(
                          "text-right tabular-nums whitespace-nowrap",
                          c.className,
                          emphasize && "text-primary font-medium",
                        )}
                      >
                        {c.format(value)}
                      </TableCell>
                    );
                  })}
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    {r.ig_permalink && (
                      <a
                        href={r.ig_permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
