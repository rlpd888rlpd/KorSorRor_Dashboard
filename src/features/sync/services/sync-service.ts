import { SyncStepId, SyncStepStatus, SyncApiResponse } from '../types';

export const SYNC_STEPS_CONFIG: { step: SyncStepId; label: string }[] = [
  { step: 'mediators', label: 'ข้อมูลผู้ไกล่เกลี่ย (Master)' },
  { step: 'gov', label: 'ทะเบียนผู้ไกล่เกลี่ยส่วนราชการ' },
  { step: 'public', label: 'ทะเบียนผู้ไกล่เกลี่ยภาคประชาชน' },
];

export async function executeStepSync(
  step: SyncStepId,
  pin: string
): Promise<SyncApiResponse> {
  const res = await fetch('/api/sync/mediators', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ step, pin }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || `การซิงค์ขั้น ${step} ไม่สำเร็จ`);
  }
  return data;
}

export async function runFullSequentialSync(
  pin: string,
  onProgress: (statuses: Record<SyncStepId, SyncStepStatus>, progressPct: number) => void
): Promise<boolean> {
  const statuses: Record<SyncStepId, SyncStepStatus> = {
    mediators: { step: 'mediators', label: 'ข้อมูลผู้ไกล่เกลี่ย (Master)', status: 'idle' },
    gov: { step: 'gov', label: 'ทะเบียนผู้ไกล่เกลี่ยส่วนราชการ', status: 'idle' },
    public: { step: 'public', label: 'ทะเบียนผู้ไกล่เกลี่ยภาคประชาชน', status: 'idle' },
  };

  const steps: SyncStepId[] = ['mediators', 'gov', 'public'];

  for (let i = 0; i < steps.length; i++) {
    const currentStep = steps[i];
    statuses[currentStep].status = 'running';
    onProgress({ ...statuses }, Math.round((i / steps.length) * 100));

    try {
      const res = await executeStepSync(currentStep, pin);
      statuses[currentStep].status = 'success';
      statuses[currentStep].count = res.count;
      statuses[currentStep].message = res.message;
      statuses[currentStep].durationMs = res.durationMs;
      onProgress({ ...statuses }, Math.round(((i + 1) / steps.length) * 100));
    } catch (err: unknown) {
      statuses[currentStep].status = 'error';
      statuses[currentStep].message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาด';
      onProgress({ ...statuses }, Math.round((i / steps.length) * 100));
      throw err;
    }
  }

  return true;
}
