'use client';

import React from 'react';
import { YearTrendItem, ExpiryForecastItem } from '../types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Legend } from 'recharts';
import { TrendingUp, AlertTriangle } from 'lucide-react';

interface StatsTrendsChartsProps {
  yearTrends: YearTrendItem[];
  expiryForecasts: ExpiryForecastItem[];
}

export function StatsTrendsCharts({ yearTrends, expiryForecasts }: StatsTrendsChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
      {/* Chart 1: Registration Growth Trends */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sky-50 text-sky-700">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">แนวโน้มการขึ้นทะเบียนผู้ไกล่เกลี่ยรายปี</h3>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">พ.ร.บ. 2562</span>
        </div>
        <p className="text-xs text-slate-500 mb-4">แสดงยอดสะสมและจำนวนขึ้นทะเบียนใหม่ตามปีงบประมาณ</p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={yearTrends} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCum" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="year" fontSize={11} stroke="#94a3b8" />
              <YAxis fontSize={11} stroke="#94a3b8" />
              <Tooltip formatter={(value: number, name: string) => [value.toLocaleString() + ' คน', name === 'cumulative' ? 'ยอดสะสม' : 'ขึ้นทะเบียนใหม่']} />
              <Legend formatter={(val) => val === 'cumulative' ? 'ยอดสะสม' : 'ขึ้นทะเบียนใหม่'} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              <Area type="monotone" dataKey="cumulative" stroke="#0284c7" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCum)" />
              <Area type="monotone" dataKey="registrations" stroke="#10b981" strokeWidth={1.5} fill="#10b981" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Expiration Forecast */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">การคาดการณ์การหมดอายุบัตร (Expiry Forecast)</h3>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">วางแผนงบประมาณ</span>
        </div>
        <p className="text-xs text-slate-500 mb-4">จำนวนผู้ไกล่เกลี่ยที่จะครบกำหนดต่ออายุในแต่ละปี (3 ปี/วาระ)</p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={expiryForecasts} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="year" fontSize={11} stroke="#94a3b8" />
              <YAxis fontSize={11} stroke="#94a3b8" />
              <Tooltip formatter={(val: number) => [val.toLocaleString() + ' คน', 'จะหมดอายุ']} />
              <Bar dataKey="expiringCount" name="ผู้ไกล่เกลี่ยที่หมดอายุ" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
