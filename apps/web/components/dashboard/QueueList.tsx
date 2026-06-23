"use client";

import type { Doctor, Patient, PatientStatus } from "@queue-cure/shared";
import { Inbox } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";

type QueueFilter = "all" | Extract<PatientStatus, "waiting" | "serving">;

export function QueueList({ patients, doctors }: { patients: Patient[]; doctors: Doctor[] }) {
  const [filter, setFilter] = useState<QueueFilter>("all");
  const doctorNameById = useMemo(
    () => new Map(doctors.map((doctor) => [doctor.id, doctor.name])),
    [doctors]
  );
  const activePatients = patients.filter(
    (patient) => patient.status === "waiting" || patient.status === "serving"
  );
  const filteredPatients =
    filter === "all" ? activePatients : activePatients.filter((patient) => patient.status === filter);
  const filters: { label: string; value: QueueFilter }[] = [
    { label: "All", value: "all" },
    { label: "Waiting", value: "waiting" },
    { label: "Serving", value: "serving" }
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex flex-wrap gap-1.5">
        {filters.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setFilter(item.value)}
            className={`rounded-md border px-2.5 py-1 text-xs font-medium transition ${
              filter === item.value
                ? "border-primary/40 bg-primary/15 text-primary"
                : "border-white/10 bg-white/[0.04] text-muted-foreground hover:text-foreground"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {!filteredPatients.length ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-white/15 bg-white/[0.03] p-8 text-center">
          <Inbox className="size-8 text-muted-foreground" />
          <p className="mt-3 font-semibold">No matching queue records</p>
          <p className="mt-1 text-sm text-muted-foreground">New patients will appear here instantly.</p>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-white/10">
          <div className="sticky top-0 z-10 hidden grid-cols-[0.7fr_1.6fr_1.3fr_0.8fr] bg-surface/95 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground backdrop-blur md:grid">
            <span>Token</span>
            <span>Patient</span>
            <span>Doctor</span>
            <span>Status</span>
          </div>
          <ul>
            <AnimatePresence initial={false}>
              {filteredPatients.map((patient, index) => (
                <motion.li
                  key={patient.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ delay: index * 0.015 }}
                  className="grid gap-2 border-t border-white/10 px-3 py-3 text-sm first:border-t-0 md:grid-cols-[0.7fr_1.6fr_1.3fr_0.8fr] md:items-center"
                >
                  <div>
                    <p className="text-xs text-muted-foreground md:hidden">Token</p>
                    <p className="font-black text-primary">T{patient.tokenNumber}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground md:hidden">Patient</p>
                    <p className="truncate font-semibold">{patient.patientName}</p>
                  </div>
                  <div className="min-w-0 text-muted-foreground">
                    <p className="text-xs text-muted-foreground md:hidden">Doctor</p>
                    <p className="truncate">{doctorNameById.get(patient.doctorId) ?? patient.doctorName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground md:hidden">Status</p>
                    <span className="inline-flex rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 text-xs font-semibold capitalize text-foreground">
                      {patient.status}
                    </span>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>
      )}
    </div>
  );
}
