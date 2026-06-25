import type { QueueSettings } from "@queue-cure/shared";
export declare function getSettings(): Promise<QueueSettings>;
export declare function updateSettings(avgConsultationTime: number): Promise<QueueSettings>;
