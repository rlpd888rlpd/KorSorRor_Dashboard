'use client';

import React from 'react';
import { Tent, ExternalLink, CheckCircle, Sparkles, TrendingUp, ShieldCheck, DollarSign } from 'lucide-react';

export function ExpoTabView() {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-sky-900 to-slate-900 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sky-200 text-xs font-medium mb-3 backdrop-blur-sm border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>โมดูลสถิติมหกรรมไกล่เกลี่ยข้อพิพาท</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">
            ศูนย์ติดตามสถิติมหกรรมไกล่เกลี่ยทั่วประเทศ (Mediation Expo Intelligence)
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            ระบบติดตามผลการจัดมหกรรมไกล่เกลี่ยข้อพิพาทและหนี้สินครัวเรือนทั่วประเทศ กรมคุ้มครองสิทธิและเสรีภาพ กระทรวงยุติธรรม
          </p>
        </div>
      </div>

      {/* Integration Status Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                ระบบสถิติมหกรรมไกล่เกลี่ยพร้อมสำหรับการเชื่อมต่อ
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                แถบสถิติได้รับการจัดเตรียมโครงสร้างเรียบร้อยแล้ว พร้อมรองรับการเชื่อมโยงข้อมูล (Data Link / Embed View) ในขั้นตอนถัดไป
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            ระบบพร้อมเชื่อมต่อ
          </span>
        </div>

        {/* Dimension Indicators Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-sky-700 font-semibold text-xs mb-1">
              <TrendingUp className="w-4 h-4" /> สถิติผลการไกล่เกลี่ย
            </div>
            <p className="text-xs text-slate-500">
              จำนวนเรื่องที่เข้าสู่กระบวนการ, อัตราความสำเร็จ (%) และผู้เข้าร่วมมหกรรมรายภูมิภาค
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-indigo-700 font-semibold text-xs mb-1">
              <DollarSign className="w-4 h-4" /> มูลค่าทุนทรัพย์ระงับข้อพิพาท
            </div>
            <p className="text-xs text-slate-500">
              ยอดทุนทรัพย์ที่ไกล่เกลี่ยสำเร็จ การลดภาระหนี้สินให้ประชาชน (กองทุน กยศ., สถาบันการเงิน)
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-emerald-700 font-semibold text-xs mb-1">
              <ShieldCheck className="w-4 h-4" /> 100% PDPA Compliance
            </div>
            <p className="text-xs text-slate-500">
              แสดงผลเฉพาะสถิติเชิงปริมาณ แนวโน้ม และสัดส่วน ปราศจากข้อมูลส่วนบุคคลสู่สาธารณะ
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
