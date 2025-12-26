import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');
  
  const clients = await prisma.client.findMany({
    where: search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phones: { contains: search } },
        { notes: { contains: search, mode: 'insensitive' } },
      ]
    } : undefined,
    include: { properties: true },
    orderBy: { name: 'asc' },
  });
  return NextResponse.json(clients);
}

export async function POST(request: Request) {
  const data = await request.json();
  const client = await prisma.client.create({
    data: {
      name: data.name,
      phones: JSON.stringify(data.phones || [data.phone]),
      email: data.email || null,
      notes: data.notes || null,
    },
    include: { properties: true },
  });
  return NextResponse.json(client);
}
