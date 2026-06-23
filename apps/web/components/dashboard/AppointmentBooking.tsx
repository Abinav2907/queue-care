"use client";

import type { Doctor, Patient, PriorityLevel } from "@queue-cure/shared";
import { CalendarPlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { bookAppointment } from "@/lib/api";
import { useToast } from "@/providers/SocketProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

const priorityStyles = {
  normal: "border-white/10 bg-white/[0.05] text-muted-foreground",
  urgent: "border-accent/30 bg-accent/10 text-accent",
  emergency: "border-destructive/30 bg-destructive/10 text-destructive"
} as const;

type AppointmentPriority = Extract<PriorityLevel, "normal" | "urgent" | "emergency">;

export function AppointmentBooking({
  doctors,
  appointmentPatients,
  onBooked
}: {
  doctors: Doctor[];
  appointmentPatients: Patient[];
  onBooked: () => Promise<unknown>;
}) {
  const [patientName, setPatientName] = useState("");
  const [doctorId, setDoctorId] = useState(doctors[0]?.id ?? "");
  const [scheduledAt, setScheduledAt] = useState("");
  const [priority, setPriority] = useState<AppointmentPriority>("normal");
  const [loading, setLoading] = useState(false);
  const { notify } = useToast();
  const availableDoctors = useMemo(
    () => doctors.filter((doctor) => doctor.availability !== "offline"),
    [doctors]
  );
  const doctorNameById = useMemo(
    () => new Map(doctors.map((doctor) => [doctor.id, doctor.name])),
    [doctors]
  );

  useEffect(() => {
    if (!availableDoctors.some((doctor) => doctor.id === doctorId)) {
      setDoctorId(availableDoctors[0]?.id ?? "");
    }
  }, [availableDoctors, doctorId]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      await bookAppointment({
        patientName,
        doctorId,
        scheduledAt: new Date(scheduledAt).toISOString(),
        priority
      });
      await onBooked();
      setPatientName("");
      setScheduledAt("");
      notify({ title: "Appointment booked", description: "Appointment Queue updated.", tone: "success" });
    } catch (error) {
      notify({
        title: "Appointment failed",
        description: error instanceof Error ? error.message : "Try again.",
        tone: "error"
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="flex h-full min-h-0 flex-col p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <CalendarPlus className="size-5 text-accent" />
        <h2 className="text-lg font-semibold">Appointment Queue</h2>
      </div>
      <form onSubmit={submit} className="grid gap-2">
        <Input
          value={patientName}
          onChange={(event) => setPatientName(event.target.value)}
          placeholder="Patient name"
          required
        />
        <select
          value={doctorId}
          onChange={(event) => setDoctorId(event.target.value)}
          className="h-11 w-full rounded-md border border-white/10 bg-background px-3 text-sm"
          required
        >
          {availableDoctors.length ? (
            availableDoctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name}
              </option>
            ))
          ) : (
            <option value="" disabled>
              No doctors available
            </option>
          )}
        </select>
        <Input
          type="datetime-local"
          value={scheduledAt}
          onChange={(event) => setScheduledAt(event.target.value)}
          required
        />
        <select
          value={priority}
          onChange={(event) => setPriority(event.target.value as AppointmentPriority)}
          className="h-11 w-full rounded-md border border-white/10 bg-background px-3 text-sm"
        >
          <option value="normal">Normal</option>
          <option value="urgent">Urgent</option>
          <option value="emergency">Emergency</option>
        </select>
        <Button type="submit" loading={loading} disabled={!doctorId} className="w-full xl:w-auto">
          Book
        </Button>
      </form>

      <div className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-white/10">
        <div className="hidden grid-cols-[1.1fr_1fr_0.7fr_0.8fr_0.8fr] bg-white/[0.06] px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground md:grid">
          <span>Patient</span>
          <span>Doctor</span>
          <span>Time</span>
          <span>Priority</span>
          <span>Status</span>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {appointmentPatients.length ? (
            appointmentPatients.map((patient) => {
              const displayPriority: AppointmentPriority =
                patient.priority === "urgent" || patient.priority === "emergency"
                  ? patient.priority
                  : "normal";

              return (
                <div
                  key={patient.id}
                  className="grid gap-2 border-t border-white/10 px-3 py-2.5 text-sm md:grid-cols-[1.1fr_1fr_0.7fr_0.8fr_0.8fr] md:items-center"
                >
                  <span className="truncate font-medium">{patient.patientName}</span>
                  <span className="truncate text-muted-foreground">
                    {doctorNameById.get(patient.doctorId) ?? patient.doctorName}
                  </span>
                  <span className="text-muted-foreground">
                    {patient.appointmentTime ? new Date(patient.appointmentTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit"
                    }) : "--"}
                  </span>
                  <span
                    className={`w-fit rounded-full border px-2 py-0.5 text-xs font-semibold capitalize ${priorityStyles[displayPriority]}`}
                  >
                    {displayPriority}
                  </span>
                  <span className="capitalize text-primary">{patient.status}</span>
                </div>
              );
            })
          ) : (
            <div className="border-t border-white/10 px-4 py-8 text-center text-sm text-muted-foreground">
              No appointments booked yet.
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
