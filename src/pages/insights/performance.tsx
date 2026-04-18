import { BarChart3 } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";

export const InsightsPerformance = () => (
  <div className="p-4 md:p-8">
    <EmptyState
      icon={<BarChart3 className="h-7 w-7" />}
      title="Performance-Analytics"
      description="In Arbeit. Zeigt Hook-Pattern-Performance, Engagement-Rate pro Kategorie, Posting-Zeit-Effekt und Viral-Tier-Korrelation — sobald genug Posts veröffentlicht sind."
      actionLabel="Bald verfügbar"
      actionDisabled
    />
  </div>
);
