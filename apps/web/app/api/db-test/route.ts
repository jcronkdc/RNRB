import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET() {
  const url =
    process.env.NEON_DATABASE_URL_UNPOOLED ||
    process.env.NEON_DATABASE_URL ||
    process.env.DATABASE_URL ||
    '';

  const host = url ? new URL(url).host : 'NOT_SET';
  const pass = url.slice(url.lastIndexOf(':', url.indexOf('@')) + 1, url.indexOf('@'));
  const sig = pass.length > 6 ? `${pass.slice(0, 4)}...${pass.slice(-3)}` : 'N/A';

  try {
    const sql = neon(url);
    const result = await sql.query('SELECT current_database() as db, count(*) as users FROM "User"');
    return NextResponse.json({ ok: true, host, pw: sig, result: result[0] });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, host, pw: sig, error: msg }, { status: 500 });
  }
}
