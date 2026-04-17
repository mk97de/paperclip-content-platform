import { BarChart3 } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";

export const InsightsPerformance = () => (
  <div className="p-4 md:p-8">
    <EmptyState
      icon={<BarChart3 className="h-7 w-7" />}
      title="Performance-Analytics"
      description="Kommt in Session 41. Zeigt Hook-Pattern-Performance, Engagement-Rate pro Kategorie, Posting-Zeit-Effekt und Viral-Tier-Korrelation."
      actionLabel="Bald verfügbar"
      actionDisabled
    />
  </div>
);
