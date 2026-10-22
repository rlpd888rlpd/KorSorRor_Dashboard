import { NextRequest, NextResponse } from 'next/server';
import { getGoogleAccessToken } from '@/lib/google-sheets/service-account';
import { syncMediatorsTable } from '@/features/sync/services/mediators-step';
import { syncGovRegistrationsTable } from '@/features/sync/services/gov-registrations-step';
import { syncPublicRegistrationsTable } from '@/features/sync/services/public-registrations-step';
import { SyncStepId } from '@/features/sync/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALID_PIN = process.env.ADMIN_SYNC_PIN || '8888';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const body = await req.json();
    const step = body.step as SyncStepId;
    const pin = String(body.pin || '').trim();

    if (pin !== VALID_PIN) {
      return NextResponse.json(
        { success: false, error: 'รหัส Admin PIN ไม่ถูกต้อง' },
        { status: 401 }
      );
    }

    if (!['mediators', 'gov', 'public'].includes(step)) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบขั้นตอนการซิงค์ที่ระบุ' },
        { status: 400 }
      );
    }

    const token = await getGoogleAccessToken();
    let count = 0;
    let label = '';

    if (step === 'mediators') {
      count = await syncMediatorsTable(token);
      label = 'ข้อมูลผู้ไกล่เกลี่ย';
    } else if (step === 'gov') {
      count = await syncGovRegistrationsTable(token);
      label = 'ทะเบียนผู้ไกล่เกลี่ยส่วนราชการ';
    } else if (step === 'public') {
      count = await syncPublicRegistrationsTable(token);
      label = 'ทะเบียนผู้ไกล่เกลี่ยภาคประชาชน';
    }

    const durationMs = Date.now() - startTime;
    return NextResponse.json({
      success: true,
      step,
      count,
      durationMs,
      message: `ซิงค์${label}สำเร็จ เรียบร้อย ${count.toLocaleString('th-TH')} รายการ`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error during sync';
    console.error('Sync route error:', err);
    return NextResponse.json(
      { success: false, error: message, durationMs: Date.now() - startTime },
      { status: 500 }
    );
  }
}
