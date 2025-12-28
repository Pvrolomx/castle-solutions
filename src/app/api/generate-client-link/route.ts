import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const { clientId } = await request.json();
  
  if (!clientId) {
    return NextResponse.json({ error: 'clientId required' }, { status: 400 });
  }
  
  // Generate unique token
  const token = randomBytes(32).toString('hex');
  
  // Update client with token
  const client = await prisma.client.update({
    where: { id: clientId },
    data: { accessToken: token },
  });
  
  const baseUrl = process.env.NEXTAUTH_URL || 'https://castle-solutions.vercel.app';
  const portalUrl = `${baseUrl}/cliente/${token}`;
  
  return NextResponse.json({ 
    success: true, 
    token,
    url: portalUrl,
  });
}
