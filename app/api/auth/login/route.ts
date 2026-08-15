import { NextResponse } from 'next/server';
import { getAdmin } from '@/lib/db';
import { verifyPassword, signToken, setAdminSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const admin = await getAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: 'No admin user configured' },
        { status: 500 }
      );
    }

    // Verify email and password
    const isEmailMatch = admin.email.toLowerCase() === email.toLowerCase();
    const isPasswordMatch = await verifyPassword(password, admin.passwordHash);

    if (!isEmailMatch || !isPasswordMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create session
    const token = signToken({ email: admin.email });
    await setAdminSession(token);

    return NextResponse.json({ success: true, user: { email: admin.email } });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
