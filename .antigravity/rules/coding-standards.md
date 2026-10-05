# Coding Standards & File Size Control

เอกสารนี้ระบุกฎมาตรฐานการเขียนโค้ดเพื่อความเสถียร ดูแลง่าย และรักษา Context Window ให้มีประสิทธิภาพสูงสุด (Token Efficiency)

---

## 1. File Size Hard Limit (ควบคุมขนาดไฟล์อย่างเคร่งครัด)
- **กฎ 100–150 บรรทัด:** แต่ละไฟล์ในโปรเจกต์ต้องมีความยาว **ไม่เกิน 100–150 บรรทัดโดยเด็ดขาด**
- **Trigger Refactoring ทันที:** หากไฟล์เริ่มเข้าใกล้ 100 บรรทัด หรือมีความซับซ้อนเพิ่มขึ้น ต้องแตกไฟล์ทันที:
  - แยก UI ชิ้นย่อยออกเป็น **Sub-components**
  - แยก Data Fetching, Form State, และ Complex Logic ออกเป็น **Custom Hooks**
  - แยกการคำนวณ, Data Transform, API Calls ออกเป็น **Service Utilities**

---

## 2. Separation of Concerns (แยกหน้าที่การทำงาน)
ห้ามเขียนโค้ดทุกอย่างกองรวมกันในไฟล์เดียวเด็ดขาด:

| Layer | โฟลเดอร์เป้าหมาย | หน้าที่ความรับผิดชอบ | ข้อห้าม |
| :--- | :--- | :--- | :--- |
| **Presentation** | `components/` | รับ Props แล้วเรนเดอร์ UI JSX และจัดสไตล์ Tailwind | ห้ามเขียน API Fetching หรือ State Logic ก้อนใหญ่ปนใน JSX |
| **State / Orchestration** | `hooks/` | จัดการ State, Side Effects (`useEffect`), Form Logic, และ React Query / SWR | ห้ามเรนเดอร์ HTML/JSX โดยตรง |
| **Data / API Access** | `services/` หรือ `lib/` | ติดต่อ Supabase Client, จัดการ Query/Mutation, Data Transformation | ห้ามผูกติดกับ React Lifecycle หรือ Component State |
| **Types / Contracts** | `types/` | กำหนด TypeScript Interfaces, Types, DTOs, Enums | ห้ามเขียน Implementation Logic |

---

## 3. Clean & Feature-Based Architecture
จัดโครงสร้างโฟลเดอร์แบบ **Feature-based / Modular** เพื่อให้โค้ดที่ทำงานร่วมกันอยู่ใกล้กัน ค้นหาง่าย และจำกัดขอบเขตผลกระทบ:

```text
src/
├── features/
│   └── <feature-name>/            # รวมไฟล์ที่เกี่ยวข้องกับ Feature นั้น
│       ├── components/            # UI components ย่อย (< 100 บรรทัด)
│       ├── hooks/                 # Custom hooks สำหรับ Feature นี้
│       ├── services/              # ฟังก์ชันติดต่อ Supabase / External APIs
│       └── types/                 # Type definitions ประจำ Feature
├── components/ui/                 # Reusable UI primitives (เช่น shadcn/ui)
├── lib/                           # Global utilities, Supabase client initialization
└── types/                         # Global shared types / Database types
```

---

## 4. Type Safety & Error Handling Standards
- **Strict TypeScript (Zero `any`):**
  - ห้ามใช้ `any` พร่ำเพรื่อ หากยังไม่ทราบ Type ให้ใช้ `unknown` ร่วมกับ Type Guard หรือ Zod Schema
  - ใช้ Auto-generated Types จาก Supabase Database (`supabase gen types typescript`) เพื่อ Type-safe ทั่วทั้งแอป
- **Robust Error Handling:**
  - ครอบ Data Fetching และ Mutation ด้วย `try...catch` เสมอในระดับ Service หรือ Hook
  - ใช้ **React Error Boundaries** ป้องกันทั้งหน้าพังเมื่อเกิด Unhandled UI Error
  - แปลง Error เชิงเทคนิคให้เป็น User-friendly Error Messages ที่เข้าใจง่าย ไม่แสดง Raw Stack Trace ให้ผู้ใช้เห็น
- **Defensive Input Validation:**
  - ใช้ Schema Validation (เช่น **Zod**) ตรวจสอบข้อมูลจากฟอร์มและข้อมูลที่รับเข้า API Route ก่อนส่งต่อไปยังฐานข้อมูลเสมอ
