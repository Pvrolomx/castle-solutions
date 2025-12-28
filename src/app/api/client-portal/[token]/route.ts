import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  const { token } = params;
  
  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 400 });
  }
  
  // Find client by token
  const client = await prisma.client.findUnique({
    where: { accessToken: token },
    include: {
      properties: {
        include: {
          expenses: {
            include: { payments: true }
          },
          reservations: true,
        }
      }
    }
  });
  
  if (!client) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 404 });
  }
  
  return NextResponse.json(client);
}
