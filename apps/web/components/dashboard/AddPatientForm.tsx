"use client";

import { UserPlus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/providers/SocketProvider";

export function AddPatientForm({
  onAdd,
  loading
}: {
  onAdd: (patientName: string) => Promise<void>;
  loading: boolean;
}) {
  const [patientName, setPatientName] = useState("");
  const { notify } = useToast();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = patientName.trim();
    if (!name) return;

    try {
      await onAdd(name);
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
      <Input
        value={patientName}
        onChange={(event) => setPatientName(event.target.value)}
        placeholder="Patient name"
        aria-label="Patient name"
        minLength={2}
        maxLength={80}
        required
      />
      <Button type="submit" loading={loading} className="sm:w-44">
        <UserPlus className="size-4" />
        Add Patient
      </Button>
    </form>
  );
}
