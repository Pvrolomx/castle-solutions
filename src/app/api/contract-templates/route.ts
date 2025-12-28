import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const templates = await prisma.contractTemplate.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(templates);
}

export async function POST(request: Request) {
  const data = await request.json();
  
  const template = await prisma.contractTemplate.create({
    data: {
      name: data.name,
      filename: data.filename,
      url: data.url,
      variables: data.variables || null,
    },
  });
  
  return NextResponse.json(template);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  
  await prisma.contractTemplate.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
