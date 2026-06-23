"use client";

import type { Patient } from "@queue-cure/shared";
import { Inbox } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { TokenCard } from "@/components/queue/TokenCard";

export function QueueList({ patients }: { patients: Patient[] }) {
  if (!patients.length) {
    return (
      <div className="flex min-h-56 flex-col items-center justify-center rounded-lg border border-dashed border-white/15 bg-white/[0.03] p-8 text-center">
        <Inbox className="size-8 text-muted-foreground" />
        <p className="mt-3 font-semibold">No patients waiting</p>
        <p className="mt-1 text-sm text-muted-foreground">New patients will appear here instantly.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      <AnimatePresence initial={false}>
        {patients.map((patient, index) => (
          <TokenCard key={patient.id} patient={patient} index={index} />
        ))}
      </AnimatePresence>
    </ul>
  );
}
