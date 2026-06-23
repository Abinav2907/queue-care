import type {
  CreatePatientInput,
  DoctorAvailability,
  NotificationRequest,
  Patient,
  PriorityLevel,
  PatientQueueView,
  QueueSettings,
  QueueState
} from "@queue-cure/shared";

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

export function updateDoctorAvailability(doctorId: string, availability: DoctorAvailability) {
  return request<{ queueState: QueueState }>(`/queue/doctors/${doctorId}`, {
    method: "PATCH",
    body: JSON.stringify({ availability })
  });
}

export function pauseDoctorQueue(doctorId: string) {
  return request<QueueState>(`/queue/doctors/${doctorId}/pause`, { method: "POST" });
}

export function resumeDoctorQueue(doctorId: string) {
  return request<QueueState>(`/queue/doctors/${doctorId}/resume`, { method: "POST" });
}

export function bookAppointment(input: {
  patientName: string;
  doctorId: string;
  scheduledAt: string;
  priority?: PriorityLevel;
  phoneNumber?: string;
}) {
  return request<{ patient: Patient; queueState: QueueState }>("/queue/appointments", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function queueNotification(input: NotificationRequest) {
  return request("/queue/notifications", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function fetchPatientTracking(tokenNumber: number): Promise<PatientQueueView> {
  return request<PatientQueueView>(`/patients/token/${tokenNumber}`);
}

export function callNextToken() {
  return request<{ queueState: QueueState }>("/queue/call-next", {
    method: "POST"
  });
}

export function callNextTokenForDoctor(doctorId: string) {
  return request<{ queueState: QueueState }>(`/queue/call-next?doctorId=${encodeURIComponent(doctorId)}`, {
    method: "POST"
  });
}

export function completeConsultationForDoctor(doctorId: string) {
  return request<{ queueState: QueueState }>(`/queue/doctors/${doctorId}/complete`, {
    method: "POST"
  });
}

export function updateAverageConsultationTime(avgConsultationTime: number) {
  return request<{ settings: QueueSettings; queueState: QueueState }>("/queue/settings", {
    method: "PATCH",
    body: JSON.stringify({ avgConsultationTime })
  });
}
