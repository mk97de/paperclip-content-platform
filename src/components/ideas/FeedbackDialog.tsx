import { useState, useEffect } from "react";
import { useUpdate } from "@refinedev/core";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  idea: { id: number; adapted_hook_text: string; martin_feedback: string | null } | null;
};

export function FeedbackDialog({ open, onOpenChange, idea }: Props) {
  const [text, setText] = useState("");
  const queryClient = useQueryClient();
  const {
    mutate: updateIdea,
    mutation: { isPending },
  } = useUpdate();

  useEffect(() => {
    if (idea) setText(idea.martin_feedback ?? "");
  }, [idea]);

  const submit = () => {
    if (!idea) return;
    updateIdea(
      {
        resource: "hook_ideas",
        id: idea.id,
        values: { martin_feedback: text.trim() || null },
        successNotification: false,
      },
      {
        onSuccess: () => {
          toast.success("Feedback gespeichert");
          queryClient.invalidateQueries({ queryKey: ["hook_ideas_grid"] });
          onOpenChange(false);
        },
        onError: (e) => toast.error(`Fehler: ${e.message}`),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Feedback zu dieser Idee</DialogTitle>
          <DialogDescription>
            Optional — kurze Notiz, warum die Idee passt (oder nicht). Hilft Claude beim Lernen.
          </DialogDescription>
        </DialogHeader>
        {idea && (
          <p className="text-sm text-muted-foreground border-l-2 pl-3 italic">
            {idea.adapted_hook_text}
          </p>
        )}
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="z.B. bitte mit Fokus auf Hashimoto"
          rows={4}
        />
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Abbrechen
          </Button>
          <Button onClick={submit} disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Speichern"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
