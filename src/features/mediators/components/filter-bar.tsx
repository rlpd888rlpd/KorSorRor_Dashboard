import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';
import { MediatorFilters } from '../types';

interface FilterBarProps {
  filters: MediatorFilters;
  provinces: string[];
  onFilterChange: (filters: MediatorFilters) => void;
  onReset: () => void;
  totalResults: number;
}

export function FilterBar({ filters, provinces, onFilterChange, onReset, totalResults }: FilterBarProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่อ, สกุล, รหัส ผกก., จังหวัด..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value, page: 1 })}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
          />
        </div>

        {/* Province Filter */}
        <div>
          <select
            value={filters.province || 'ALL'}
            onChange={(e) => onFilterChange({ ...filters, province: e.target.value, page: 1 })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white"
          >
            <option value="ALL">ทุกจังหวัด ({provinces.length} จังหวัด)</option>
            {provinces.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div>
          <select
            value={filters.type || 'ALL'}
            onChange={(e) => onFilterChange({ ...filters, type: e.target.value, page: 1 })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white"
          >
            <option value="ALL">ทุกประเภทการขึ้นทะเบียน</option>
            <option value="DUAL">ขึ้นทะเบียนทั้ง 2 ประเภท (รัฐ + ปชช.)</option>
            <option value="GOVERNMENT">เฉพาะภาครัฐ</option>
            <option value="PUBLIC">เฉพาะภาคประชาชน</option>
            <option value="UNREGISTERED">ยังไม่ขึ้นทะเบียน</option>
          </select>
        </div>

        {/* Status Filter & Action Buttons */}
        <div className="flex items-center gap-2">
          <select
            value={filters.status || 'ALL'}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value, page: 1 })}
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white"
          >
            <option value="ALL">สถานะทั้งหมด</option>
            <option value="ACTIVE">มีผลใช้งาน (Active)</option>
            <option value="INACTIVE">หมดอายุแล้ว (Expired)</option>
          </select>

          <button
            onClick={onReset}
            title="ล้างตัวกรอง"
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span>พบผลลัพธ์ทั้งหมด <strong>{totalResults.toLocaleString()}</strong> รายการ</span>
        </div>
        <span>หน้า {filters.page || 1} จาก {Math.max(1, Math.ceil(totalResults / (filters.pageSize || 15)))}</span>
      </div>
    </div>
  );
}
