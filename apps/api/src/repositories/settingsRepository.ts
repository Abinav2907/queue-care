import type { QueueSettings, SettingsRecord } from "@queue-cure/shared";
import { supabase } from "../config/supabase.js";

let memorySettings: QueueSettings = {
  avgConsultationTime: 10
};
let warnedAboutSupabaseFallback = false;
let supabaseSettingsAvailable = true;

function warnSupabaseFallback(error: unknown): void {
  supabaseSettingsAvailable = false;
  if (warnedAboutSupabaseFallback) return;
  warnedAboutSupabaseFallback = true;
  const message =
    typeof error === "object" && error && "message" in error
      ? String((error as { message?: unknown }).message)
      : "Supabase request failed";
  console.warn(`Supabase settings unavailable, using in-memory settings fallback: ${message}`);
}

function toSettings(record: SettingsRecord | null): QueueSettings {
  return {
    avgConsultationTime: record?.avg_consultation_time ?? memorySettings.avgConsultationTime
  };
}

export async function getSettings(): Promise<QueueSettings> {
  if (!supabase || !supabaseSettingsAvailable) return memorySettings;

  const { data, error } = await supabase
    .from("settings")
    .select("avg_consultation_time")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    warnSupabaseFallback(error);
    return memorySettings;
  }

  if (!data) {
    return updateSettings(memorySettings.avgConsultationTime);
  }

  return toSettings(data as SettingsRecord);
}

export async function updateSettings(avgConsultationTime: number): Promise<QueueSettings> {
  memorySettings = { avgConsultationTime };

  if (!supabase || !supabaseSettingsAvailable) return memorySettings;

  const { data, error } = await supabase
    .from("settings")
    .upsert({ id: 1, avg_consultation_time: avgConsultationTime }, { onConflict: "id" })
    .select("avg_consultation_time")
    .single();

  if (error) {
    warnSupabaseFallback(error);
    return memorySettings;
  }

  return toSettings(data as SettingsRecord);
}
