import type { CreatePatientInput, QueueSettings, QueueState } from "@queue-cure/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(payload?.message ?? "Request failed");
  }

  return response.json() as Promise<T>;
}

export function fetchQueueState(): Promise<QueueState> {
  return request<QueueState>("/queue");
}

export function createPatient(input: CreatePatientInput) {
  return request<{ queueState: QueueState }>("/patients", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function callNextToken() {
  return request<{ queueState: QueueState }>("/queue/call-next", {
    method: "POST"
  });
}

export function updateAverageConsultationTime(avgConsultationTime: number) {
  return request<{ settings: QueueSettings; queueState: QueueState }>("/queue/settings", {
    method: "PATCH",
    body: JSON.stringify({ avgConsultationTime })
  });
}
