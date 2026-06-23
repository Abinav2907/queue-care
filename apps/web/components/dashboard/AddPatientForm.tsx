"use client";

import type { Doctor, PriorityLevel } from "@queue-cure/shared";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/providers/SocketProvider";

export function AddPatientForm({
  onAdd,
  loading,
  doctors
}: {
  onAdd: (input: { patientName: string; doctorId?: string; priority?: PriorityLevel }) => Promise<unknown>;
  loading: boolean;
  doctors: Doctor[];
}) {
  const [patientName, setPatientName] = useState("");
  const [doctorId, setDoctorId] = useState(doctors[0]?.id ?? "");
  const [priority, setPriority] = useState<PriorityLevel>("normal");
  const { notify } = useToast();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = patientName.trim();
    if (!name) return;

    try {
      await onAdd({ patientName: name, doctorId, priority });
      setPatientName("");
      notify({ title: "Patient added", description: `${name} joined the queue.`, tone: "success" });
    } catch (error) {
      notify({
        title: "Could not add patient",
        description: error instanceof Error ? error.message : "Please try again.",
        tone: "error"
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3">
      <Input
        value={patientName}
        onChange={(event) => setPatientName(event.target.value)}
        placeholder="Patient name"
        aria-label="Patient name"
        minLength={2}
        maxLength={80}
        required
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <select
          value={doctorId}
          onChange={(event) => setDoctorId(event.target.value)}
          className="h-11 rounded-md border border-white/10 bg-background px-3 text-sm text-foreground"
        >
          {doctors.map((doctor) => (
            <option key={doctor.id} value={doctor.id}>
              {doctor.name}
            </option>
          ))}
        </select>
        <select
          value={priority}
          onChange={(event) => setPriority(event.target.value as PriorityLevel)}
          className="h-11 rounded-md border border-white/10 bg-background px-3 text-sm text-foreground"
        >
          <option value="normal">Normal</option>
          <option value="priority">Priority</option>
          <option value="urgent">Urgent</option>
          <option value="emergency">Emergency</option>
        </select>
      </div>
      <Button type="submit" loading={loading}>
        <UserPlus className="size-4" />
        Add Patient
      </Button>
    </form>
  );
}
