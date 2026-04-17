import { LineChart } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";

export const InsightsReport = () => (
  <div className="p-4 md:p-8">
    <EmptyState
      icon={<LineChart className="h-7 w-7" />}
      title="Weekly Report"
      description="Kommt in Session 41. Wöchentliche Aggregation nach Hook-Pattern, Kategorie, Formel und Posting-Zeit — als Telegram-Digest und hier im Browser."
      actionLabel="Bald verfügbar"
      actionDisabled
    />
  </div>
);
