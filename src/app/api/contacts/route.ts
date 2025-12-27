import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');
  const category = searchParams.get('category');
  
  const contacts = await prisma.contact.findMany({
    where: {
      AND: [
        category ? { category } : {},
        search ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phones: { contains: search } },
            { notes: { contains: search, mode: 'insensitive' } },
          ]
        } : {}
      ]
    },
    include: { documents: true },
    orderBy: { name: 'asc' },
  });
  return NextResponse.json(contacts);
}

export async function POST(request: Request) {
  const data = await request.json();
  const contact = await prisma.contact.create({
    data: {
      name: data.name,
      phones: JSON.stringify(data.phones || [data.phone]),
      email: data.email || null,
      category: data.category || 'familia',
      birthday: data.birthday || null,
      address: data.address || null,
      notes: data.notes || null,
    },
    include: { documents: true },
  });
  return NextResponse.json(contact);
}
