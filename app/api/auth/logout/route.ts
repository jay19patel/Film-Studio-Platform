import { NextResponse } from 'next/server';
import { removeAdminSession } from '@/lib/auth';

export async function POST() {
  await removeAdminSession();
  return NextResponse.json({ success: true });
}
