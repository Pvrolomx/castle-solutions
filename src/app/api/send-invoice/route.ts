import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const { invoiceId } = await request.json();
  
  if (!invoiceId) {
    return NextResponse.json({ error: 'invoiceId required' }, { status: 400 });
  }
  
  // Get invoice
  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  }
  
  // Get client
  const client = await prisma.client.findUnique({
    where: { id: invoice.clientId },
    include: {
      properties: {
        include: {
          expenses: true,
          reservations: true,
        }
      }
    }
  });
  
  if (!client || !client.email) {
    return NextResponse.json({ error: 'Client email not found' }, { status: 400 });
  }
  
  const [year, month] = invoice.period.split('-').map(Number);
  const monthName = new Date(year, month - 1).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
  
  // Build email HTML
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #d97706, #f59e0b); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">CASTLE Solutions</h1>
        <p style="color: white; opacity: 0.9;">Estado de Cuenta</p>
      </div>
      
      <div style="padding: 20px; background: #f5f5f4;">
        <p>Estimado/a <strong>${client.name}</strong>,</p>
        <p>Le compartimos su estado de cuenta correspondiente a <strong>${monthName}</strong>:</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e5e5;">Ingresos por Rentas</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e5e5; text-align: right; color: #16a34a;">+$${invoice.totalIncome.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e5e5;">Gastos de Operación</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e5e5; text-align: right; color: #dc2626;">-$${invoice.totalExpenses.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e5e5;">Comisión de Administración</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e5e5; text-align: right; color: #dc2626;">-$${invoice.commission.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-weight: bold; font-size: 18px;">Monto a Depositar</td>
              <td style="padding: 10px 0; text-align: right; font-weight: bold; font-size: 18px; color: ${invoice.netAmount >= 0 ? '#16a34a' : '#dc2626'};">$${invoice.netAmount.toLocaleString()}</td>
            </tr>
          </table>
        </div>
        
        ${client.properties.length > 0 ? `
        <div style="margin-top: 20px;">
          <p style="font-weight: bold; margin-bottom: 10px;">Desglose por Propiedad:</p>
          ${client.properties.map(prop => {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0, 23, 59, 59);
            const propIncome = prop.reservations
              .filter(r => {
                const checkIn = new Date(r.checkIn);
                return checkIn >= startDate && checkIn <= endDate && r.status !== 'cancelada';
              })
              .reduce((sum, r) => sum + (r.totalAmount || 0), 0);
            const propExpenses = prop.expenses.reduce((sum, e) => {
              const mult = e.periodicity === 'mensual' ? 1 : e.periodicity === 'bimestral' ? 0.5 : e.periodicity === 'trimestral' ? 0.33 : 0.083;
              return sum + (e.amount * mult);
            }, 0);
            return `
              <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #d97706;">
                <strong>${prop.name}</strong><br>
                <span style="font-size: 12px; color: #666;">
                  Ingresos: $${propIncome.toLocaleString()} | Gastos: $${propExpenses.toLocaleString()}
                </span>
              </div>
            `;
          }).join('')}
        </div>
        ` : ''}
        
        <p style="margin-top: 20px; font-size: 12px; color: #666;">
          Este es un correo automático generado por Castle Solutions.<br>
          Si tiene alguna pregunta, no dude en contactarnos.
        </p>
      </div>
    </div>
  `;
  
  // Send email using Resend
  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      await resend.emails.send({
        from: 'Castle Solutions <onboarding@resend.dev>',
        to: client.email,
        subject: `Estado de Cuenta ${monthName} - Castle Solutions`,
        html: emailHtml,
      });
      
      // Update invoice status
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: 'sent', sentAt: new Date() },
      });
      
      return NextResponse.json({ success: true, message: 'Email enviado' });
    } catch (error) {
      console.error('Email error:', error);
      return NextResponse.json({ error: 'Error sending email' }, { status: 500 });
    }
  }
  
  return NextResponse.json({ error: 'Email not configured' }, { status: 500 });
}
