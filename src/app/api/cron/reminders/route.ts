import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // This endpoint is called by Vercel Cron daily at 9am
  // It calls the main reminders endpoint
  const baseUrl = process.env.NEXTAUTH_URL || 'https://castle-solutions.vercel.app';
  const notificationEmail = process.env.NOTIFICATION_EMAIL;
  
  if (!notificationEmail) {
    return NextResponse.json({ success: false, error: 'NOTIFICATION_EMAIL not set' });
  }

  try {
    const response = await fetch(`${baseUrl}/api/reminders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: notificationEmail }),
    });
    
    const data = await response.json();
    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    console.error('Cron error:', error);
    return NextResponse.json({ success: false, error: 'Cron failed' });
  }
}
