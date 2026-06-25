"use client";

export const dynamic = "force-dynamic";

import {
  AlertCircle,
  CheckCircle2,
  MapPin,
  Search,
  Ticket,
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { CurrentToken } from "@/components/waiting-room/CurrentToken";
import { EstimatedWaitTime } from "@/components/waiting-room/EstimatedWaitTime";
import { TokensAhead } from "@/components/waiting-room/TokensAhead";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Stat } from "@/components/ui/Stat";
import { useQueue } from "@/hooks/useQueue";
import { fetchPatientTracking } from "@/lib/api";
import { buildPatientTrackingView } from "@/lib/queue/tracking";
import type { PatientQueueView } from "@queue-cure/shared";

const TRACKED_TOKEN_KEY = "queue-cure-tracked-token";

export default function WaitingRoomPage() {
  const { queueState, loading, error, connected } = useQueue();
  const [tokenInput, setTokenInput] = useState("");
  const [trackedToken, setTrackedToken] = useState<number | null>(null);
  const [tracking, setTracking] = useState<PatientQueueView | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);

  useEffect(() => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlSearchParams.get("token");
    if (tokenFromUrl) {
      const tokenNumber = Number(tokenFromUrl);
      if (Number.isInteger(tokenNumber) && tokenNumber > 0) {
        setTrackedToken(tokenNumber);
        setTokenInput(String(tokenNumber));
        window.localStorage.setItem(TRACKED_TOKEN_KEY, String(tokenNumber));
        return;
      }
    }

    const savedToken = window.localStorage.getItem(TRACKED_TOKEN_KEY);
    if (!savedToken) return;

    const tokenNumber = Number(savedToken);
    if (Number.isInteger(tokenNumber) && tokenNumber > 0) {
      setTrackedToken(tokenNumber);
      setTokenInput(String(tokenNumber));
    }
  }, []);

  useEffect(() => {
    if (!queueState || !trackedToken) return;

    const liveTracking = buildPatientTrackingView(queueState, trackedToken);
    if (liveTracking) {
      setTracking(liveTracking);
      setTrackingError(null);
    }
  }, [queueState, trackedToken]);

  async function handleTrackPatient(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const tokenNumber = Number(tokenInput);

    if (!Number.isInteger(tokenNumber) || tokenNumber < 1) {
      setTrackingError("Enter a valid positive token number.");
      setTracking(null);
      return;
    }

    setTrackingLoading(true);
    setTrackingError(null);

    try {
      const result = await fetchPatientTracking(tokenNumber);
      setTrackedToken(tokenNumber);
      setTracking(result);
      window.localStorage.setItem(TRACKED_TOKEN_KEY, String(tokenNumber));
    } catch (err) {
      setTrackedToken(null);
      setTracking(null);
      window.localStorage.removeItem(TRACKED_TOKEN_KEY);
      setTrackingError(
        err instanceof Error ? err.message : "Unable to track this token.",
      );
    } finally {
      setTrackingLoading(false);
    }
  }

  const currentServingPatient =
    tracking?.currentServingPatient ?? queueState?.currentToken ?? null;
  const currentToken = currentServingPatient?.tokenNumber ?? null;
  const display = useMemo(
    () => ({
      myToken: tracking?.patient.tokenNumber ?? null,
      tokensAhead: tracking?.tokensAhead ?? 0,
      estimatedWait: tracking?.estimatedWaitTime ?? 0,
      queuePosition: tracking?.queuePosition ?? null,
      statusMessage:
        tracking?.statusMessage ??
        "Enter your token number to track your position.",
    }),
    [tracking],
  );

  return (
    <main className="min-h-screen overflow-hidden bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.18),transparent_38%),radial-gradient(circle_at_90%_20%,hsl(var(--accent)/0.13),transparent_30%)]" />
      <div className="relative mx-auto max-w-6xl space-y-6">
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"
        >
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">
              Waiting Room
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">
              Live Token Status
            </h1>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-sm text-muted-foreground">
            <span
              className={`size-2 rounded-full ${connected ? "bg-primary" : "bg-destructive"}`}
            />
            {connected ? "Live" : "Offline"}
          </div>
        </motion.header>

        {error ? (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle className="size-4" />
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
            <div className="h-80 animate-pulse rounded-lg bg-white/[0.06]" />
            <div className="space-y-4">
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="h-28 animate-pulse rounded-lg bg-white/[0.06]"
                />
              ))}
            </div>
          </div>
        ) : (
          <section className="grid gap-4 lg:grid-cols-[1fr_340px]">
            <CurrentToken
              token={currentToken}
              patient={currentServingPatient}
            />
            <div className="space-y-4">
              <Card className="p-5">
                <form onSubmit={handleTrackPatient} className="space-y-3">
                  <label>
                    <span className="mb-2 block text-sm font-medium text-muted-foreground">
                      Enter Your Token Number
                    </span>
                    <Input
                      type="number"
                      min={1}
                      inputMode="numeric"
                      value={tokenInput}
                      onChange={(event) => setTokenInput(event.target.value)}
                      placeholder="Token number"
                      aria-label="Enter your token number"
                    />
                  </label>
                  <Button
                    type="submit"
                    loading={trackingLoading}
                    className="w-full"
                  >
                    <Search className="size-4" />
                    Track My Position
                  </Button>
                </form>
                {trackingError ? (
                  <p className="mt-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {trackingError}
                  </p>
                ) : null}
              </Card>
              <Stat
                label="My Token Number"
                value={display.myToken ?? "--"}
                icon={Ticket}
              />
              <TokensAhead value={display.tokensAhead} />
              <EstimatedWaitTime minutes={display.estimatedWait} />
              <Stat
                label="Queue Position"
                value={display.queuePosition ?? "--"}
                icon={MapPin}
                accent="text-accent"
              />
              <Card className="p-5">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 size-5 text-primary" />
                  <div>
                    <p className="font-semibold">{display.statusMessage}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      This screen updates automatically through Socket.IO when
                      reception calls the next token.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
