import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface ServiceAccountCreds {
  client_email: string;
  private_key: string;
}

export function getServiceAccountCreds(): ServiceAccountCreds {
  // 1. Check environment variable (Vercel production)
  if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    try {
      let raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY.trim();
      if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
        raw = raw.slice(1, -1);
      }
      const jsonStr = raw.startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8');
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error('Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY env:', e);
    }
  }

  // 2. Check local credentials file (Development / Node)
  const credPath = path.join(process.cwd(), 'google-credentials.json');
  if (fs.existsSync(credPath)) {
    return JSON.parse(fs.readFileSync(credPath, 'utf8'));
  }

  throw new Error('Google Service Account credentials not found in env or local file.');
}

export async function getGoogleAccessToken(): Promise<string> {
  const creds = getServiceAccountCreds();
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: creds.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const b64 = (s: string | Buffer) =>
    (Buffer.isBuffer(s) ? s : Buffer.from(s))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

  const unsigned = `${b64(JSON.stringify(header))}.${b64(JSON.stringify(claim))}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsigned);
  signer.end();
  const signature = signer.sign(creds.private_key);
  const jwt = `${unsigned}.${b64(signature)}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Google OAuth error: ${res.status} ${txt}`);
  }

  const data = await res.json();
  return data.access_token;
}
