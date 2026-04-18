import { Search } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";

export const TrendsScraped = () => (
  <div className="p-4 md:p-8">
    <EmptyState
      icon={<Search className="h-7 w-7" />}
      title="Scraped Hooks"
      description="In Arbeit. Gallery aller gescrapten Original-Hooks aus dem Competitor-Scraper mit Filter nach Viral-Tier, Kategorie und Roll-Type."
      actionLabel="Bald verfügbar"
      actionDisabled
    />
  </div>
);
