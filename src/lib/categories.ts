export const CATEGORY_LABEL: Record<string, string> = {
  hormone: "Hormone",
  schilddruese: "Schilddrüse",
  stoffwechsel: "Stoffwechsel",
  regeneration: "Regeneration",
  mindset: "Mindset",
  bewegung: "Bewegung",
};

export const CATEGORY_COLOR: Record<string, string> = {
  hormone:
    "bg-rose-100 text-rose-900 dark:bg-rose-900/40 dark:text-rose-200 border-rose-200/60 dark:border-rose-800/60",
  schilddruese:
    "bg-sky-100 text-sky-900 dark:bg-sky-900/40 dark:text-sky-200 border-sky-200/60 dark:border-sky-800/60",
  stoffwechsel:
    "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200 border-amber-200/60 dark:border-amber-800/60",
  regeneration:
    "bg-indigo-100 text-indigo-900 dark:bg-indigo-900/40 dark:text-indigo-200 border-indigo-200/60 dark:border-indigo-800/60",
  mindset:
    "bg-violet-100 text-violet-900 dark:bg-violet-900/40 dark:text-violet-200 border-violet-200/60 dark:border-violet-800/60",
  bewegung:
    "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200 border-emerald-200/60 dark:border-emerald-800/60",
};

export const CATEGORY_EVENT_HEX: Record<string, string> = {
  hormone: "#f43f5e",
  schilddruese: "#0ea5e9",
  stoffwechsel: "#f59e0b",
  regeneration: "#6366f1",
  mindset: "#8b5cf6",
  bewegung: "#10b981",
};

export const CATEGORY_KEYS = Object.keys(CATEGORY_LABEL);
