import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET - listar mensajes de una sala
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get('roomId');
  
  if (!roomId) {
    return NextResponse.json({ error: 'roomId required' }, { status: 400 });
  }
  
  const messages = await prisma.chatMessage.findMany({
    where: { roomId },
    include: { participant: true },
    orderBy: { createdAt: 'asc' }
  });
  
  return NextResponse.json(messages);
}

// POST - enviar mensaje
export async function POST(request: NextRequest) {
  const data = await request.json();
  
  // Buscar o crear participante
  let participant = await prisma.chatParticipant.findFirst({
    where: { roomId: data.roomId, name: data.senderName }
  });
  
  if (!participant) {
    participant = await prisma.chatParticipant.create({
      data: {
        roomId: data.roomId,
        name: data.senderName
      }
    });
  }
  
  const message = await prisma.chatMessage.create({
    data: {
      roomId: data.roomId,
      participantId: participant.id,
      content: data.content,
      type: data.type || 'text',
      fileUrl: data.fileUrl || null
    },
    include: { participant: true }
  });
  
  // Actualizar timestamp de la sala
  await prisma.chatRoom.update({
    where: { id: data.roomId },
    data: { updatedAt: new Date() }
  });
  
  return NextResponse.json(message);
}
