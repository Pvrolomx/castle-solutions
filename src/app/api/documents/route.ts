import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('clientId');
  
  if (!clientId) {
    return NextResponse.json({ error: 'clientId required' }, { status: 400 });
  }
  
  const documents = await prisma.document.findMany({
    where: { clientId },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(documents);
}

export async function POST(request: Request) {
  const data = await request.json();
  const document = await prisma.document.create({
    data: {
      clientId: data.clientId,
      docType: data.docType,
      filename: data.filename,
      url: data.url,
    },
  });
  return NextResponse.json(document);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 });
  }
  
  await prisma.document.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
