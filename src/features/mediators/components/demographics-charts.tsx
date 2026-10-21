'use client';

import React from 'react';
import { GenderRatioItem, MediatorKPISummary } from '../types';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Users, Award } from 'lucide-react';

interface DemographicsChartsProps {
  genderRatios: GenderRatioItem[];
  kpis: MediatorKPISummary;
}

export function DemographicsCharts({ genderRatios, kpis }: DemographicsChartsProps) {
  const typeData = [
    { name: '2 ด้าน (รัฐ + ปชช.)', value: kpis.dualCount, color: '#8b5cf6' },
    { name: 'เฉพาะภาคประชาชน', value: kpis.publicCount, color: '#10b981' },
    { name: 'เฉพาะภาครัฐ', value: kpis.govCount, color: '#0284c7' },
    { name: 'ยังไม่ขึ้นทะเบียน', value: kpis.unregisteredCount, color: '#94a3b8' },
  ].filter(d => d.value > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
      {/* Chart 1: Gender Ratio */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-pink-50 text-pink-700">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">สัดส่วนเพศผู้ไกล่เกลี่ย</h3>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">ประชากรศาสตร์</span>
        </div>
        <p className="text-xs text-slate-500 mb-3">จำแนกตามโครงสร้างเพศ (ชาย vs หญิง)</p>

        <div className="h-48 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={genderRatios} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                {genderRatios.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [value.toLocaleString() + ' คน', 'จำนวน']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs mt-2 text-slate-600">
          {genderRatios.map((t) => (
            <div key={t.name} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }}></span>
              <span>{t.name}: <strong>{t.value.toLocaleString()}</strong> ({Math.round((t.value / Math.max(1, kpis.total)) * 100)}%)</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart 2: Registration Category */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-700">
              <Award className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">สัดส่วนประเภทการขึ้นทะเบียน</h3>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">ตาม พ.ร.บ.</span>
        </div>
        <p className="text-xs text-slate-500 mb-3">เปรียบเทียบผู้ไกล่เกลี่ยภาครัฐและภาคประชาชน</p>

        <div className="h-48 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={typeData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                {typeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [value.toLocaleString() + ' คน', 'จำนวน']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs mt-2 text-slate-600">
          {typeData.map((t) => (
            <div key={t.name} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }}></span>
              <span>{t.name}: <strong>{t.value.toLocaleString()}</strong></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
