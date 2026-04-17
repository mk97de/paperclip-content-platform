import { ContentCalendar } from "@/components/calendar/ContentCalendar";

export const CalendarList = () => (
  <div className="p-4 md:p-8 max-w-[1800px] mx-auto">
    <div className="mb-6">
      <h1 className="text-2xl font-semibold tracking-tight">Kalender</h1>
      <p className="text-sm text-muted-foreground mt-1">
        content_posts nach Posting-Slot und Veröffentlichungsdatum · Farbe = Kategorie
      </p>
    </div>
    <ContentCalendar />
  </div>
);
