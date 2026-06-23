import type { QueueSettings, SettingsRecord } from "@queue-cure/shared";
import { supabase } from "../config/supabase";

let memorySettings: QueueSettings = {
  avgConsultationTime: 10
};

function toSettings(record: SettingsRecord | null): QueueSettings {
  return {
    avgConsultationTime: record?.avg_consultation_time ?? memorySettings.avgConsultationTime
  };
}

export async function getSettings(): Promise<QueueSettings> {
  if (!supabase) return memorySettings;

  const { data, error } = await supabase
    .from("settings")
    .select("avg_consultation_time")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return toSettings(data as SettingsRecord | null);
}

export async function updateSettings(avgConsultationTime: number): Promise<QueueSettings> {
  memorySettings = { avgConsultationTime };

  if (!supabase) return memorySettings;

  const { data, error } = await supabase
    .from("settings")
    .upsert({ id: 1, avg_consultation_time: avgConsultationTime }, { onConflict: "id" })
    .select("avg_consultation_time")
    .single();

  if (error) throw error;
  return toSettings(data as SettingsRecord);
}
