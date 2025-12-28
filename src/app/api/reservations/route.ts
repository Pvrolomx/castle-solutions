import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const propertyId = searchParams.get('propertyId');
  const month = searchParams.get('month'); // "2024-01"
  
  const where: any = {};
  if (propertyId) where.propertyId = propertyId;
  
  if (month) {
    const [year, m] = month.split('-').map(Number);
    const startDate = new Date(year, m - 1, 1);
    const endDate = new Date(year, m, 0, 23, 59, 59);
    where.OR = [
      { checkIn: { gte: startDate, lte: endDate } },
      { checkOut: { gte: startDate, lte: endDate } },
      { AND: [{ checkIn: { lte: startDate } }, { checkOut: { gte: endDate } }] }
    ];
  }
  
  const reservations = await prisma.reservation.findMany({
    where,
    include: { property: true },
    orderBy: { checkIn: 'asc' },
  });
  
  return NextResponse.json(reservations);
}

export async function POST(request: Request) {
  const data = await request.json();
  
  const reservation = await prisma.reservation.create({
    data: {
      propertyId: data.propertyId,
      guestName: data.guestName,
      guestEmail: data.guestEmail || null,
      guestPhone: data.guestPhone || null,
      guestCountry: data.guestCountry || null,
      guestPassport: data.guestPassport || null,
      numGuests: parseInt(data.numGuests) || 1,
      checkIn: new Date(data.checkIn),
      checkOut: new Date(data.checkOut),
      platform: data.platform || 'directo',
      status: data.status || 'confirmada',
      totalAmount: data.totalAmount ? parseFloat(data.totalAmount) : null,
      paidAmount: data.paidAmount ? parseFloat(data.paidAmount) : 0,
      currency: data.currency || 'MXN',
      notes: data.notes || null,
    },
    include: { property: true },
  });
  
  return NextResponse.json(reservation);
}

export async function PUT(request: Request) {
  const data = await request.json();
  
  const reservation = await prisma.reservation.update({
    where: { id: data.id },
    data: {
      guestName: data.guestName,
      guestEmail: data.guestEmail || null,
      guestPhone: data.guestPhone || null,
      guestCountry: data.guestCountry || null,
      guestPassport: data.guestPassport || null,
      numGuests: parseInt(data.numGuests) || 1,
      checkIn: new Date(data.checkIn),
      checkOut: new Date(data.checkOut),
      platform: data.platform,
      status: data.status,
      totalAmount: data.totalAmount ? parseFloat(data.totalAmount) : null,
      paidAmount: data.paidAmount ? parseFloat(data.paidAmount) : 0,
      currency: data.currency,
      notes: data.notes || null,
    },
  });
  
  return NextResponse.json(reservation);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  
  await prisma.reservation.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
