"use client";

import { SOCKET_EVENTS, type QueueState } from "@queue-cure/shared";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  callNextToken,
  createPatient,
  fetchQueueState,
  updateAverageConsultationTime
} from "@/lib/api";
import { useSocket } from "./useSocket";

export function useQueue() {
  const { socket, connected } = useSocket();
  const [queueState, setQueueState] = useState<QueueState | null>(null);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    const state = await fetchQueueState();
    setQueueState(state);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "Unable to load queue");
      setLoading(false);
    });
  }, [refresh]);

  useEffect(() => {
    function handleState(state: QueueState) {
      setQueueState(state);
      setLoading(false);
      setError(null);
    }

    socket.on(SOCKET_EVENTS.QUEUE_STATE, handleState);
    socket.on(SOCKET_EVENTS.QUEUE_UPDATED, handleState);
    socket.emit("queue:sync");

    return () => {
      socket.off(SOCKET_EVENTS.QUEUE_STATE, handleState);
      socket.off(SOCKET_EVENTS.QUEUE_UPDATED, handleState);
    };
  }, [socket]);

  const actions = useMemo(
    () => ({
      addPatient: async (patientName: string) => {
        setMutating(true);
        setError(null);
        try {
          const result = await createPatient({ patientName });
          setQueueState(result.queueState);
          return result.queueState;
        } catch (err) {
          const message = err instanceof Error ? err.message : "Unable to add patient";
          setError(message);
          throw err;
        } finally {
          setMutating(false);
        }
      },
      callNext: async () => {
        setMutating(true);
        setError(null);
        try {
          const result = await callNextToken();
          setQueueState(result.queueState);
          return result.queueState;
        } catch (err) {
          const message = err instanceof Error ? err.message : "Unable to call next token";
          setError(message);
          throw err;
        } finally {
          setMutating(false);
        }
      },
      updateAverageTime: async (avgConsultationTime: number) => {
        setMutating(true);
        setError(null);
        try {
          const result = await updateAverageConsultationTime(avgConsultationTime);
          setQueueState(result.queueState);
          return result.queueState;
        } catch (err) {
          const message = err instanceof Error ? err.message : "Unable to update settings";
          setError(message);
          throw err;
        } finally {
          setMutating(false);
        }
      }
    }),
    []
  );

  return {
    queueState,
    loading,
    mutating,
    error,
    connected,
    refresh,
    ...actions
  };
}
