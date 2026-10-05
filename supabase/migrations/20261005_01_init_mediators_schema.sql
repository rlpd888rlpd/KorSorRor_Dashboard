-- ==============================================================================
-- Migration: 20261005_01_init_mediators_schema.sql
-- Description: Schema for Mediators Module (Master, Gov Registry, Public Registry)
-- Department: Mediation Promotion Division (กสร.), Rights & Liberties Protection Dept.
-- ==============================================================================

-- 1. Create mediators table (Master)
CREATE TABLE IF NOT EXISTS public.mediators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_mediator TEXT UNIQUE NOT NULL, -- key_ผกก. (Primary Key from Google Sheet)
    citizen_id TEXT,                  -- เลขบัตรประชาชน (Protected by PDPA)
    title TEXT,                       -- คำนำหน้า
    first_name TEXT NOT NULL,         -- ชื่อ
    last_name TEXT NOT NULL,          -- สกุล
    gender TEXT,                      -- เพศ (ชาย / หญิง / อื่นๆ)
    phone TEXT,                       -- เบอร์โทรศัพท์
    email TEXT,                       -- อีเมล์
    line_id TEXT,                     -- ไลน์ไอดี
    photo_path TEXT,                  -- รูป_ผกก.
    photo_url TEXT,                   -- link_รูป
    address_no TEXT,                  -- เลขที่
    moo TEXT,                         -- หมู่
    address_detail TEXT,              -- อาคาร,สถานที่,ถนน,ซอย
    province TEXT,                    -- จังหวัด
    district TEXT,                    -- อำเภอ
    subdistrict TEXT,                 -- ตำบล
    postal_code TEXT,                 -- รหัสไปรษณีย์
    social_position TEXT,             -- ตำแหน่งทางสังคม
    mediation_experience TEXT,        -- ประสบการณ์ด้านการไกล่เกลี่ย
    bank_name TEXT,                   -- ธนาคาร
    bank_account_no TEXT,             -- เลขบัญชี
    remarks TEXT,                     -- บันทึกข้อความ
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for fast query on Master
CREATE INDEX IF NOT EXISTS idx_mediators_key ON public.mediators(key_mediator);
CREATE INDEX IF NOT EXISTS idx_mediators_province ON public.mediators(province);
CREATE INDEX IF NOT EXISTS idx_mediators_gender ON public.mediators(gender);
CREATE INDEX IF NOT EXISTS idx_mediators_name ON public.mediators(first_name, last_name);

-- 2. Create mediator_gov_registrations table (ทะเบียนรัฐ)
CREATE TABLE IF NOT EXISTS public.mediator_gov_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_gov TEXT UNIQUE NOT NULL,     -- key_ทะเบียนรัฐ
    key_mediator TEXT NOT NULL REFERENCES public.mediators(key_mediator) ON DELETE CASCADE,
    status TEXT,                      -- สถานะทะเบียนรัฐ
    action TEXT,                      -- action
    batch_no TEXT,                    -- ครั้งที่รัฐ.
    batch_year TEXT,                  -- ปีครั้งรัฐ
    order_no TEXT,                    -- คำสั่งทะเบียนรัฐ
    order_year TEXT,                  -- ปีคำสั่งทะเบียนรัฐ
    order_date_raw TEXT,              -- คำสั่งทะเบียนรัฐออกเมื่อ (Raw string)
    order_date DATE,                  -- วันที่ออกคำสั่ง (Parsed)
    account_order_no TEXT,            -- คำสั่งบัญชีรัฐ
    account_order_year TEXT,          -- ปีคำสั่งบัญชีรัฐ
    account_order_date_raw TEXT,      -- คำสั่งบัญชีรัฐออกเมื่อ
    registration_no TEXT,             -- เลขทะเบียนผกก.รัฐ
    registration_year TEXT,           -- ปีทะเบียนผกก.รัฐ
    effective_date_raw TEXT,          -- มีผลรัฐ (Raw string)
    effective_date DATE,              -- วันที่มีผล (Parsed)
    expiration_date_raw TEXT,         -- หมดอายุรัฐ (Raw string)
    expiration_date DATE,             -- วันที่หมดอายุ (Parsed)
    work_status TEXT,                 -- การปฏิบัติงานรัฐ
    agency_1 TEXT,                    -- หน่วยงานรัฐ1
    agency_2 TEXT,                    -- หน่วยงานรัฐ2
    agency_3 TEXT,                    -- หน่วยงานรัฐ3
    agency_4 TEXT,                    -- หน่วยงานรัฐ4
    remarks TEXT,                     -- บันทึกข้อความ
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_gov_key_mediator ON public.mediator_gov_registrations(key_mediator);
CREATE INDEX IF NOT EXISTS idx_gov_expiration_date ON public.mediator_gov_registrations(expiration_date);
CREATE INDEX IF NOT EXISTS idx_gov_status ON public.mediator_gov_registrations(status);

-- 3. Create mediator_public_registrations table (ทะเบียนปชช.)
CREATE TABLE IF NOT EXISTS public.mediator_public_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_public TEXT UNIQUE NOT NULL,  -- key_ทะเบียนปชช.
    key_mediator TEXT NOT NULL REFERENCES public.mediators(key_mediator) ON DELETE CASCADE,
    status TEXT,                      -- สถานะทะเบียนปชช.
    action TEXT,                      -- action
    batch_no TEXT,                    -- ครั้งที่ปชช.
    batch_year TEXT,                  -- ปีครั้งปชช.
    order_no TEXT,                    -- คำสั่งทะเบียนปชช.
    order_year TEXT,                  -- ปีคำสั่งทะเบียนปชช.
    order_date_raw TEXT,              -- คำสั่งทะเบียนปชช.ออกเมื่อ
    order_date DATE,
    account_order_no TEXT,            -- คำสั่งบัญชีปชช.
    account_order_year TEXT,          -- ปีคำสั่งบัญชีปชช.
    account_order_date_raw TEXT,      -- คำสั่งบัญชีปชช.ออกเมื่อ
    registration_no TEXT,             -- เลขทะเบียนผกก.ปชช.
    registration_year TEXT,           -- ปีทะเบียนผกก.ปชช.
    effective_date_raw TEXT,          -- มีผลปชช.
    effective_date DATE,
    expiration_date_raw TEXT,         -- หมดอายุปชช.
    expiration_date DATE,
    work_status TEXT,                 -- การปฏิบัติงานปชช.
    province_1 TEXT,                  -- จังหวัดปชช.1
    district_1 TEXT,                  -- อำเภอปชช.1
    province_2 TEXT,                  -- จังหวัดปชช.2
    district_2 TEXT,                  -- อำเภอปชช.2
    province_3 TEXT,                  -- จังหวัดปชช.3
    district_3 TEXT,                  -- อำเภอปชช.3
    remarks TEXT,                     -- บันทึกข้อความ
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_public_key_mediator ON public.mediator_public_registrations(key_mediator);
CREATE INDEX IF NOT EXISTS idx_public_expiration_date ON public.mediator_public_registrations(expiration_date);
CREATE INDEX IF NOT EXISTS idx_public_province_1 ON public.mediator_public_registrations(province_1);

-- 4. Create View for Dashboard & Analytics (with PDPA Masking)
CREATE OR REPLACE VIEW public.v_mediators_dashboard AS
SELECT 
    m.id,
    m.key_mediator,
    m.title,
    m.first_name,
    m.last_name,
    (m.title || ' ' || m.first_name || ' ' || m.last_name) AS full_name,
    m.gender,
    m.phone,
    m.email,
    m.photo_url,
    m.province,
    m.district,
    m.subdistrict,
    m.social_position,
    m.mediation_experience,
    -- PDPA Masked Citizen ID: e.g. 1-XXXX-XXXXX-99
    CASE 
        WHEN length(m.citizen_id) >= 13 THEN 
            substr(m.citizen_id, 1, 1) || '-XXXX-XXXXX-' || substr(m.citizen_id, 12, 2)
        WHEN length(m.citizen_id) > 4 THEN 
            substr(m.citizen_id, 1, 2) || '****' || substr(m.citizen_id, length(m.citizen_id)-1, 2)
        ELSE '***'
    END AS masked_citizen_id,
    
    -- Registration Type Classification
    CASE 
        WHEN g.key_gov IS NOT NULL AND p.key_public IS NOT NULL THEN 'DUAL'
        WHEN g.key_gov IS NOT NULL THEN 'GOVERNMENT'
        WHEN p.key_public IS NOT NULL THEN 'PUBLIC'
        ELSE 'UNREGISTERED'
    END AS registration_type,
    
    -- Government Registration Summary
    g.key_gov,
    g.status AS gov_status,
    g.registration_no AS gov_reg_no,
    g.effective_date AS gov_effective_date,
    g.expiration_date AS gov_expiration_date,
    g.agency_1 AS gov_agency_1,
    g.agency_2 AS gov_agency_2,
    (g.expiration_date IS NOT NULL AND g.expiration_date >= CURRENT_DATE) AS is_gov_active,
    
    -- Public Registration Summary
    p.key_public,
    p.status AS public_status,
    p.registration_no AS public_reg_no,
    p.effective_date AS public_effective_date,
    p.expiration_date AS public_expiration_date,
    p.province_1 AS public_province_1,
    p.district_1 AS public_district_1,
    (p.expiration_date IS NOT NULL AND p.expiration_date >= CURRENT_DATE) AS is_public_active,
    
    -- Overall Active Status
    (
        (g.expiration_date IS NOT NULL AND g.expiration_date >= CURRENT_DATE)
        OR
        (p.expiration_date IS NOT NULL AND p.expiration_date >= CURRENT_DATE)
    ) AS is_active_overall

FROM public.mediators m
LEFT JOIN LATERAL (
    SELECT * FROM public.mediator_gov_registrations 
    WHERE key_mediator = m.key_mediator 
    ORDER BY COALESCE(expiration_date, '1900-01-01'::DATE) DESC, created_at DESC 
    LIMIT 1
) g ON TRUE
LEFT JOIN LATERAL (
    SELECT * FROM public.mediator_public_registrations 
    WHERE key_mediator = m.key_mediator 
    ORDER BY COALESCE(expiration_date, '1900-01-01'::DATE) DESC, created_at DESC 
    LIMIT 1
) p ON TRUE;

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.mediators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mediator_gov_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mediator_public_registrations ENABLE ROW LEVEL SECURITY;

-- Default Policies (Allow read to public/anon for dashboard view)
CREATE POLICY "Allow public read mediators" ON public.mediators FOR SELECT USING (true);
CREATE POLICY "Allow public read gov_registrations" ON public.mediator_gov_registrations FOR SELECT USING (true);
CREATE POLICY "Allow public read public_registrations" ON public.mediator_public_registrations FOR SELECT USING (true);

-- Allow upsert for sync (anon or service_role)
CREATE POLICY "Allow sync insert mediators" ON public.mediators FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow sync update mediators" ON public.mediators FOR UPDATE USING (true);
CREATE POLICY "Allow sync insert gov_registrations" ON public.mediator_gov_registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow sync update gov_registrations" ON public.mediator_gov_registrations FOR UPDATE USING (true);
CREATE POLICY "Allow sync insert public_registrations" ON public.mediator_public_registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow sync update public_registrations" ON public.mediator_public_registrations FOR UPDATE USING (true);
