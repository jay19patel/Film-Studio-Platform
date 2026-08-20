import { NextResponse } from 'next/server';
import { signToken, setAdminSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { pin } = await request.json();

    if (!pin) {
      return NextResponse.json(
        { error: 'PIN is required' },
        { status: 400 }
      );
    }

    // Hardcoded PIN for now as requested
    if (pin !== '00000') {
      return NextResponse.json(
        { error: 'Invalid PIN' },
        { status: 401 }
      );
    }

    // Create session (dummy email for admin context)
    const token = signToken({ email: 'admin@cambuddy.com' });
    await setAdminSession(token);

    return NextResponse.json({ success: true, user: { email: 'admin@cambuddy.com' } });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
