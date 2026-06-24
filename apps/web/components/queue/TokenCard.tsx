"use client";

import type { Patient } from "@queue-cure/shared";
import { Clock, UserRound } from "lucide-react";
import { motion } from "framer-motion";
import { TokenQRCode } from "./TokenQRCode";

export function TokenCard({ patient, index }: { patient: Patient; index: number }) {
  const statusStyles = {
    waiting: "border-accent/30 bg-accent/10 text-accent",
    serving: "border-primary/30 bg-primary/10 text-primary",
    completed: "border-white/10 bg-white/5 text-muted-foreground",
    missed: "border-destructive/30 bg-destructive/10 text-destructive"
  };

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      transition={{ delay: index * 0.025 }}
      className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/[0.045] p-4"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-primary/12 text-lg font-bold text-primary">
          {patient.tokenNumber}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-foreground">{patient.patientName}</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="size-3" />
            {new Date(patient.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit"
            })}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[patient.status]}`}
        >
          <UserRound className="size-3" />
          {patient.priority} · {patient.status}
        </span>
        <TokenQRCode patient={patient} />
      </div>
    </motion.li>
  );
}
