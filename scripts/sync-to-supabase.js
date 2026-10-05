/**
 * Data Sync Script: Google Sheets to Supabase
 * Synchronizes:
 *  1. ข้อมูลผู้ไกล่เกลี่ย -> public.mediators
 *  2. ทะเบียนรัฐ       -> public.mediator_gov_registrations
 *  3. ทะเบียนปชช.      -> public.mediator_public_registrations
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://kqwrszghsuqgoqxjieqf.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 
  process.env.SUPABASE_ANON_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtxd3Jzemdoc3VxZ29xeGppZXFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5Nzk0MDMsImV4cCI6MjA5ODU1NTQwM30.cDkzwBwS_A1BSyneqg2nKlTJYlRvzmztyNU5tmGRkYQ';

const credsPath = path.join(__dirname, '..', 'google-credentials.json');
if (!fs.existsSync(credsPath)) {
  console.error('Error: google-credentials.json not found in project root.');
  process.exit(1);
}
const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));

// Thai Month Mapping
const THAI_MONTHS = {
  'ม.ค.': 1, 'มกราคม': 1,
  'ก.พ.': 2, 'กุมภาพันธ์': 2,
  'มี.ค.': 3, 'มีนาคม': 3,
  'เม.ย.': 4, 'เมษายน': 4,
  'พ.ค.': 5, 'พฤษภาคม': 5,
  'มิ.ย.': 6, 'มิถุนายน': 6,
  'ก.ค.': 7, 'กรกฎาคม': 7,
  'ส.ค.': 8, 'สิงหาคม': 8,
  'ก.ย.': 9, 'กันยายน': 9,
  'ต.ค.': 10, 'ตุลาคม': 10,
  'พ.ย.': 11, 'พฤศจิกายน': 11,
  'ธ.ค.': 12, 'ธันวาคม': 12
};

function clampDate(year, month, day) {
  if (month < 1 || month > 12) return null;
  const maxDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const validDay = Math.min(Math.max(1, day), maxDay);
  const mm = String(month).padStart(2, '0');
  const dd = String(validDay).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

function parseThaiDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const clean = dateStr.trim();
  if (!clean || clean === '-' || clean === 'ไม่มี') return null;

  // Pattern: "30 มิ.ย. 66" or "1 ก.ค. 2566" or "30/06/2566"
  const dmyMatch = clean.match(/^(\d{1,2})\s+([ก-๙\.]+)\s+(\d{2,4})$/);
  if (dmyMatch) {
    let day = parseInt(dmyMatch[1], 10);
    const month = THAI_MONTHS[dmyMatch[2]];
    let year = parseInt(dmyMatch[3], 10);

    if (month && day) {
      if (year < 100) year += 2500;
      if (year > 2400) year -= 543; // Convert Buddhist Era to CE
      return clampDate(year, month, day);
    }
  }

  // Slash pattern: DD/MM/YYYY (BE)
  const slashMatch = clean.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (slashMatch) {
    let day = parseInt(slashMatch[1], 10);
    const month = parseInt(slashMatch[2], 10);
    let year = parseInt(slashMatch[3], 10);
    if (year < 100) year += 2500;
    if (year > 2400) year -= 543;
    return clampDate(year, month, day);
  }

  return null;
}

function getSignedJwt() {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: creds.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };
  const b64 = (s) => Buffer.from(s).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const unsigned = `${b64(JSON.stringify(header))}.${b64(JSON.stringify(claim))}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsigned);
  signer.end();
  return `${unsigned}.${b64(signer.sign(creds.private_key))}`;
}

function httpRequest(urlStr, options = {}, postData = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const reqOptions = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    if (postData) {
      reqOptions.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(data ? JSON.parse(data) : null);
          } catch {
            resolve(data);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function fetchSheetData(spreadsheetId, tabName, token) {
  const encodedTab = encodeURIComponent(tabName);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedTab}?valueRenderOption=UNFORMATTED_VALUE`;
  const res = await httpRequest(url, { headers: { Authorization: `Bearer ${token}` } });
  return res.values || [];
}

async function upsertToSupabase(table, records, onConflict = null) {
  if (!records.length) return;
  const conflictParam = onConflict ? `?on_conflict=${onConflict}` : '';
  const url = `${SUPABASE_URL}/rest/v1/${table}${conflictParam}`;
  const headers = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    Prefer: 'resolution=merge-duplicates'
  };

  const BATCH_SIZE = 300;
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    process.stdout.write(`  Upserting ${table} batch ${i + 1} - ${Math.min(i + BATCH_SIZE, records.length)} of ${records.length}...\r`);
    await httpRequest(url, { method: 'POST', headers }, JSON.stringify(batch));
  }
  console.log(`\n  Done upserting ${records.length} rows to ${table}`);
}

async function syncAll() {
  console.log('=== Starting KorSorRor Mediator Data Sync ===');
  console.log('1. Obtaining Google OAuth token...');
  const jwt = getSignedJwt();
  const tokenData = await httpRequest(
    'https://oauth2.googleapis.com/token',
    { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  );
  const token = tokenData.access_token;
  console.log('   Authenticated with Google Cloud!');

  // 1. Sync Mediators Master
  console.log('\n2. Fetching ข้อมูลผู้ไกล่เกลี่ย...');
  const mRows = await fetchSheetData('13Ibc5QlPuhYOwQbWSaKcg-LGGJfR6ti5QUssfoRp_T8', 'ข้อมูลผู้ไกล่เกลี่ย', token);
  const mHeaders = mRows[0].map(h => String(h || '').trim());
  const hMapM = {};
  mHeaders.forEach((h, i) => (hMapM[h] = i));

  const mediatorRecords = [];
  for (let r = 1; r < mRows.length; r++) {
    const row = mRows[r];
    const key = String(row[hMapM['key_ผกก.']] || '').trim();
    if (!key) continue;

    mediatorRecords.push({
      key_mediator: key,
      citizen_id: String(row[hMapM['เลขบัตรประชาชน']] || '').trim() || null,
      title: String(row[hMapM['คำนำหน้า']] || '').trim() || null,
      first_name: String(row[hMapM['ชื่อ']] || '').trim() || '-',
      last_name: String(row[hMapM['สกุล']] || '').trim() || '-',
      gender: String(row[hMapM['เพศ']] || '').trim() || null,
      phone: String(row[hMapM['เบอร์โทรศัพท์']] || '').trim() || null,
      email: String(row[hMapM['อีเมล์']] || '').trim() || null,
      line_id: String(row[hMapM['ไลน์ไอดี']] || '').trim() || null,
      photo_path: String(row[hMapM['รูป_ผกก.']] || '').trim() || null,
      photo_url: String(row[hMapM['link_รูป']] || '').trim() || null,
      address_no: String(row[hMapM['เลขที่']] || '').trim() || null,
      moo: String(row[hMapM['หมู่']] || '').trim() || null,
      address_detail: String(row[hMapM['อาคาร,สถานที่,ถนน,ซอย']] || '').trim() || null,
      province: String(row[hMapM['จังหวัด']] || '').trim() || null,
      district: String(row[hMapM['อำเภอ']] || '').trim() || null,
      subdistrict: String(row[hMapM['ตำบล']] || '').trim() || null,
      postal_code: String(row[hMapM['รหัสไปรษณีย์']] || '').trim() || null,
      social_position: String(row[hMapM['ตำแหน่งทางสังคม']] || '').trim() || null,
      mediation_experience: String(row[hMapM['ประสบการณ์ด้านการไกล่เกลี่ย']] || '').trim() || null,
      bank_name: String(row[hMapM['ธนาคาร']] || '').trim() || null,
      bank_account_no: String(row[hMapM['เลขบัญชี']] || '').trim() || null,
      remarks: String(row[hMapM['บันทึกข้อความ']] || '').trim() || null
    });
  }
  console.log(`   Parsed ${mediatorRecords.length} valid mediator records.`);
  await upsertToSupabase('mediators', mediatorRecords, 'key_mediator');

  // 2. Sync Government Registry
  console.log('\n3. Fetching ทะเบียนรัฐ...');
  const gRows = await fetchSheetData('1nG87sI7TXJIuSD3kDsX8dZLAlJh97CYoK1-UVnU1aD4', 'ทะเบียนรัฐ', token);
  const gHeaders = gRows[0].map(h => String(h || '').trim());
  const hMapG = {};
  gHeaders.forEach((h, i) => (hMapG[h] = i));

  // Set of valid mediator keys to preserve foreign key integrity
  const validKeys = new Set(mediatorRecords.map(m => m.key_mediator));
  const govRecords = [];
  for (let r = 1; r < gRows.length; r++) {
    const row = gRows[r];
    const keyGov = String(row[hMapG['key_ทะเบียนรัฐ']] || '').trim();
    const keyMed = String(row[hMapG['key_ผกก.']] || '').trim();
    if (!keyGov || !keyMed || !validKeys.has(keyMed)) continue;

    const effRaw = String(row[hMapG['มีผลรัฐ']] || '').trim();
    const expRaw = String(row[hMapG['หมดอายุรัฐ']] || '').trim();
    const ordRaw = String(row[hMapG['คำสั่งทะเบียนรัฐออกเมื่อ']] || '').trim();

    govRecords.push({
      key_gov: keyGov,
      key_mediator: keyMed,
      status: String(row[hMapG['สถานะทะเบียนรัฐ']] || '').trim() || null,
      action: String(row[hMapG['action']] || '').trim() || null,
      batch_no: String(row[hMapG['ครั้งที่รัฐ.']] || '').trim() || null,
      batch_year: String(row[hMapG['ปีครั้งรัฐ']] || '').trim() || null,
      order_no: String(row[hMapG['คำสั่งทะเบียนรัฐ']] || '').trim() || null,
      order_year: String(row[hMapG['ปีคำสั่งทะเบียนรัฐ']] || '').trim() || null,
      order_date_raw: ordRaw || null,
      order_date: parseThaiDate(ordRaw),
      account_order_no: String(row[hMapG['คำสั่งบัญชีรัฐ']] || '').trim() || null,
      account_order_year: String(row[hMapG['ปีคำสั่งบัญชีรัฐ']] || '').trim() || null,
      account_order_date_raw: String(row[hMapG['คำสั่งบัญชีรัฐออกเมื่อ']] || '').trim() || null,
      registration_no: String(row[hMapG['เลขทะเบียนผกก.รัฐ']] || '').trim() || null,
      registration_year: String(row[hMapG['ปีทะเบียนผกก.รัฐ']] || '').trim() || null,
      effective_date_raw: effRaw || null,
      effective_date: parseThaiDate(effRaw),
      expiration_date_raw: expRaw || null,
      expiration_date: parseThaiDate(expRaw),
      work_status: String(row[hMapG['การปฏิบัติงานรัฐ']] || '').trim() || null,
      agency_1: String(row[hMapG['หน่วยงานรัฐ1']] || '').trim() || null,
      agency_2: String(row[hMapG['หน่วยงานรัฐ2']] || '').trim() || null,
      agency_3: String(row[hMapG['หน่วยงานรัฐ3']] || '').trim() || null,
      agency_4: String(row[hMapG['หน่วยงานรัฐ4']] || '').trim() || null,
      remarks: String(row[hMapG['บันทึกข้อความ']] || '').trim() || null
    });
  }
  console.log(`   Parsed ${govRecords.length} valid government registry records.`);
  await upsertToSupabase('mediator_gov_registrations', govRecords, 'key_gov');

  // 3. Sync Public Registry
  console.log('\n4. Fetching ทะเบียนปชช....');
  const pRows = await fetchSheetData('1ymV56b-tomPpF6mH0mqKWVGyphmoDzVZC36GPX6nX7A', 'ทะเบียนปชช.', token);
  const pHeaders = pRows[0].map(h => String(h || '').trim());
  const hMapP = {};
  pHeaders.forEach((h, i) => (hMapP[h] = i));

  const pubRecords = [];
  for (let r = 1; r < pRows.length; r++) {
    const row = pRows[r];
    const keyPub = String(row[hMapP['key_ทะเบียนปชช.']] || '').trim();
    const keyMed = String(row[hMapP['key_ผกก.']] || '').trim();
    if (!keyPub || !keyMed || !validKeys.has(keyMed)) continue;

    const effRaw = String(row[hMapP['มีผลปชช.']] || '').trim();
    const expRaw = String(row[hMapP['หมดอายุปชช.']] || '').trim();
    const ordRaw = String(row[hMapP['คำสั่งทะเบียนปชช.ออกเมื่อ']] || '').trim();

    pubRecords.push({
      key_public: keyPub,
      key_mediator: keyMed,
      status: String(row[hMapP['สถานะทะเบียนปชช.']] || '').trim() || null,
      action: String(row[hMapP['action']] || '').trim() || null,
      batch_no: String(row[hMapP['ครั้งที่ปชช.']] || '').trim() || null,
      batch_year: String(row[hMapP['ปีครั้งปชช.']] || '').trim() || null,
      order_no: String(row[hMapP['คำสั่งทะเบียนปชช.']] || '').trim() || null,
      order_year: String(row[hMapP['ปีคำสั่งทะเบียนปชช.']] || '').trim() || null,
      order_date_raw: ordRaw || null,
      order_date: parseThaiDate(ordRaw),
      account_order_no: String(row[hMapP['คำสั่งบัญชีปชช.']] || '').trim() || null,
      account_order_year: String(row[hMapP['ปีคำสั่งบัญชีปชช.']] || '').trim() || null,
      account_order_date_raw: String(row[hMapP['คำสั่งบัญชีปชช.ออกเมื่อ']] || '').trim() || null,
      registration_no: String(row[hMapP['เลขทะเบียนผกก.ปชช.']] || '').trim() || null,
      registration_year: String(row[hMapP['ปีทะเบียนผกก.ปชช.']] || '').trim() || null,
      effective_date_raw: effRaw || null,
      effective_date: parseThaiDate(effRaw),
      expiration_date_raw: expRaw || null,
      expiration_date: parseThaiDate(expRaw),
      work_status: String(row[hMapP['การปฏิบัติงานปชช.']] || '').trim() || null,
      province_1: String(row[hMapP['จังหวัดปชช.1']] || '').trim() || null,
      district_1: String(row[hMapP['อำเภอปชช.1']] || '').trim() || null,
      province_2: String(row[hMapP['จังหวัดปชช.2']] || '').trim() || null,
      district_2: String(row[hMapP['อำเภอปชช.2']] || '').trim() || null,
      province_3: String(row[hMapP['จังหวัดปชช.3']] || '').trim() || null,
      district_3: String(row[hMapP['อำเภอปชช.3']] || '').trim() || null,
      remarks: String(row[hMapP['บันทึกข้อความ']] || '').trim() || null
    });
  }
  console.log(`   Parsed ${pubRecords.length} valid public registry records.`);
  await upsertToSupabase('mediator_public_registrations', pubRecords, 'key_public');

  console.log('\n=== KorSorRor Mediator Data Sync Completed Successfully! ===');
}

syncAll().catch(err => {
  console.error('\nSync Error:', err.message);
  process.exit(1);
});
