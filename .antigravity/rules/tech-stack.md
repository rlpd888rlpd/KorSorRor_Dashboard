# Tech Stack & Architecture Guidelines

เอกสารนี้กำหนดมาตรฐานการเลือกใช้เครื่องมือ สถาปัตยกรรมระบบ และมาตรการความปลอดภัยสำหรับโปรเจกต์

---

## 1. Database & Backend: Supabase
ระบบฐานข้อมูลและการประมวลผลฝั่ง Backend ใช้ **Supabase (PostgreSQL)** เป็นหลัก

- **Schema Design First:**
  - ออกแบบ Table Schema, Primary Key, Foreign Key และ Indexes ให้ชัดเจนก่อนเริ่มเขียนโค้ด Application
  - ใช้ Snake_case สำหรับชื่อตารางและคอลัมน์ในฐานข้อมูล (Postgres Best Practice)
- **Mandatory Row Level Security (RLS):**
  - **ห้ามเปิด Public Access เด็ดขาด:** ทุก Table ที่สร้างขึ้นต้องเปิดใช้งาน RLS ทันที (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`)
  - กำหนด RLS Policies แยกตาม Operation (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) อย่างรัดกุมตามสิทธิ์ของผู้ใช้งาน (`auth.uid()`, Role-based)
- **Database Functions & Triggers:**
  - จัดการ Logic ที่ต้องการความถูกต้องแม่นยำสูง (Atomic Transaction, Data Validation, Timestamp Auto-update, Audit Log) ด้วย PostgreSQL Functions และ Triggers
- **Supabase Storage:**
  - แยก Bucket จัดเก็บไฟล์ให้ชัดเจน (Public vs Private) และกำหนด Storage RLS Policies กำกับทุก Bucket

---

## 2. Hosting & CI/CD: Vercel + GitHub
- **Deployment & Hosting:**
  - ใช้ **Vercel** เป็นแพลตฟอร์มหลัก รองรับ Preview Deployments อัตโนมัติเมื่อสร้าง Pull Request
  - จัดการ Environment Variables ผ่าน Vercel Project Settings สำหรับ Environment แต่ละระดับ (Production, Preview, Development)
- **Git Branching Strategy:**
  - `main`: Production-ready code เท่านั้น
  - `develop`: Staging / Integration branch สำหรับรวมฟีเจอร์ก่อนขึ้นจริง
  - `feature/<feature-name>`: พัฒนาฟีเจอร์ใหม่
  - `fix/<issue-name>`: แก้ไข Bug หรือ Incident
- **Conventional Commits:**
  - ทุก Commit Message ต้องสื่อความหมายและขึ้นต้นด้วย Prefix มาตรฐาน:
    - `feat:` เพิ่มฟังก์ชันหรือฟีเจอร์ใหม่
    - `fix:` แก้ไข Bug
    - `refactor:` ปรับโครงสร้างโค้ดโดยไม่เปลี่ยนพฤติกรรมภายนอก
    - `perf:` ปรับปรุงประสิทธิภาพ
    - `chore:` อัปเดตการตั้งค่า, Dependency, หรือ Tooling
    - `docs:` ปรับปรุงเอกสาร

---

## 3. Frontend & UI: Tailwind CSS + shadcn/ui
- **Pre-built UI Primitives:**
  - ใช้ **Tailwind CSS** ร่วมกับ Component Library สำเร็จรูป เช่น **shadcn/ui** (Radix UI primitives)
  - ลดภาระงานดีไซน์ตั้งแต่เริ่มต้น ไม่เขียน Custom CSS ซ้ำซ้อนหาก Tailwind Class รองรับ
- **Design Philosophy:**
  - เน้นความเรียบง่าย สะอาดตา (Minimalist & Modern UX)
  - **Responsive First:** รองรับการแสดงผลทุกขนาดหน้าจอ (Mobile, Tablet, Desktop)
  - สีและ Theme ต้องกำหนดผ่าน Design Tokens ใน `tailwind.config` / CSS Variables
  - รักษา Accessibility (a11y) ตามมาตรฐานพื้นฐาน (Contrast, ARIA, Keyboard Navigation)

---

## 4. Integration & Automation (Data Flow Ecosystem)
- **Webhooks:**
  - รองรับการรับ/ส่งข้อมูลผ่าน Webhooks (เช่น Supabase Database Webhooks, Third-party Event Notifications)
  - ต้องมี Signature Verification หรือ Secret Token ตรวจสอบความถูกต้องของ Request ทุกครั้ง
- **Google Sheets & Google Apps Script (GAS):**
  - รองรับการเชื่อมต่อกับ Google Sheets / GAS ในกรณีที่มี Use Case ด้าน Data Ingestion, Automated Reporting หรือ Manual Data Sync
  - จัดการ Credentials และ API Quotas อย่างปลอดภัยผ่าน Service Accounts

---

## 5. Security & Secret Management (Zero-Leakage Policy)
- **ห้าม Hardcode Secret เด็ดขาด:**
  - ไม่อนุญาตให้เขียน Secret Keys, Service Role Keys, JWT Secret หรือ Database Connection Strings ลงใน Source Code โดยเด็ดขาด
- **Environment Variables Protocol:**
  - จัดเก็บในไฟล์ `.env.local` (Local) และกำหนดค่าใน Vercel Dashboard (Production/Preview)
  - ตรวจสอบไฟล์ `.gitignore` ให้แน่ใจว่าได้ Ignore `.env*` (ยกเว้น `.env.example`)
  - **แยกสิทธิ์อย่างเคร่งครัด:**
    - `NEXT_PUBLIC_*`: เฉพาะ Key ที่ปลอดภัยสำหรับการเผยแพร่สู่เบราว์เซอร์ (เช่น `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
    - **Server-only:** `SUPABASE_SERVICE_ROLE_KEY` หรือ Private API Keys ต้องเรียกใช้เฉพาะใน Server Components, API Routes หรือ Server Actions เท่านั้น
