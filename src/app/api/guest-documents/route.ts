import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reservationId = searchParams.get('reservationId');
  
  if (!reservationId) {
    return NextResponse.json({ error: 'reservationId required' }, { status: 400 });
  }
  
  const documents = await prisma.guestDocument.findMany({
    where: { reservationId },
    orderBy: { createdAt: 'desc' },
  });
  
  return NextResponse.json(documents);
}

export async function POST(request: Request) {
  const data = await request.json();
  
  const document = await prisma.guestDocument.create({
    data: {
      reservationId: data.reservationId,
      docType: data.docType,
      filename: data.filename,
      url: data.url,
    },
  });
  
  return NextResponse.json(document);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 });
  }
  
  await prisma.guestDocument.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
