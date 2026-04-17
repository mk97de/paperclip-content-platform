import { Brain } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";

export const InsightsLearnings = () => (
  <div className="p-4 md:p-8">
    <EmptyState
      icon={<Brain className="h-7 w-7" />}
      title="Agent Learnings"
      description="Kommt in Session 42. Feedback-Loop der Agenten: Was lernen HookSmith und CaptionSmith aus deinen Likes, Dismisses und Kommentaren?"
      actionLabel="Bald verfügbar"
      actionDisabled
    />
  </div>
);
