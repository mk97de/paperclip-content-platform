import { useMemo, useState } from "react";
import { useList } from "@refinedev/core";
import { Loader2, Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ScrapedHookCard,
  type ScrapedHook,
} from "@/components/trends/ScrapedHookCard";

type Tier = "S" | "A" | "B" | "C" | "D";
type Roll = "all" | "a_roll" | "b_roll";
type Period = "7d" | "14d" | "28d" | "90d" | "all";
type SortKey = "-posted_at" | "posted_at" | "-views_count" | "-viral_score";

const PERIOD_DAYS: Record<Period, number | null> = {
  "7d": 7,
  "14d": 14,
  "28d": 28,
  "90d": 90,
  all: null,
};

const ALL_TIERS: Tier[] = ["S", "A", "B", "C", "D"];
const PAGE_SIZE = 24;

export const TrendsScraped = () => {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [roll, setRoll] = useState<Roll>("all");
  const [accounts, setAccounts] = useState<string[]>([]);
  const [period, setPeriod] = useState<Period>("all");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("-posted_at");
  const [page, setPage] = useState(1);

  // Reset to page 1 when filters change
  const filterKey = `${tiers.join(",")}|${roll}|${accounts.join(",")}|${period}|${search}|${sortKey}`;
  useMemo(() => setPage(1), [filterKey]);

  const sinceIso = useMemo(() => {
    const days = PERIOD_DAYS[period];
    if (days == null) return null;
    return new Date(Date.now() - days * 86_400_000).toISOString();
  }, [period]);

  const filters = useMemo(() => {
    const f: Array<{ field: string; operator: string; value: unknown }> = [];
    if (sinceIso) {
      f.push({ field: "posted_at", operator: "gte", value: sinceIso });
    }
    if (tiers.length > 0) {
      f.push({ field: "viral_tier", operator: "in", value: tiers });
    }
    if (roll !== "all") {
      f.push({ field: "roll_type", operator: "eq", value: roll });
    }
    if (accounts.length > 0) {
      f.push({ field: "account_username", operator: "in", value: accounts });
    }
    const term = search.trim();
    if (term.length >= 2) {
      f.push({ field: "hook_text", operator: "contains", value: term });
    }
    return f;
  }, [sinceIso, tiers, roll, accounts, search]);

  const [sortField, sortOrder] = useMemo<["posted_at" | "views_count" | "viral_score", "asc" | "desc"]>(() => {
    if (sortKey === "-views_count") return ["views_count", "desc"];
    if (sortKey === "-viral_score") return ["viral_score", "desc"];
    if (sortKey === "posted_at") return ["posted_at", "asc"];
    return ["posted_at", "desc"];
  }, [sortKey]);

  const {
    result,
    query: { isLoading },
  } = useList<ScrapedHook>({
    resource: "scraped_hooks",
    filters: filters as never,
    sorters: [{ field: sortField, order: sortOrder }],
    pagination: { currentPage: page, pageSize: PAGE_SIZE },
    meta: { noStatus: true },
  });

  const hooks = (result?.data ?? []) as unknown as ScrapedHook[];
  const total = result?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Fetch distinct accounts (separate small query)
  const { result: accountsResult } = useList<{ account_username: string }>({
    resource: "scraped_hooks",
    pagination: { pageSize: 500 },
    meta: { noStatus: true, fields: ["account_username"] },
  });
  const accountOptions = useMemo(() => {
    const set = new Set<string>();
    for (const r of (accountsResult?.data ?? []) as Array<{ account_username: string | null }>) {
      if (r.account_username) set.add(r.account_username);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [accountsResult?.data]);

  const toggleTier = (t: Tier) => {
    setTiers((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };
  const toggleAccount = (a: string) => {
    setAccounts((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  };

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Scraped Hooks</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {total} Hooks insgesamt · Seite {page}/{totalPages}
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Hook-Text suchen..."
            className="pl-8 h-9 text-sm"
          />
        </div>

        {/* Tier multi */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              Tier {tiers.length > 0 && `(${tiers.length})`}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-44 p-2">
            <div className="space-y-1">
              {ALL_TIERS.map((t) => (
                <label
                  key={t}
                  className="flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-muted cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={tiers.includes(t)}
                    onChange={() => toggleTier(t)}
                  />
                  <span className="font-medium">{t}</span>
                </label>
              ))}
              {tiers.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTiers([])}
                  className="w-full justify-start h-7 text-xs"
                >
                  <X className="h-3 w-3 mr-1" /> Zurücksetzen
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Roll-Type */}
        <Select value={roll} onValueChange={(v) => setRoll(v as Roll)}>
          <SelectTrigger className="h-9 w-[120px] text-sm">
            <SelectValue placeholder="Roll" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Rolls</SelectItem>
            <SelectItem value="a_roll">A-Roll</SelectItem>
            <SelectItem value="b_roll">B-Roll</SelectItem>
          </SelectContent>
        </Select>

        {/* Creator multi */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              Creator {accounts.length > 0 && `(${accounts.length})`}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-0">
            <Command>
              <CommandInput placeholder="Creator suchen..." className="h-9" />
              <CommandList>
                <CommandEmpty>Kein Creator gefunden.</CommandEmpty>
                <CommandGroup>
                  {accountOptions.map((a) => (
                    <CommandItem
                      key={a}
                      value={a}
                      onSelect={() => toggleAccount(a)}
                    >
                      <input
                        type="checkbox"
                        checked={accounts.includes(a)}
                        onChange={() => toggleAccount(a)}
                        className="mr-2"
                      />
                      @{a}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
            {accounts.length > 0 && (
              <div className="p-1 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAccounts([])}
                  className="w-full justify-start h-7 text-xs"
                >
                  <X className="h-3 w-3 mr-1" /> Alle abwählen
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>

        {/* Period */}
        <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <SelectTrigger className="h-9 w-[110px] text-sm">
            <SelectValue placeholder="Zeitraum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 Tage</SelectItem>
            <SelectItem value="14d">14 Tage</SelectItem>
            <SelectItem value="28d">28 Tage</SelectItem>
            <SelectItem value="90d">90 Tage</SelectItem>
            <SelectItem value="all">Alle</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
          <SelectTrigger className="h-9 w-[150px] text-sm">
            <SelectValue placeholder="Sortierung" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="-posted_at">Neueste zuerst</SelectItem>
            <SelectItem value="posted_at">Älteste zuerst</SelectItem>
            <SelectItem value="-views_count">Meiste Views</SelectItem>
            <SelectItem value="-viral_score">Höchster Score</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Active filter chips */}
      {(tiers.length > 0 || accounts.length > 0 || roll !== "all") && (
        <div className="flex flex-wrap gap-1.5">
          {tiers.map((t) => (
            <Badge
              key={t}
              variant="secondary"
              className="cursor-pointer"
              onClick={() => toggleTier(t)}
            >
              Tier {t} <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
          {roll !== "all" && (
            <Badge
              variant="secondary"
              className="cursor-pointer"
              onClick={() => setRoll("all")}
            >
              {roll === "a_roll" ? "A-Roll" : "B-Roll"} <X className="h-3 w-3 ml-1" />
            </Badge>
          )}
          {accounts.map((a) => (
            <Badge
              key={a}
              variant="secondary"
              className="cursor-pointer"
              onClick={() => toggleAccount(a)}
            >
              @{a} <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : hooks.length === 0 ? (
        <EmptyState
          icon={<Search className="h-6 w-6" />}
          title="Keine Hooks gefunden"
          description="Passe Filter oder Suche an."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {hooks.map((h) => (
              <ScrapedHookCard key={h.id} hook={h} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Zurück
              </Button>
              <span className="text-sm text-muted-foreground">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Weiter
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
