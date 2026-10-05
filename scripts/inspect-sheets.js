const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

const credsPath = path.join(__dirname, '..', 'google-credentials.json');
if (!fs.existsSync(credsPath)) {
  console.error('Error: google-credentials.json not found in project root.');
  process.exit(1);
}

const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));

// Generate JWT for Google OAuth2
function getSignedJwt() {
  const now = Math.floor(Date.now() / 1000);
  const header = {
    alg: 'RS256',
    typ: 'JWT'
  };
  const claim = {
    iss: creds.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };

  const base64UrlEncode = (str) =>
    Buffer.from(str)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

  const unsignedToken = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(claim))}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsignedToken);
  signer.end();
  const signature = signer.sign(creds.private_key);
  return `${unsignedToken}.${base64UrlEncode(signature)}`;
}

function requestPost(urlStr, postData) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function requestGet(urlStr, token) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  console.log('Generating JWT and obtaining access token...');
  const jwt = getSignedJwt();
  const tokenData = await requestPost(
    'https://oauth2.googleapis.com/token',
    `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  );
  const token = tokenData.access_token;
  console.log('Access token obtained successfully!');

  const sheets = [
    {
      role: 'mediators_master',
      name: 'ข้อมูลผู้ไกล่เกลี่ย',
      id: '13Ibc5QlPuhYOwQbWSaKcg-LGGJfR6ti5QUssfoRp_T8',
      gid: 0
    },
    {
      role: 'government_registry',
      name: 'ทะเบียนรัฐ',
      id: '1nG87sI7TXJIuSD3kDsX8dZLAlJh97CYoK1-UVnU1aD4',
      gid: 2091028854
    },
    {
      role: 'public_registry',
      name: 'ทะเบียนปชช',
      id: '1ymV56b-tomPpF6mH0mqKWVGyphmoDzVZC36GPX6nX7A',
      gid: 667840213
    }
  ];

  const results = {};

  for (const s of sheets) {
    console.log(`\nFetching metadata for: ${s.name} (${s.id})...`);
    try {
      const meta = await requestGet(`https://sheets.googleapis.com/v4/spreadsheets/${s.id}?fields=properties.title,sheets.properties`, token);
      console.log(`Title: ${meta.properties.title}`);
      const sheetTabs = meta.sheets.map(sh => ({
        id: sh.properties.sheetId,
        title: sh.properties.title,
        rowCount: sh.properties.gridProperties?.rowCount,
        colCount: sh.properties.gridProperties?.columnCount
      }));
      console.log('Tabs:', sheetTabs);

      // Find the tab matching gid or use first tab
      const targetTab = sheetTabs.find(t => t.id === s.gid) || sheetTabs[0];
      const encodedTabTitle = encodeURIComponent(targetTab.title);
      console.log(`Fetching sample rows for tab: "${targetTab.title}"...`);
      const sampleData = await requestGet(
        `https://sheets.googleapis.com/v4/spreadsheets/${s.id}/values/${encodedTabTitle}!1:5`,
        token
      );

      results[s.role] = {
        meta: meta.properties,
        targetTab,
        allTabs: sheetTabs,
        headers: sampleData.values ? sampleData.values[0] : [],
        sampleRows: sampleData.values ? sampleData.values.slice(1) : []
      };
      console.log(`Headers count: ${results[s.role].headers.length}`);
    } catch (err) {
      console.error(`Error fetching ${s.name}:`, err.message);
      results[s.role] = { error: err.message };
    }
  }

  const outPath = path.join(__dirname, 'inspected_schema.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`\nInspected schema saved to ${outPath}`);
}

main().catch(err => {
  console.error('Execution error:', err);
  process.exit(1);
});
