# ระบบติดตามสถิติและฐานข้อมูลผู้ไกล่เกลี่ยข้อพิพาท (KorSorRor Dashboard)

ระบบติดตามสถิติและฐานข้อมูลผู้ไกล่เกลี่ย กองส่งเสริมการระงับข้อพิพาท กรมคุ้มครองสิทธิและเสรีภาพ กระทรวงยุติธรรม
พัฒนาตามพระราชบัญญัติการไกล่เกลี่ยข้อพิพาท พ.ศ. 2562

---

## 🛠️ สแต็กเทคโนโลยี (Tech Stack)

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide React, Recharts
- **Backend & Database:** Supabase (PostgreSQL, Row Level Security, Automated View Calculation)
- **Deployment & Hosting:** Vercel (CI/CD ผ่าน GitHub)
- **Data Integration:** Google Sheets API via Google Service Account

---

## 🚀 ฟีเจอร์หลักในระบบ (Core Features)

1. **Executive KPI Cards:**
   - ยอดรวมผู้ไกล่เกลี่ยสะสมทั่วประเทศ (~7,964 คน)
   - สัดส่วนการขึ้นทะเบียน: ทั้ง 2 ประเภท (ภาครัฐ + ภาคประชาชน), เฉพาะภาคประชาชน, เฉพาะภาครัฐ
   - สถานะมีผลใช้งาน (Active) vs หมดอายุแล้ว (Expired)
2. **Interactive Visual Charts:**
   - Donut Chart สัดส่วนประเภทการขึ้นทะเบียน
   - Horizontal Bar Chart สัดส่วนสถานะบัตรผู้ไกล่เกลี่ย
3. **Advanced Directory & Filter:**
   - ค้นหารายชื่อ, รหัส ผกก., หรือจังหวัดแบบ Real-time
   - กรองรายจังหวัด (77 จังหวัดทั่วประเทศ)
   - กรองตามประเภทการขึ้นทะเบียนและสถานะบัตร
   - แสดงข้อมูลแบบมาสก์เลขบัตรประชาชนตามมาตรฐาน PDPA
4. **Data Sync Engine:**
   - สคริปต์ดึงและซิงค์ข้อมูลจาก Google Sheets ต้นทางเข้า Supabase อัตโนมัติ (`npm run sync:data`)

---

## 📦 การติดตั้งและรันในเครื่อง (Local Development)

```bash
# 1. ติดตั้ง Dependencies
npm install

# 2. ตั้งค่าตัวแปรใน .env.local
cp .env.example .env.local
# ใส่ค่า NEXT_PUBLIC_SUPABASE_URL และ NEXT_PUBLIC_SUPABASE_ANON_KEY

# 3. รัน Development Server
npm run dev
```

เปิดเบราว์เซอร์ไปที่ [http://localhost:3000](http://localhost:3000)

---

## 🔄 การซิงค์ข้อมูลจาก Google Sheets

```bash
npm run sync:data
```
