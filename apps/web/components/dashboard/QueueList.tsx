"use client";

import type { Doctor, Patient, PatientStatus } from "@queue-cure/shared";
import { Inbox } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";

type QueueFilter = "all" | PatientStatus | "missed";

const statusStyles: Record<string, string> = {
  waiting: "border-primary/30 bg-primary/10 text-primary",
  serving: "border-accent/30 bg-accent/10 text-accent",
  completed: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  missed: "border-destructive/30 bg-destructive/10 text-destructive"
};

export function QueueList({ patients, doctors }: { patients: Patient[]; doctors: Doctor[] }) {
  const [filter, setFilter] = useState<QueueFilter>("all");
  const [doctorFilter, setDoctorFilter] = useState<string>("all");
  const patientsByDoctor = useMemo(() => {
    const sortedPatients = [...patients].sort((a, b) => a.tokenNumber - b.tokenNumber);
    const knownGroups = doctors.map((doctor) => ({
      doctorId: doctor.id,
      doctorName: doctor.name,
      patients: sortedPatients.filter((patient) => patient.doctorId === doctor.id)
    }));
    const unassignedPatients = sortedPatients.filter(
      (patient) => !doctors.some((doctor) => doctor.id === patient.doctorId)
    );

    if (!unassignedPatients.length) return knownGroups;

    return [
      ...knownGroups,
      {
        doctorId: "unassigned",
        doctorName: "Unassigned",
        patients: unassignedPatients
      }
    ];
  }, [doctors, patients]);
  const filteredGroups = patientsByDoctor
    .filter((group) => doctorFilter === "all" || group.doctorId === doctorFilter)
    .map((group) => ({
      ...group,
      patients:
        filter === "all"
          ? group.patients
          : group.patients.filter((patient) => patient.status === filter)
    }))
    .filter((group) => group.patients.length > 0);
  const filters: { label: string; value: QueueFilter }[] = [
    { label: "All", value: "all" },
    { label: "Waiting", value: "waiting" },
    { label: "Serving", value: "serving" },
    { label: "Completed", value: "completed" },
    { label: "Missed", value: "missed" }
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
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setDoctorFilter("all")}
          className={`rounded-md border px-2.5 py-1 text-xs font-medium transition ${
            doctorFilter === "all"
              ? "border-accent/40 bg-accent/15 text-accent"
              : "border-white/10 bg-white/[0.04] text-muted-foreground hover:text-foreground"
          }`}
        >
          All Doctors
        </button>
        {doctors.map((doctor) => (
          <button
            key={doctor.id}
            type="button"
            onClick={() => setDoctorFilter(doctor.id)}
            className={`rounded-md border px-2.5 py-1 text-xs font-medium transition ${
              doctorFilter === doctor.id
                ? "border-accent/40 bg-accent/15 text-accent"
                : "border-white/10 bg-white/[0.04] text-muted-foreground hover:text-foreground"
            }`}
          >
            {doctor.name}
          </button>
        ))}
      </div>

      {!filteredGroups.length ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-white/15 bg-white/[0.03] p-8 text-center">
          <Inbox className="size-8 text-muted-foreground" />
          <p className="mt-3 font-semibold">No matching queue records</p>
          <p className="mt-1 text-sm text-muted-foreground">New patients will appear here instantly.</p>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-white/10">
          <div className="sticky top-0 z-20 grid grid-cols-[0.8fr_1.6fr_0.9fr] bg-surface/95 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground backdrop-blur sm:grid-cols-[0.8fr_1.8fr_1fr]">
            <span>Token</span>
            <span>Patient</span>
            <span>Status</span>
          </div>
          <div className="divide-y divide-white/10">
            {filteredGroups.map((group) => (
              <section key={group.doctorId}>
                <div className="sticky top-8 z-10 border-t border-white/10 bg-background/95 px-3 py-3 backdrop-blur">
                  <h3 className="text-xl font-bold text-foreground">{group.doctorName}</h3>
                </div>
                <ul>
                  <AnimatePresence initial={false}>
                    {group.patients.map((patient, index) => (
                      <motion.li
                        key={patient.id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ delay: index * 0.015 }}
                        className="grid grid-cols-[0.8fr_1.6fr_0.9fr] items-center gap-3 border-t border-white/10 px-3 py-3 sm:grid-cols-[0.8fr_1.8fr_1fr]"
                      >
                        <p className="text-xl font-bold text-primary">T{patient.tokenNumber}</p>
                        <p className="min-w-0 truncate text-lg font-semibold">{patient.patientName}</p>
                        <span
                          className={`w-fit rounded-full border px-2.5 py-1 text-base font-semibold capitalize ${
                            statusStyles[patient.status] ?? "border-white/10 bg-white/[0.05] text-foreground"
                          }`}
                        >
                          {patient.status}
                        </span>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
