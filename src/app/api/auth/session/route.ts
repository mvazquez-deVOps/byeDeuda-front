
import { adminAuth } from '@/lib/admin-firebase';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Create a session cookie on login
export async function POST(request: Request) {
  const { idToken } = await request.json();
  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

  try {
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
    // Set the cookie with path '/' to make it available across the entire application
    cookies().set('__session', sessionCookie, { maxAge: expiresIn, httpOnly: true, secure: true, path: '/' });
    return NextResponse.json({ status: 'success' });
  } catch (error) {
    return NextResponse.json({ status: 'error', message: 'Failed to create session cookie' }, { status: 401 });
  }
}

// Clear the session cookie on logout
export async function DELETE() {
  cookies().delete('__session');
  return NextResponse.json({ status: 'success' });
}
