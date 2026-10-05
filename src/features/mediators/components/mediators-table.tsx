import React from 'react';
import { MediatorItem } from '../types';
import { User, ShieldCheck, Users, Calendar, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

interface MediatorsTableProps {
  mediators: MediatorItem[];
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (newPage: number) => void;
  loading?: boolean;
}

export function MediatorsTable({ mediators, page, pageSize, total, onPageChange, loading }: MediatorsTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'DUAL':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">2 ประเภท (รัฐ+ปชช.)</span>;
      case 'GOVERNMENT':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">ภาครัฐ</span>;
      case 'PUBLIC':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">ภาคประชาชน</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200">ยังไม่ขึ้นทะเบียน</span>;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="py-3 px-4">ผู้ไกล่เกลี่ย</th>
              <th className="py-3 px-4">ประเภทการขึ้นทะเบียน</th>
              <th className="py-3 px-4">จังหวัดที่สังกัด</th>
              <th className="py-3 px-4">เลขทะเบียน (รัฐ/ปชช.)</th>
              <th className="py-3 px-4">สถานะบัตร</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">กำลังโหลดข้อมูล...</td>
              </tr>
            ) : mediators.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา</td>
              </tr>
            ) : (
              mediators.map((m) => (
                <tr key={m.id || m.key_mediator} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 overflow-hidden shrink-0">
                        {m.photo_url ? (
                          <img src={m.photo_url} alt={m.full_name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{m.full_name}</div>
                        <div className="text-xs text-slate-400 font-mono">
                          ID: {m.key_mediator} • {m.masked_citizen_id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">{getTypeBadge(m.registration_type)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{m.province || 'ไม่ระบุ'}</span>
                      {m.district && <span className="text-xs text-slate-400">({m.district})</span>}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs font-mono text-slate-600">
                    <div>รัฐ: {m.gov_reg_no || '-'}</div>
                    <div>ปชช: {m.public_reg_no || '-'}</div>
                  </td>
                  <td className="py-3 px-4">
                    {m.is_active_overall ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> ใช้งานได้
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> หมดอายุแล้ว
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="py-3 px-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
        <div>แสดง {mediators.length > 0 ? (page - 1) * pageSize + 1 : 0} ถึง {Math.min(page * pageSize, total)} จาก {total.toLocaleString()} รายการ</div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 font-medium text-slate-700">{page} / {totalPages}</span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
