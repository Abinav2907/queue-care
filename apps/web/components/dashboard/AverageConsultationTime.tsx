"use client";

import { TimerReset } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/providers/SocketProvider";

export function AverageConsultationTime({
  value,
  loading,
  onUpdate
}: {
  value: number;
  loading: boolean;
  onUpdate: (value: number) => Promise<void>;
}) {
  const [draft, setDraft] = useState(value);
  const { notify } = useToast();

  useEffect(() => {
    setDraft(value);
  }, [value]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await onUpdate(draft);
      notify({
        title: "Consultation time updated",
        description: `Wait estimates now use ${draft} minutes per patient.`,
        tone: "success"
      });
    } catch (error) {
      notify({
        title: "Settings not saved",
        description: error instanceof Error ? error.message : "Please try again.",
        tone: "error"
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
      <label className="flex-1">
        <span className="mb-2 block text-sm font-medium text-muted-foreground">
          Average consultation time
        </span>
        <Input
          type="number"
          min={1}
          max={180}
          value={draft}
          onChange={(event) => setDraft(Number(event.target.value))}
          aria-label="Average consultation time in minutes"
        />
      </label>
      <Button type="submit" loading={loading} variant="secondary" className="self-end">
        <TimerReset className="size-4" />
        Save
      </Button>
    </form>
  );
}
