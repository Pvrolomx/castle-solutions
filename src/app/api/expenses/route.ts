import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const propertyId = searchParams.get('propertyId');
  
  const where = propertyId ? { propertyId } : {};
  
  const expenses = await prisma.expense.findMany({
    where,
    include: { 
      property: { include: { client: true } },
      payments: { orderBy: { paidDate: 'desc' }, take: 12 }
    },
    orderBy: { type: 'asc' },
  });
  return NextResponse.json(expenses);
}

export async function POST(request: Request) {
  const data = await request.json();
  const expense = await prisma.expense.create({
    data: {
      propertyId: data.propertyId,
      type: data.type,
      name: data.name || data.type,
      amount: parseFloat(data.amount),
      periodicity: data.periodicity || 'mensual',
      dueDay: data.dueDay ? parseInt(data.dueDay) : null,
      dueMonth: data.dueMonth ? parseInt(data.dueMonth) : null,
      accountNumber: data.accountNumber || null,
      notes: data.notes || null,
    },
    include: { property: true },
  });
  return NextResponse.json(expense);
}

export async function PUT(request: Request) {
  const data = await request.json();
  const expense = await prisma.expense.update({
    where: { id: data.id },
    data: {
      type: data.type,
      name: data.name,
      amount: parseFloat(data.amount),
      periodicity: data.periodicity,
      dueDay: data.dueDay ? parseInt(data.dueDay) : null,
      dueMonth: data.dueMonth ? parseInt(data.dueMonth) : null,
      accountNumber: data.accountNumber || null,
      notes: data.notes || null,
    },
  });
  return NextResponse.json(expense);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  await prisma.expense.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
