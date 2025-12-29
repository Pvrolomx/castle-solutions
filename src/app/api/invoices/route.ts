import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period');
  const status = searchParams.get('status');
  
  const where: any = {};
  if (period) where.period = period;
  if (status) where.status = status;
  
  const invoices = await prisma.invoice.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
  
  // Get client names
  const clientIds = [...new Set(invoices.map(i => i.clientId))];
  const clients = await prisma.client.findMany({
    where: { id: { in: clientIds } },
    select: { id: true, name: true, email: true },
  });
  
  const clientMap = Object.fromEntries(clients.map(c => [c.id, c]));
  
  const result = invoices.map(inv => ({
    ...inv,
    client: clientMap[inv.clientId],
  }));
  
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const { clientId, period } = await request.json();
  
  if (!clientId || !period) {
    return NextResponse.json({ error: 'clientId and period required' }, { status: 400 });
  }
  
  // Check if invoice already exists
  const existing = await prisma.invoice.findUnique({
    where: { clientId_period: { clientId, period } },
  });
  
  if (existing) {
    return NextResponse.json({ error: 'Invoice already exists for this period' }, { status: 400 });
  }
  
  // Get client with properties
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      properties: {
        include: {
          expenses: true,
          reservations: true,
        }
      }
    }
  });
  
  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }
  
  // Calculate totals for the period
  const [year, month] = period.split('-').map(Number);
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);
  
  let totalIncome = 0;
  let totalExpenses = 0;
  
  for (const property of client.properties) {
    // Income from reservations in this period
    const periodReservations = property.reservations.filter(r => {
      const checkIn = new Date(r.checkIn);
      return checkIn >= startDate && checkIn <= endDate && r.status !== 'cancelada';
    });
    totalIncome += periodReservations.reduce((sum, r) => sum + (r.totalAmount || 0), 0);
    
    // Expenses (prorated monthly)
    for (const exp of property.expenses) {
      const monthMultiplier = exp.periodicity === 'mensual' ? 1 : 
        exp.periodicity === 'bimestral' ? 0.5 : 
        exp.periodicity === 'trimestral' ? 0.33 : 
        exp.periodicity === 'semestral' ? 0.167 :
        exp.periodicity === 'anual' ? 0.083 : 1;
      totalExpenses += exp.amount * monthMultiplier;
    }
  }
  
  // Calculate commission
  let commission = 0;
  if (client.commissionType === 'percentage') {
    commission = totalIncome * (client.commissionRate / 100);
  } else {
    commission = client.commissionRate;
  }
  
  const netAmount = totalIncome - totalExpenses - commission;
  
  // Create invoice
  const invoice = await prisma.invoice.create({
    data: {
      clientId,
      period,
      totalIncome,
      totalExpenses,
      commission,
      netAmount,
      status: 'draft',
    },
  });
  
  return NextResponse.json(invoice);
}

export async function PUT(request: Request) {
  const { id, status, notes } = await request.json();
  
  const data: any = {};
  if (status) {
    data.status = status;
    if (status === 'sent') data.sentAt = new Date();
    if (status === 'paid') data.paidAt = new Date();
  }
  if (notes !== undefined) data.notes = notes;
  
  const invoice = await prisma.invoice.update({
    where: { id },
    data,
  });
  
  return NextResponse.json(invoice);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  
  await prisma.invoice.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
