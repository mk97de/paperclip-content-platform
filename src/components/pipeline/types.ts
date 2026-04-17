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
  { status: "draft", label: "Draft" },
  { status: "ready", label: "Ready" },
  { status: "on_hold", label: "On Hold" },
  { status: "approved", label: "Approved" },
  { status: "published", label: "Published" },
  { status: "archived", label: "Archived" },
];
