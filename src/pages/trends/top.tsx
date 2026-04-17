import { TrendingUp } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";

export const TrendsTop = () => (
  <div className="p-4 md:p-8">
    <EmptyState
      icon={<TrendingUp className="h-7 w-7" />}
      title="Top Performer"
      description="Kommt in Session 43. Ranking der Top-Hooks nach Save-Rate und Engagement — damit du siehst, welche Patterns gerade explodieren."
      actionLabel="Bald verfügbar"
      actionDisabled
    />
  </div>
);
