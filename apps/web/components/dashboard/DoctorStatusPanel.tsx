"use client";

import type { Doctor, DoctorAvailability, Patient } from "@queue-cure/shared";
import { Stethoscope, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function DoctorStatusPanel({
  doctors,
  pausedDoctorIds,
  patients,
  avgConsultationTime,
  onCallNext,
  onCompleteConsultation,
  onAvailability
}: {
  doctors: Doctor[];
  pausedDoctorIds: string[];
  patients: Patient[];
  avgConsultationTime: number;
  onCallNext: (doctorId: string) => Promise<unknown>;
  onCompleteConsultation: (doctorId: string) => Promise<unknown>;
  onAvailability: (doctorId: string, availability: DoctorAvailability) => Promise<unknown>;
}) {
  const availabilityStyles: Record<DoctorAvailability, string> = {
    available: "border-primary/30 bg-primary/10 text-primary",
    busy: "border-accent/30 bg-accent/10 text-accent",
    offline: "border-white/10 bg-white/5 text-muted-foreground",
    paused: "border-destructive/30 bg-destructive/10 text-destructive"
  };

  return (
    <Card className="h-full p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <Stethoscope className="size-5 text-primary" />
        <h2 className="text-lg font-semibold">Doctors</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {doctors.map((doctor) => {
          const paused = pausedDoctorIds.includes(doctor.id);
          const currentPatient = patients.find(
            (patient) => patient.doctorId === doctor.id && patient.status === "serving"
          );
          const waitingPatients = patients
            .filter((patient) => patient.doctorId === doctor.id && patient.status === "waiting")
            .sort((a, b) => a.tokenNumber - b.tokenNumber);
          const nextPatient = waitingPatients[0];
          const queueLength = waitingPatients.length;
          const unavailable = paused || doctor.availability !== "available";

          return (
            <div
              key={doctor.id}
              className="flex min-h-48 flex-col rounded-lg border border-white/10 bg-white/[0.04] p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{doctor.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {doctor.specialty} - Room {doctor.room}
                  </p>
                </div>
                <span
                  className={`rounded-full border px-2 py-1 text-[11px] font-semibold capitalize ${availabilityStyles[doctor.availability]}`}
                >
                  {doctor.availability}
                </span>
              </div>

              <div className="mt-3 grid gap-2 text-sm">
                <div className="rounded-md bg-white/[0.04] p-2.5">
                  <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Current</p>
                  <p className="mt-1 truncate font-semibold">
                    {currentPatient
                      ? `T${currentPatient.tokenNumber} - ${currentPatient.patientName}`
                      : "None"}
                  </p>
                </div>
                <div className="rounded-md bg-white/[0.04] p-2.5">
                  <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Next</p>
                  <p className="mt-1 truncate font-semibold">
                    {nextPatient ? `T${nextPatient.tokenNumber} - ${nextPatient.patientName}` : "None"}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-md bg-white/[0.04] p-2.5">
                    <p className="text-xs text-muted-foreground">Queue</p>
                    <p className="mt-1 flex items-center gap-1 text-xl font-semibold">
                      <UsersRound className="size-4 text-primary" />
                      {queueLength}
                    </p>
                  </div>
                  <div className="rounded-md bg-white/[0.04] p-2.5">
                    <p className="text-xs text-muted-foreground">Avg time</p>
                    <p className="mt-1 text-xl font-semibold">{avgConsultationTime}m</p>
                  </div>
                </div>
                <select
                  value={doctor.availability}
                  onChange={(event) =>
                    onAvailability(doctor.id, event.target.value as DoctorAvailability)
                  }
                  className="h-10 rounded-md border border-white/10 bg-background px-3 text-xs"
                >
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="offline">Offline</option>
                  <option value="paused">Paused</option>
                </select>
              </div>

              <div className="mt-auto grid grid-cols-2 gap-2 pt-3">
                <Button
                  type="button"
                  disabled={Boolean(currentPatient) || !queueLength || unavailable}
                  onClick={() => onCallNext(doctor.id)}
                >
                  Call Next
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={!currentPatient}
                  onClick={() => onCompleteConsultation(doctor.id)}
                >
                  Complete Consultation
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
