import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const { templateId, reservationId, propertyId, clientId } = await request.json();
  
  if (!templateId) {
    return NextResponse.json({ error: 'templateId required' }, { status: 400 });
  }
  
  // Get template
  const template = await prisma.contractTemplate.findUnique({ where: { id: templateId } });
  if (!template) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  }
  
  // Get data based on what's provided
  let data: Record<string, string> = {};
  const today = new Date();
  data['FECHA_HOY'] = today.toLocaleDateString('es-MX');
  data['FECHA_HOY_LARGO'] = today.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  
  if (reservationId) {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { property: { include: { client: true } } }
    });
    if (reservation) {
      data['HUESPED_NOMBRE'] = reservation.guestName;
      data['HUESPED_EMAIL'] = reservation.guestEmail || '';
      data['HUESPED_TELEFONO'] = reservation.guestPhone || '';
      data['HUESPED_PAIS'] = reservation.guestCountry || '';
      data['HUESPED_PASAPORTE'] = reservation.guestPassport || '';
      data['NUM_HUESPEDES'] = String(reservation.numGuests);
      data['CHECK_IN'] = new Date(reservation.checkIn).toLocaleDateString('es-MX');
      data['CHECK_OUT'] = new Date(reservation.checkOut).toLocaleDateString('es-MX');
      data['MONTO_TOTAL'] = reservation.totalAmount ? `$${reservation.totalAmount.toLocaleString()}` : '';
      data['MONTO_PAGADO'] = reservation.paidAmount ? `$${reservation.paidAmount.toLocaleString()}` : '';
      data['MONEDA'] = reservation.currency;
      data['PLATAFORMA'] = reservation.platform;
      data['NOTAS'] = reservation.notes || '';
      
      // Calculate nights
      const nights = Math.ceil((new Date(reservation.checkOut).getTime() - new Date(reservation.checkIn).getTime()) / (1000 * 60 * 60 * 24));
      data['NOCHES'] = String(nights);
      
      // Property data from reservation
      data['PROPIEDAD_NOMBRE'] = reservation.property.name;
      data['PROPIEDAD_DIRECCION'] = reservation.property.address;
      data['PROPIEDAD_TIPO'] = reservation.property.propertyType;
      
      // Client data from property
      data['CLIENTE_NOMBRE'] = reservation.property.client.name;
      data['CLIENTE_EMAIL'] = reservation.property.client.email || '';
      data['CLIENTE_TELEFONO'] = reservation.property.client.phones;
    }
  }
  
  if (propertyId && !reservationId) {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: { client: true }
    });
    if (property) {
      data['PROPIEDAD_NOMBRE'] = property.name;
      data['PROPIEDAD_DIRECCION'] = property.address;
      data['PROPIEDAD_TIPO'] = property.propertyType;
      data['CLIENTE_NOMBRE'] = property.client.name;
      data['CLIENTE_EMAIL'] = property.client.email || '';
      data['CLIENTE_TELEFONO'] = property.client.phones;
    }
  }
  
  if (clientId && !reservationId && !propertyId) {
    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (client) {
      data['CLIENTE_NOMBRE'] = client.name;
      data['CLIENTE_EMAIL'] = client.email || '';
      data['CLIENTE_TELEFONO'] = client.phones;
    }
  }
  
  // Return the data for client-side processing
  // The actual docx processing will happen in the browser using docxtemplater
  return NextResponse.json({ 
    success: true, 
    templateUrl: template.url,
    templateName: template.name,
    data 
  });
}

export async function GET() {
  const contracts = await prisma.contract.findMany({
    include: { template: true },
    orderBy: { generatedAt: 'desc' },
    take: 50,
  });
  return NextResponse.json(contracts);
}
