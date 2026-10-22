'use client';

import React from 'react';
import { Users, Tent, GraduationCap, Building2, Wallet } from 'lucide-react';

export type ActiveTab = 'mediators' | 'expo';

interface DashboardNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export function DashboardNav({ activeTab, onTabChange }: DashboardNavProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
      <button
        onClick={() => onTabChange('mediators')}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
          activeTab === 'mediators'
            ? 'bg-sky-700 text-white shadow-sm shadow-sky-700/20'
            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
        }`}
      >
        <Users className="w-4 h-4" />
        <span>สถิติผู้ไกล่เกลี่ย</span>
      </button>

      <button
        onClick={() => onTabChange('expo')}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
          activeTab === 'expo'
            ? 'bg-sky-700 text-white shadow-sm shadow-sky-700/20'
            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
        }`}
      >
        <Tent className="w-4 h-4" />
        <span>สถิติมหกรรมไกล่เกลี่ย</span>
        <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 font-bold">
          ใหม่
        </span>
      </button>

      <div className="hidden lg:flex items-center gap-2 text-slate-400">
        <span className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-100/60 border border-dashed border-slate-200 cursor-not-allowed">
          <GraduationCap className="w-4 h-4" /> หลักสูตรฝึกอบรม
        </span>
        <span className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-100/60 border border-dashed border-slate-200 cursor-not-allowed">
          <Building2 className="w-4 h-4" /> ศูนย์ไกล่เกลี่ยฯ
        </span>
        <span className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-100/60 border border-dashed border-slate-200 cursor-not-allowed">
          <Wallet className="w-4 h-4" /> งบประมาณ
        </span>
      </div>
    </div>
  );
}
