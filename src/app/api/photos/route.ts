import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const propertyId = searchParams.get('propertyId');
  
  if (!propertyId) {
    return NextResponse.json({ error: 'propertyId required' }, { status: 400 });
  }
  
  const photos = await prisma.photo.findMany({
    where: { propertyId },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(photos);
}

export async function POST(request: Request) {
  const data = await request.json();
  const photo = await prisma.photo.create({
    data: {
      propertyId: data.propertyId,
      url: data.url,
      caption: data.caption || null,
    },
  });
  return NextResponse.json(photo);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 });
  }
  
  await prisma.photo.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
