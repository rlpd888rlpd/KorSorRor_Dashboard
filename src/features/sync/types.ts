export type SyncStepId = 'mediators' | 'gov' | 'public';

export interface SyncStepStatus {
  step: SyncStepId;
  label: string;
  status: 'idle' | 'running' | 'success' | 'error';
  count?: number;
  message?: string;
  durationMs?: number;
}

export interface SyncApiResponse {
  success: boolean;
  step: SyncStepId;
  count: number;
  message: string;
  durationMs?: number;
  error?: string;
}
