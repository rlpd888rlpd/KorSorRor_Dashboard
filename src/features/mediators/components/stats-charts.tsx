'use client';

import React from 'react';
import { MediatorKPISummary } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';

interface StatsChartsProps {
  kpis: MediatorKPISummary;
}

export function StatsCharts({ kpis }: StatsChartsProps) {
  const typeData = [
    { name: '2 ประเภท (รัฐ+ปชช.)', value: kpis.dualCount, color: '#8b5cf6' },
    { name: 'เฉพาะภาคประชาชน', value: kpis.publicCount, color: '#10b981' },
    { name: 'เฉพาะภาครัฐ', value: kpis.govCount, color: '#0284c7' },
    { name: 'ยังไม่ขึ้นทะเบียน', value: kpis.unregisteredCount, color: '#94a3b8' },
  ].filter(d => d.value > 0);

  const statusData = [
    { name: 'มีผลใช้งาน (Active)', value: kpis.activeCount, fill: '#10b981' },
    { name: 'หมดอายุแล้ว (Expired)', value: kpis.inactiveCount, fill: '#f59e0b' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      {/* Chart 1: Registration Type Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-1">สัดส่วนประเภทการขึ้นทะเบียน</h3>
        <p className="text-xs text-slate-500 mb-4">จำแนกตามการขึ้นทะเบียนภาครัฐ vs ภาคประชาชน</p>
        <div className="h-48 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={typeData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
              >
                {typeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [value.toLocaleString() + ' คน', 'จำนวน']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs mt-2 text-slate-600">
          {typeData.map((t) => (
            <div key={t.name} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }}></span>
              <span>{t.name}: <strong>{t.value.toLocaleString()}</strong></span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart 2: Status Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-1">สถานะอายุการขึ้นทะเบียน</h3>
        <p className="text-xs text-slate-500 mb-4">ตรวจสอบวันหมดอายุบัตรผู้ไกล่เกลี่ย</p>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusData} layout="vertical" margin={{ left: 10, right: 30, top: 10, bottom: 10 }}>
              <XAxis type="number" tickFormatter={(v) => v.toLocaleString()} fontSize={11} stroke="#94a3b8" />
              <YAxis type="category" dataKey="name" fontSize={11} stroke="#94a3b8" width={140} />
              <Tooltip formatter={(value: number) => [value.toLocaleString() + ' คน', 'จำนวน']} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-around text-xs mt-2 text-slate-600 pt-2 border-t border-slate-100">
          <div>มีผลใช้งาน: <strong className="text-emerald-600">{kpis.activeCount.toLocaleString()}</strong> คน</div>
          <div>หมดอายุแล้ว: <strong className="text-amber-600">{kpis.inactiveCount.toLocaleString()}</strong> คน</div>
        </div>
      </div>
    </div>
  );
}
