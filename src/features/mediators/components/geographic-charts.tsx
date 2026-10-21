'use client';

import React from 'react';
import { ProvinceStatItem, RegionStatItem } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { MapPin, Globe } from 'lucide-react';

interface GeographicChartsProps {
  topProvinces: ProvinceStatItem[];
  regionalStats: RegionStatItem[];
}

export function GeographicCharts({ topProvinces, regionalStats }: GeographicChartsProps) {
  const REGION_COLORS = ['#0284c7', '#0d9488', '#8b5cf6', '#f59e0b', '#ec4899', '#64748b', '#94a3b8'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
      {/* Chart 1: Top 10 Provinces */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sky-50 text-sky-700">
              <MapPin className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">10 จังหวัดที่มีผู้ไกล่เกลี่ยสูงสุด</h3>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">ความหนาแน่นรายพื้นที่</span>
        </div>
        <p className="text-xs text-slate-500 mb-4">แสดงจำนวนผู้ไกล่เกลี่ยสะสมในจังหวัดที่มีความพร้อมสูงสุด</p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topProvinces} layout="vertical" margin={{ left: 15, right: 30, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" fontSize={11} stroke="#94a3b8" />
              <YAxis type="category" dataKey="province" fontSize={11} stroke="#94a3b8" width={90} />
              <Tooltip formatter={(val: number) => [val.toLocaleString() + ' คน', 'ผู้ไกล่เกลี่ย']} />
              <Bar dataKey="total" fill="#0284c7" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Regional Distribution */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <Globe className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">การกระจายตัวตามภูมิภาค 6 ภาค</h3>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">ทั่วประเทศ</span>
        </div>
        <p className="text-xs text-slate-500 mb-4">สัดส่วนผู้ไกล่เกลี่ยจำแนกตามกลุ่มภาค</p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={regionalStats} margin={{ left: -15, right: 10, top: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="region" fontSize={11} stroke="#94a3b8" />
              <YAxis fontSize={11} stroke="#94a3b8" />
              <Tooltip formatter={(val: number) => [val.toLocaleString() + ' คน', 'ผู้ไกล่เกลี่ย']} />
              <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                {regionalStats.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={REGION_COLORS[index % REGION_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
