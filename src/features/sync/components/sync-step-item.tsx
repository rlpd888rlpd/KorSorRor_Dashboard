'use client';

import React from 'react';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { SyncStepStatus } from '../types';

interface SyncStepItemProps {
  label: string;
  stepStatus: SyncStepStatus;
}

export function SyncStepItem({ label, stepStatus }: SyncStepItemProps) {
  return (
    <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 text-xs">
      <div className="flex items-center gap-2">
        {stepStatus.status === 'idle' && <span className="w-2 h-2 rounded-full bg-slate-300" />}
        {stepStatus.status === 'running' && <Loader2 className="w-3.5 h-3.5 text-sky-600 animate-spin" />}
        {stepStatus.status === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
        {stepStatus.status === 'error' && <AlertCircle className="w-3.5 h-3.5 text-rose-600" />}
        <span className="font-medium text-slate-700">{label}</span>
      </div>
      <span className="text-[11px] text-slate-500 font-medium">
        {stepStatus.status === 'success'
          ? `${stepStatus.count?.toLocaleString()} รายการ`
          : stepStatus.status === 'running'
          ? 'กำลังซิงค์...'
          : ''}
      </span>
    </div>
  );
}
