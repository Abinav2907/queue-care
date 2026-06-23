"use client";

import { SOCKET_EVENTS, type CreatePatientInput, type QueueState } from "@queue-cure/shared";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  callNextToken,
  callNextTokenForDoctor,
  completeConsultationForDoctor,
  createPatient,
  fetchQueueState,
  pauseDoctorQueue,
  resumeDoctorQueue,
  updateDoctorAvailability,
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
      addPatient: async (patientNameOrInput: string | CreatePatientInput, input?: CreatePatientInput) => {
        setMutating(true);
        setError(null);
        try {
          const payload =
            typeof patientNameOrInput === "string"
              ? { ...(input ?? {}), patientName: patientNameOrInput }
              : patientNameOrInput;
          const result = await createPatient(payload);
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
      callNextForDoctor: async (doctorId: string) => {
        setMutating(true);
        setError(null);
        try {
          const result = await callNextTokenForDoctor(doctorId);
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
      completeConsultationForDoctor: async (doctorId: string) => {
        setMutating(true);
        setError(null);
        try {
          const result = await completeConsultationForDoctor(doctorId);
          setQueueState(result.queueState);
          return result.queueState;
        } catch (err) {
          const message = err instanceof Error ? err.message : "Unable to complete consultation";
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
      },
      pauseQueue: async (doctorId: string) => {
        setMutating(true);
        try {
          const state = await pauseDoctorQueue(doctorId);
          setQueueState(state);
          return state;
        } finally {
          setMutating(false);
        }
      },
      resumeQueue: async (doctorId: string) => {
        setMutating(true);
        try {
          const state = await resumeDoctorQueue(doctorId);
          setQueueState(state);
          return state;
        } finally {
          setMutating(false);
        }
      },
      setDoctorAvailability: async (doctorId: string, availability: Parameters<typeof updateDoctorAvailability>[1]) => {
        setMutating(true);
        try {
          const result = await updateDoctorAvailability(doctorId, availability);
          setQueueState(result.queueState);
          return result.queueState;
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
