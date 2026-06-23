"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { AppointmentBooking } from "@/components/dashboard/AppointmentBooking";
import { DoctorStatusPanel } from "@/components/dashboard/DoctorStatusPanel";
import { QueueList } from "@/components/dashboard/QueueList";
import { VoiceAnnouncer } from "@/components/dashboard/VoiceAnnouncer";
import { Card } from "@/components/ui/Card";
import { useQueue } from "@/hooks/useQueue";

export default function ReceptionistDashboardPage() {
  const {
    queueState,
    loading,
    error,
    connected,
    callNextForDoctor,
    completeConsultationForDoctor,
    setDoctorAvailability,
    refresh
  } = useQueue();

  const doctors = queueState?.doctors ?? [];
  const patients = queueState?.patients ?? [];
  const appointmentPatients = queueState?.appointmentPatients ?? [];
  const avgConsultationTime = queueState?.settings.avgConsultationTime ?? 10;

  return (
    <main className="min-h-screen overflow-x-hidden bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_10%,hsl(var(--primary)/0.16),transparent_32%),radial-gradient(circle_at_80%_0%,hsl(var(--accent)/0.12),transparent_30%)]" />
      <div className="relative mx-auto max-w-7xl">
        <div className="space-y-5">
          <motion.header
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col justify-between gap-4 rounded-lg border border-white/10 bg-surface/50 p-4 shadow-glow backdrop-blur-xl sm:flex-row sm:items-end"
          >
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">
                Reception
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                Clinic Queue Command Center
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-sm text-muted-foreground">
                <span className={`size-2 rounded-full ${connected ? "bg-primary" : "bg-destructive"}`} />
                {connected ? "Live updates connected" : "Reconnecting"}
              </div>
              <VoiceAnnouncer />
            </div>
          </motion.header>

          {error ? (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              <AlertCircle className="size-4" />
              {error}
            </div>
          ) : null}

          <section className="grid gap-5 xl:grid-cols-[7fr_3fr]">
            <Card className="flex h-[450px] min-h-0 flex-col p-4 sm:p-5 md:h-[550px] xl:h-[650px]">
              <div className="mb-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-xl font-semibold">Queue List</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Waiting and serving patients across all doctors.
                  </p>
                </div>
              </div>
              {loading ? (
                <div className="min-h-0 flex-1 space-y-3 overflow-hidden">
                  {[0, 1, 2, 3].map((item) => (
                    <div key={item} className="h-16 animate-pulse rounded-lg bg-white/[0.06]" />
                  ))}
                </div>
              ) : (
                <QueueList patients={patients} doctors={doctors} />
              )}
            </Card>

            <section className="h-[450px] min-h-0 md:h-[550px] xl:h-[650px]">
              <AppointmentBooking
                doctors={doctors}
                appointmentPatients={appointmentPatients}
                onBooked={refresh}
              />
            </section>
          </section>

          <section className="grid gap-5 xl:grid-cols-[7fr_3fr]">
            {queueState ? (
              <DoctorStatusPanel
                doctors={doctors}
                pausedDoctorIds={queueState.pausedDoctorIds}
                patients={patients}
                avgConsultationTime={avgConsultationTime}
                onCallNext={callNextForDoctor}
                onCompleteConsultation={completeConsultationForDoctor}
                onAvailability={setDoctorAvailability}
              />
            ) : (
              <Card className="flex min-h-64 items-center justify-center p-8">
                <Loader2 className="size-6 animate-spin text-primary" />
              </Card>
            )}

            <Card className="p-4 sm:p-5">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Active Tokens
              </p>
              <div className="mt-4 grid gap-3">
                {queueState?.currentTokens.length ? (
                  queueState.currentTokens.map((patient) => (
                    <div key={patient.id} className="rounded-lg border border-primary/20 bg-primary/10 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-3xl font-black tracking-tight text-primary">
                            T{patient.tokenNumber}
                          </p>
                          <p className="mt-2 truncate text-sm font-semibold">{patient.patientName}</p>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          <p>{patient.doctorName}</p>
                          <p>Room {patient.room}</p>
                        </div>
                      </div>
                      <p className="mt-3 text-xs text-muted-foreground">
                        Started{" "}
                        {patient.consultationStartTime
                          ? new Date(patient.consultationStartTime).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit"
                            })
                          : "--"}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg border border-primary/20 bg-primary/10 p-5 text-center">
                    <p className="text-5xl font-black tracking-tight text-primary">--</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      No patient is currently serving
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </section>
        </div>
      </div>
    </main>
  );
}
