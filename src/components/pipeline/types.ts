export type PipelineStatus =
  | "draft"
  | "ready"
  | "on_hold"
  | "approved"
  | "published"
  | "archived";

export type ContentPost = {
  id: number;
  hook_text: string | null;
  category: string | null;
  caption_type: string | null;
  eval_score: number | null;
  published_date: string | null;
  posting_slot: string | null;
  human_feedback: string | null;
  status: PipelineStatus;
};

export const PIPELINE_COLUMNS: {
  status: PipelineStatus;
  label: string;
}[] = [
  { status: "draft", label: "Entwurf" },
  { status: "ready", label: "Bereit" },
  { status: "on_hold", label: "Wartet" },
  { status: "approved", label: "Freigegeben" },
  { status: "published", label: "Veröffentlicht" },
  { status: "archived", label: "Archiviert" },
];

export const PIPELINE_STATUS_SET: ReadonlySet<string> = new Set<PipelineStatus>([
  "draft",
  "ready",
  "on_hold",
  "approved",
  "published",
  "archived",
]);

export function isPipelineStatus(x: unknown): x is PipelineStatus {
  return typeof x === "string" && PIPELINE_STATUS_SET.has(x);
}
