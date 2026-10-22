'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, Loader2, Database, KeyRound, ArrowRight } from 'lucide-react';
import { SyncStepId, SyncStepStatus } from '../types';
import { runFullSequentialSync, SYNC_STEPS_CONFIG } from '../services/sync-service';
import { SyncStepItem } from './sync-step-item';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncComplete: () => void;
}

export function SyncModal({ isOpen, onClose, onSyncComplete }: SyncModalProps) {
  const [pin, setPin] = useState('8888');
  const [isRunning, setIsRunning] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [steps, setSteps] = useState<Record<SyncStepId, SyncStepStatus>>({
    mediators: { step: 'mediators', label: 'ข้อมูลผู้ไกล่เกลี่ย (Master)', status: 'idle' },
    gov: { step: 'gov', label: 'ทะเบียนผู้ไกล่เกลี่ยส่วนราชการ', status: 'idle' },
    public: { step: 'public', label: 'ทะเบียนผู้ไกล่เกลี่ยภาคประชาชน', status: 'idle' },
  });

  if (!isOpen) return null;

  const handleStartSync = async () => {
    setErrorMsg(null);
    setIsSuccess(false);
    setIsRunning(true);
    setProgressPct(0);

    try {
      await runFullSequentialSync(pin, (updatedSteps, pct) => {
        setSteps(updatedSteps);
        setProgressPct(pct);
      });
      setIsSuccess(true);
      onSyncComplete();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการซิงค์ข้อมูล');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-100 text-sky-700">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">ซิงค์ข้อมูลจาก Google Sheets</h3>
              <p className="text-xs text-slate-500">อัปเดตข้อมูลผู้ไกล่เกลี่ยขึ้น Supabase อัตโนมัติ</p>
            </div>
          </div>
          {!isRunning && (
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">รหัส Admin PIN</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                disabled={isRunning}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="กรอกรหัส Admin PIN"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 font-mono tracking-widest disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-600 mb-1">
              <span>ความคืบหน้า</span>
              <span className="font-semibold text-sky-700">{progressPct}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-indigo-600 transition-all duration-300 rounded-full"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <div className="space-y-2">
            {SYNC_STEPS_CONFIG.map(({ step, label }) => (
              <SyncStepItem key={step} label={label} stepStatus={steps[step]} />
            ))}
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>ซิงค์ข้อมูลสำเร็จครบทุกขั้นตอนแล้ว! สถิติถูกอัปเดตเรียบร้อย</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-end gap-2">
          <button
            type="button"
            disabled={isRunning}
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors disabled:opacity-50"
          >
            {isSuccess ? 'ปิด' : 'ยกเลิก'}
          </button>

          {!isSuccess && (
            <button
              type="button"
              disabled={isRunning || !pin}
              onClick={handleStartSync}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-xl transition-colors shadow-sm disabled:opacity-50"
            >
              {isRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>เริ่มดึงข้อมูล</span>}
              {!isRunning && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
