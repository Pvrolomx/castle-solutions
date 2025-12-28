import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const expenseId = searchParams.get('expenseId');
  const period = searchParams.get('period'); // "2024-01"
  
  const where: any = {};
  if (expenseId) where.expenseId = expenseId;
  if (period) where.period = period;
  
  const payments = await prisma.payment.findMany({
    where,
    include: { expense: { include: { property: true } } },
    orderBy: { paidDate: 'desc' },
  });
  return NextResponse.json(payments);
}

export async function POST(request: Request) {
  const data = await request.json();
  const payment = await prisma.payment.create({
    data: {
      expenseId: data.expenseId,
      amount: parseFloat(data.amount),
      paidDate: new Date(data.paidDate),
      period: data.period,
      notes: data.notes || null,
    },
  });
  return NextResponse.json(payment);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  await prisma.payment.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
