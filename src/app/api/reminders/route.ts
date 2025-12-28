import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function getNextDueDate(expense: any): Date | null {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  if (!expense.dueDay) return null;
  
  let dueDate = new Date(currentYear, currentMonth, expense.dueDay);
  
  if (dueDate < today) {
    if (expense.periodicity === 'mensual') {
      dueDate = new Date(currentYear, currentMonth + 1, expense.dueDay);
    } else if (expense.periodicity === 'bimestral') {
      dueDate = new Date(currentYear, currentMonth + 2, expense.dueDay);
    } else if (expense.periodicity === 'trimestral') {
      dueDate = new Date(currentYear, currentMonth + 3, expense.dueDay);
    } else if (expense.periodicity === 'semestral') {
      dueDate = new Date(currentYear, currentMonth + 6, expense.dueDay);
    } else if (expense.periodicity === 'anual') {
      dueDate = new Date(currentYear + 1, expense.dueMonth || 0, expense.dueDay);
    }
  }
  
  return dueDate;
}

export async function GET() {
  const expenses = await prisma.expense.findMany({
    include: {
      property: { include: { client: true } },
      payments: { orderBy: { paidDate: 'desc' }, take: 1 }
    }
  });

  const today = new Date();
  const fiveDaysLater = new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000);
  
  const upcomingExpenses = expenses.filter(expense => {
    const dueDate = getNextDueDate(expense);
    if (!dueDate) return false;
    return dueDate >= today && dueDate <= fiveDaysLater;
  });

  const reminders = upcomingExpenses.map(expense => {
    const dueDate = getNextDueDate(expense);
    const daysUntil = dueDate ? Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : 0;
    return {
      id: expense.id,
      type: expense.type,
      name: expense.name,
      amount: expense.amount,
      propertyName: expense.property.name,
      clientName: expense.property.client.name,
      dueDate: dueDate?.toISOString().split('T')[0],
      daysUntil,
    };
  });

  return NextResponse.json({ success: true, count: reminders.length, reminders });
}

export async function POST(request: Request) {
  const { email, phone } = await request.json();
  
  const expenses = await prisma.expense.findMany({
    where: { dueDay: { not: null } },
    include: { property: { include: { client: true } } }
  });

  const today = new Date();
  const fiveDaysLater = new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000);
  
  const upcomingExpenses = expenses.filter(expense => {
    const dueDate = getNextDueDate(expense);
    if (!dueDate) return false;
    return dueDate >= today && dueDate <= fiveDaysLater;
  });

  if (upcomingExpenses.length === 0) {
    return NextResponse.json({ success: true, message: 'No hay gastos próximos a vencer' });
  }

  let message = 'CASTLE Solutions - Recordatorio\n\n';
  message += `${upcomingExpenses.length} gasto(s) próximos:\n\n`;
  
  upcomingExpenses.forEach(expense => {
    const dueDate = getNextDueDate(expense);
    const daysUntil = dueDate ? Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : 0;
    message += `${expense.type.toUpperCase()} - ${expense.property.name}\n`;
    message += `$${expense.amount.toLocaleString()} - Vence: ${dueDate?.toLocaleDateString('es-MX')} (${daysUntil}d)\n\n`;
  });

  const results: any = { email: null, whatsapp: null };

  // Send email if provided
  if (email && process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      const emailHtml = `
        <div style="font-family: Arial; max-width: 600px; margin: 0 auto;">
          <div style="background: #d97706; padding: 20px; text-align: center;">
            <h1 style="color: white;">CASTLE Solutions</h1>
          </div>
          <div style="padding: 20px; background: #f5f5f4;">
            <p><strong>${upcomingExpenses.length}</strong> gasto(s) próximos a vencer:</p>
            ${upcomingExpenses.map(expense => {
              const dueDate = getNextDueDate(expense);
              const daysUntil = dueDate ? Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : 0;
              return `
                <div style="background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #d97706;">
                  <strong>${expense.type.toUpperCase()}</strong> - ${expense.property.name}<br>
                  $${expense.amount.toLocaleString()} - Vence: ${dueDate?.toLocaleDateString('es-MX')} (${daysUntil}d)
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;

      await resend.emails.send({
        from: 'Castle Solutions <onboarding@resend.dev>',
        to: email,
        subject: `${upcomingExpenses.length} gasto(s) próximos a vencer`,
        html: emailHtml,
      });
      results.email = 'sent';
    } catch (error) {
      console.error('Email error:', error);
      results.email = 'error';
    }
  }

  if (phone) {
    const cleanPhone = phone.replace(/\D/g, '');
    results.whatsapp = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  }

  return NextResponse.json({ success: true, results, message });
}
