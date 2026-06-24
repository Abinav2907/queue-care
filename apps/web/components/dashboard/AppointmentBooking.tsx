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

function getAppointmentDateError(value: string, currentYear: number) {
  if (!value) return null;

  const yearMatch = value.match(/^(\d{4})-/);
  if (!yearMatch) {
    return "Enter a valid appointment year using exactly 4 digits.";
  }

  const year = Number(yearMatch[1]);
  if (year !== currentYear && year !== currentYear + 1) {
    return `Appointments can only be booked in ${currentYear} or ${currentYear + 1}.`;
  }

  const appointmentDate = new Date(value);
  if (Number.isNaN(appointmentDate.getTime())) {
    return "Enter a valid appointment date and time.";
  }

  return null;
}

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
  const [dateError, setDateError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { notify } = useToast();
  const currentYear = new Date().getFullYear();
  const minAppointmentDate = `${currentYear}-01-01T00:00`;
  const maxAppointmentDate = `${currentYear + 1}-12-31T23:59`;
  const availableDoctors = useMemo(
    () => doctors.filter((doctor) => doctor.availability === "available"),
    [doctors]
  );
  const doctorNameById = useMemo(
    () => new Map(doctors.map((doctor) => [doctor.id, doctor.name])),
    [doctors]
  );
  const appointmentsByDoctor = useMemo(() => {
    const sortedAppointments = [...appointmentPatients].sort((a, b) => {
      const left = a.appointmentTime ? new Date(a.appointmentTime).getTime() : Number.MAX_SAFE_INTEGER;
      const right = b.appointmentTime ? new Date(b.appointmentTime).getTime() : Number.MAX_SAFE_INTEGER;
      return left - right || a.tokenNumber - b.tokenNumber;
    });
    const knownGroups = doctors.map((doctor) => ({
      doctorId: doctor.id,
      doctorName: doctor.name,
      patients: sortedAppointments.filter((patient) => patient.doctorId === doctor.id)
    }));
    const unassignedPatients = sortedAppointments.filter(
      (patient) => !doctors.some((doctor) => doctor.id === patient.doctorId)
    );

    if (!unassignedPatients.length) return knownGroups.filter((group) => group.patients.length);

    return [
      ...knownGroups.filter((group) => group.patients.length),
      {
        doctorId: "unassigned",
        doctorName: "Unassigned",
        patients: unassignedPatients
      }
    ];
  }, [appointmentPatients, doctors]);

  useEffect(() => {
    if (!availableDoctors.some((doctor) => doctor.id === doctorId)) {
      setDoctorId(availableDoctors[0]?.id ?? "");
    }
  }, [availableDoctors, doctorId]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextDateError = getAppointmentDateError(scheduledAt, currentYear);
    setDateError(nextDateError);

    if (nextDateError) {
      notify({ title: "Invalid appointment date", description: nextDateError, tone: "error" });
      return;
    }

    if (!doctorId) {
      notify({
        title: "No doctor available",
        description: "Choose an available doctor before booking an appointment.",
        tone: "error"
      });
      return;
    }

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
      setDateError(null);
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
          min={minAppointmentDate}
          max={maxAppointmentDate}
          onChange={(event) => {
            const nextValue = event.target.value;
            setScheduledAt(nextValue);
            setDateError(getAppointmentDateError(nextValue, currentYear));
          }}
          required
        />
        {dateError ? <p className="text-xs font-medium text-destructive">{dateError}</p> : null}
        <select
          value={priority}
          onChange={(event) => setPriority(event.target.value as AppointmentPriority)}
          className="h-11 w-full rounded-md border border-white/10 bg-background px-3 text-sm"
        >
          <option value="normal">Normal</option>
          <option value="urgent">Urgent</option>
          <option value="emergency">Emergency</option>
        </select>
        <Button
          type="submit"
          loading={loading}
          disabled={!doctorId || Boolean(dateError)}
          className="w-full xl:w-auto"
        >
          Book
        </Button>
      </form>

      <div className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-white/10">
        <div className="bg-white/[0.06] px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Appointments
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {appointmentsByDoctor.length ? (
            appointmentsByDoctor.map((group) => (
              <section key={group.doctorId} className="border-t border-white/10">
                <div className="sticky top-0 z-10 bg-background/95 px-3 py-2 backdrop-blur">
                  <h3 className="truncate text-sm font-bold text-foreground">{group.doctorName}</h3>
                </div>
                <div className="divide-y divide-white/10">
                  {group.patients.map((patient) => {
                    const displayPriority: AppointmentPriority =
                      patient.priority === "urgent" || patient.priority === "emergency"
                        ? patient.priority
                        : "normal";

                    return (
                      <div
                        key={patient.id}
                        className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-1 px-3 py-2.5 text-sm"
                      >
                        <span className="font-semibold text-primary">
                          {patient.appointmentTime
                            ? new Date(patient.appointmentTime).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit"
                              })
                            : "--"}
                        </span>
                        <span className="truncate font-semibold">{patient.patientName}</span>
                        <span
                          className={`w-fit rounded-full border px-2 py-0.5 text-xs font-semibold capitalize ${priorityStyles[displayPriority]}`}
                        >
                          {displayPriority}
                        </span>
                        <span className="truncate text-xs capitalize text-muted-foreground">
                          {doctorNameById.get(patient.doctorId) ?? patient.doctorName} - {patient.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))
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
