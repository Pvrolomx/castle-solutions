import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET - listar salas de chat
export async function GET() {
  const rooms = await prisma.chatRoom.findMany({
    include: {
      participants: true,
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    },
    orderBy: { updatedAt: 'desc' }
  });
  return NextResponse.json(rooms);
}

// POST - crear sala de chat
export async function POST(request: NextRequest) {
  const data = await request.json();
  
  const room = await prisma.chatRoom.create({
    data: {
      name: data.name || null,
      type: data.type || 'group',
      participants: {
        create: data.participants.map((name: string) => ({
          name,
          role: name === data.creator ? 'admin' : 'member'
        }))
      }
    },
    include: { participants: true }
  });
  
  return NextResponse.json(room);
}
