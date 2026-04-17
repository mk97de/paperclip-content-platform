import { useMemo, useState } from "react";
import { useList } from "@refinedev/core";
import { Calendar, dateFnsLocalizer, Views, type View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { de } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_EVENT_HEX, CATEGORY_LABEL } from "@/lib/categories";
import { useIsMobile } from "@/hooks/useMediaQuery";

import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = { de };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 1 }),
  getDay,
  locales,
});

type ContentPost = {
  id: number;
  hook_text: string | null;
  category: string | null;
  status: string | null;
  caption_type: string | null;
  eval_score: number | null;
  published_date: string | null;
  posting_slot: string | null;
};

type CalEvent = {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource: ContentPost;
};

export function ContentCalendar() {
  const isMobile = useIsMobile();
  const [selected, setSelected] = useState<ContentPost | null>(null);
  const [view, setView] = useState<View>(isMobile ? Views.AGENDA : Views.MONTH);

  const {
    result,
    query: { isLoading, isError },
  } = useList<ContentPost>({
    resource: "content_posts",
    pagination: { pageSize: 500 },
  });

  const posts = result?.data ?? [];

  const events: CalEvent[] = useMemo(() => {
    return posts
      .map((p): CalEvent | null => {
        const raw = p.published_date ?? p.posting_slot;
        if (!raw) return null;
        const d = new Date(raw);
        if (Number.isNaN(d.getTime())) return null;
        return {
          id: p.id,
          title: p.hook_text ?? "(ohne Hook)",
          start: d,
          end: d,
          resource: p,
        };
      })
      .filter((x): x is CalEvent => x !== null);
  }, [posts]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-destructive">
        Fehler beim Laden der content_posts.
      </div>
    );
  }

  return (
    <div className="content-calendar h-[75vh]">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        view={view}
        onView={setView}
        views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
        culture="de"
        messages={{
          today: "Heute",
          previous: "Zurück",
          next: "Weiter",
          month: "Monat",
          week: "Woche",
          day: "Tag",
          agenda: "Agenda",
          date: "Datum",
          time: "Zeit",
          event: "Post",
          noEventsInRange: "Keine Posts in diesem Zeitraum.",
        }}
        eventPropGetter={(event) => {
          const cat = (event as CalEvent).resource.category;
          const bg = cat ? CATEGORY_EVENT_HEX[cat] ?? "#6366f1" : "#6366f1";
          return {
            style: {
              backgroundColor: bg,
              borderRadius: 4,
              border: "none",
              color: "#fff",
              fontSize: "0.75rem",
              padding: "2px 6px",
            },
          };
        }}
        onSelectEvent={(e) => setSelected((e as CalEvent).resource)}
      />

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-left leading-snug">
              {selected?.hook_text ?? "Post"}
            </DialogTitle>
            <DialogDescription className="text-left">
              {selected?.category && (CATEGORY_LABEL[selected.category] ?? selected.category)}
              {selected?.status ? ` · ${selected.status}` : ""}
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-2 text-sm">
              <div className="flex flex-wrap gap-1.5">
                {selected.caption_type && (
                  <Badge variant="outline">{selected.caption_type}</Badge>
                )}
                {typeof selected.eval_score === "number" && (
                  <Badge variant="outline">Score {selected.eval_score.toFixed(1)}</Badge>
                )}
              </div>
              {selected.posting_slot && (
                <p className="text-xs text-muted-foreground">
                  Geplant: {new Date(selected.posting_slot).toLocaleString("de-DE")}
                </p>
              )}
              {selected.published_date && (
                <p className="text-xs text-muted-foreground">
                  Veröffentlicht: {new Date(selected.published_date).toLocaleString("de-DE")}
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
