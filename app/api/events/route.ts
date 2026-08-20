import { NextResponse } from 'next/server';
import { getEvents } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const events = await getEvents();
  return NextResponse.json(events);
}
