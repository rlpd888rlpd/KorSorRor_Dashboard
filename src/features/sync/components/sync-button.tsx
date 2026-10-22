'use client';

import React, { useState } from 'react';
import { Database } from 'lucide-react';
import { SyncModal } from './sync-modal';

interface SyncButtonProps {
  onSyncComplete?: () => void;
}

export function SyncButton({ onSyncComplete }: SyncButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 transition-colors shadow-sm"
      >
        <Database className="w-3.5 h-3.5 text-sky-600" />
        <span>ดึงข้อมูลจาก Google Sheets</span>
      </button>

      <SyncModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSyncComplete={() => {
          if (onSyncComplete) onSyncComplete();
        }}
      />
    </>
  );
}
