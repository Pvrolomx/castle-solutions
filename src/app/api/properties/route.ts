import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');
  
  const properties = await prisma.property.findMany({
    where: search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
        { condoName: { contains: search, mode: 'insensitive' } },
        { condoAdminName: { contains: search, mode: 'insensitive' } },
        { client: { name: { contains: search, mode: 'insensitive' } } },
      ]
    } : undefined,
    include: { client: true },
    orderBy: { name: 'asc' },
  });
  return NextResponse.json(properties);
}

export async function POST(request: Request) {
  const data = await request.json();
  const property = await prisma.property.create({
    data: {
      name: data.name,
      address: data.address,
      clientId: data.clientId,
      propertyType: data.propertyType || 'casa',
      regime: data.regime || 'independiente',
      condoName: data.condoName || null,
      condoAdminName: data.condoAdminName || null,
      condoAdminPhone: data.condoAdminPhone || null,
      condoFee: data.condoFee || null,
      notes: data.notes || null,
    },
    include: { client: true },
  });
  return NextResponse.json(property);
}


export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  await prisma.property.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
