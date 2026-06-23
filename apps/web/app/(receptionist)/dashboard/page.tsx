"use client";

import { AlertCircle, Clock3, HeartPulse, Loader2, UsersRound } from "lucide-react";
import { motion } from "framer-motion";
import { AddPatientForm } from "@/components/dashboard/AddPatientForm";
import { AverageConsultationTime } from "@/components/dashboard/AverageConsultationTime";
import { CallNextTokenButton } from "@/components/dashboard/CallNextTokenButton";
import { QueueList } from "@/components/dashboard/QueueList";
import { Card } from "@/components/ui/Card";
import { Stat } from "@/components/ui/Stat";
import { useQueue } from "@/hooks/useQueue";

export default function ReceptionistDashboardPage() {
  const {
    queueState,
    loading,
    mutating,
    error,
    connected,
    addPatient,
    callNext,
    updateAverageTime
  } = useQueue();

  const waiting = queueState?.waitingPatients ?? [];
  const currentToken = queueState?.currentToken;

  return (
    <main className="min-h-screen overflow-hidden bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_10%,hsl(var(--primary)/0.16),transparent_32%),radial-gradient(circle_at_80%_0%,hsl(var(--accent)/0.12),transparent_30%)]" />
      <div className="relative mx-auto max-w-7xl space-y-6">
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"
        >
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">
              Reception
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">
              Clinic Queue Command Center
            </h1>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-sm text-muted-foreground">
            <span className={`size-2 rounded-full ${connected ? "bg-primary" : "bg-destructive"}`} />
            {connected ? "Live updates connected" : "Reconnecting"}
          </div>
        </motion.header>

        {error ? (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle className="size-4" />
            {error}
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-3">
          <Stat label="Total Waiting" value={queueState?.analytics.totalWaiting ?? 0} icon={UsersRound} />
          <Stat
            label="Patients Served"
            value={queueState?.analytics.patientsServed ?? 0}
            icon={HeartPulse}
            accent="text-accent"
          />
          <Stat
            label="Average Wait"
            value={`${queueState?.analytics.averageWait ?? 0} min`}
            icon={Clock3}
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <Card className="p-5 sm:p-6">
            <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-xl font-semibold">Queue List</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Patients move from waiting to serving in real time.
                </p>
              </div>
              <CallNextTokenButton
                onCallNext={callNext}
                disabled={!waiting.length || loading}
                loading={mutating}
              />
            </div>
            {loading ? (
              <div className="space-y-3">
                {[0, 1, 2].map((item) => (
                  <div key={item} className="h-20 animate-pulse rounded-lg bg-white/[0.06]" />
                ))}
              </div>
            ) : (
              <QueueList patients={queueState?.patients ?? []} />
            )}
          </Card>

          <div className="space-y-6">
            <Card className="p-5 sm:p-6">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Active Token
              </p>
              <div className="mt-5 rounded-lg border border-primary/20 bg-primary/10 p-6 text-center">
                <p className="text-6xl font-black tracking-tight text-primary">
                  {currentToken?.tokenNumber ?? "--"}
                </p>
                <p className="mt-3 truncate text-sm text-muted-foreground">
                  {currentToken?.patientName ?? "No patient is currently serving"}
                </p>
              </div>
            </Card>

            <Card className="p-5 sm:p-6">
              <AddPatientForm onAdd={addPatient} loading={mutating} />
            </Card>

            <Card className="p-5 sm:p-6">
              <AverageConsultationTime
                value={queueState?.settings.avgConsultationTime ?? 10}
                loading={mutating}
                onUpdate={updateAverageTime}
              />
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}
