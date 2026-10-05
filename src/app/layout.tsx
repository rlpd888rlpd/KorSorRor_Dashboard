import type { Metadata } from 'next';
import './globals.css';
import { Scale, Users, GraduationCap, Building2, Wallet } from 'lucide-react';

export const metadata: Metadata = {
  title: 'ระบบติดตามสถิติ | กองส่งเสริมการระงับข้อพิพาท กรมคุ้มครองสิทธิและเสรีภาพ',
  description: 'ระบบติดตามสถิติและฐานข้อมูลผู้ไกล่เกลี่ย กรมคุ้มครองสิทธิและเสรีภาพ กระทรวงยุติธรรม',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className="min-h-screen bg-slate-50/50 flex flex-col antialiased">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-slate-900 leading-tight">
                    กองส่งเสริมการระงับข้อพิพาท
                  </h1>
                  <p className="text-xs text-slate-500">
                    กรมคุ้มครองสิทธิและเสรีภาพ กระทรวงยุติธรรม
                  </p>
                </div>
              </div>

              {/* Navigation Tabs (5 Core Modules) */}
              <nav className="hidden md:flex items-center gap-1">
                <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                  <Users className="w-4 h-4" /> ทะเบียนผู้ไกล่เกลี่ย
                </span>
                <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-600 cursor-not-allowed">
                  <Scale className="w-4 h-4" /> สถิติการไกล่เกลี่ย
                </span>
                <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-600 cursor-not-allowed">
                  <GraduationCap className="w-4 h-4" /> หลักสูตรฝึกอบรม
                </span>
                <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-600 cursor-not-allowed">
                  <Building2 className="w-4 h-4" /> ศูนย์ไกล่เกลี่ยฯ
                </span>
                <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-600 cursor-not-allowed">
                  <Wallet className="w-4 h-4" /> งบประมาณ
                </span>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-400">
            ระบบติดตามสถิติและฐานข้อมูลผู้ไกล่เกลี่ย • กองส่งเสริมการระงับข้อพิพาท กรมคุ้มครองสิทธิและเสรีภาพ
          </div>
        </footer>
      </body>
    </html>
  );
}
