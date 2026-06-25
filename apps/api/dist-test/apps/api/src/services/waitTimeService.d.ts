import type { Patient, QueueAnalytics, QueueSettings } from "@queue-cure/shared";
export declare function getTokensAhead(patients: Patient[], tokenNumber: number): number;
export declare function estimateWaitTime(tokensAhead: number, settings: QueueSettings): number;
export declare function getAverageWait(patients: Patient[], settings: QueueSettings): number;
export declare function getAnalytics(patients: Patient[], settings: QueueSettings): QueueAnalytics;
