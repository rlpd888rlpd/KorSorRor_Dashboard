'use client';

import React, { useState, useMemo } from 'react';
import { ProvinceStatItem } from '../types';
import { Search, MapPin, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProvincialMatrixTableProps {
  provinces: ProvinceStatItem[];
}

export function ProvincialMatrixTable({ provinces }: ProvincialMatrixTableProps) {
  const [search, setSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const filtered = useMemo(() => {
    return provinces.filter((p) => {
      const matchSearch = p.province.toLowerCase().includes(search.toLowerCase());
      const matchRegion = selectedRegion === 'ALL' || p.region === selectedRegion;
      return matchSearch && matchRegion;
    });
  }, [provinces, search, selectedRegion]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  const regions = ['ALL', 'ภาคกลาง', 'ภาคอีสาน', 'ภาคเหนือ', 'ภาคใต้', 'ภาคตะวันออก', 'ภาคตะวันตก'];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
      {/* Table Header & Filters */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">ตารางสถิติเชิงปริมาณรายจังหวัด (Provincial Statistical Matrix)</h3>
          </div>
          <p className="text-xs text-slate-500">ข้อมูลสถิติรวมระดับพื้นที่ (ไม่มีข้อมูลส่วนบุคคล ตามมาตรฐาน PDPA)</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Region Tabs */}
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 text-xs">
            {regions.map((r) => (
              <button
                key={r}
                onClick={() => { setSelectedRegion(r); setPage(1); }}
                className={`px-2.5 py-1 rounded-md transition-colors ${selectedRegion === r ? 'bg-sky-600 text-white font-medium shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                {r === 'ALL' ? 'ทุกภาค' : r}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาชื่อจังหวัด..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-8 pr-3 py-1 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Table Data */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="py-2.5 px-4 w-12 text-center">#</th>
              <th className="py-2.5 px-4">จังหวัด</th>
              <th className="py-2.5 px-4">ภูมิภาค</th>
              <th className="py-2.5 px-4 text-right">ผู้ไกล่เกลี่ยรวม</th>
              <th className="py-2.5 px-4 text-right">ภาครัฐ</th>
              <th className="py-2.5 px-4 text-right">ภาคประชาชน</th>
              <th className="py-2.5 px-4 text-right">มีผลใช้งาน (Active)</th>
              <th className="py-2.5 px-4 text-center">% ความพร้อม</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">ไม่พบจังหวัดตามเงื่อนไข</td>
              </tr>
            ) : (
              currentItems.map((p, idx) => (
                <tr key={p.province} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-4 text-center text-xs text-slate-400">{(page - 1) * pageSize + idx + 1}</td>
                  <td className="py-2.5 px-4 font-semibold text-slate-900 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{p.province}</span>
                  </td>
                  <td className="py-2.5 px-4 text-xs text-slate-500">{p.region}</td>
                  <td className="py-2.5 px-4 text-right font-bold text-slate-900">{p.total.toLocaleString()}</td>
                  <td className="py-2.5 px-4 text-right text-sky-700 text-xs font-medium">{p.govCount.toLocaleString()}</td>
                  <td className="py-2.5 px-4 text-right text-emerald-700 text-xs font-medium">{p.publicCount.toLocaleString()}</td>
                  <td className="py-2.5 px-4 text-right font-semibold text-slate-800">{p.activeCount.toLocaleString()}</td>
                  <td className="py-2.5 px-4 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${p.activeRate >= 50 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                      {p.activeRate}%
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="py-3 px-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
        <div>แสดง {filtered.length > 0 ? (page - 1) * pageSize + 1 : 0} ถึง {Math.min(page * pageSize, filtered.length)} จาก {filtered.length} จังหวัด</div>
        <div className="flex items-center gap-1">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 font-medium text-slate-700">{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
