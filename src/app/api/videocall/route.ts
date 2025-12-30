import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET - obtener estado de la llamada
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const roomCode = searchParams.get('roomCode');
  
  if (!roomCode) {
    return NextResponse.json({ error: 'roomCode required' }, { status: 400 });
  }
  
  const call = await prisma.videoCall.findUnique({
    where: { roomCode },
    include: { candidates: true }
  });
  
  return NextResponse.json(call);
}

// POST - crear/actualizar llamada
export async function POST(request: NextRequest) {
  const data = await request.json();
  const { action, roomCode, creatorName, offer, answer, candidate, fromUser } = data;
  
  // Crear nueva llamada
  if (action === 'create') {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const call = await prisma.videoCall.create({
      data: {
        roomCode: code,
        creatorName,
        status: 'waiting'
      }
    });
    return NextResponse.json(call);
  }
  
  // Unirse a llamada
  if (action === 'join') {
    const call = await prisma.videoCall.findUnique({ where: { roomCode } });
    if (!call) {
      return NextResponse.json({ error: 'Call not found' }, { status: 404 });
    }
    await prisma.videoCall.update({
      where: { roomCode },
      data: { status: 'connecting' }
    });
    return NextResponse.json(call);
  }
  
  // Enviar offer (caller)
  if (action === 'offer') {
    const call = await prisma.videoCall.update({
      where: { roomCode },
      data: { offer, status: 'offering' }
    });
    return NextResponse.json(call);
  }
  
  // Enviar answer (callee)
  if (action === 'answer') {
    const call = await prisma.videoCall.update({
      where: { roomCode },
      data: { answer, status: 'connected' }
    });
    return NextResponse.json(call);
  }
  
  // Agregar ICE candidate
  if (action === 'ice') {
    const call = await prisma.videoCall.findUnique({ where: { roomCode } });
    if (!call) {
      return NextResponse.json({ error: 'Call not found' }, { status: 404 });
    }
    await prisma.iceCandidate.create({
      data: {
        callId: call.id,
        fromUser,
        candidate
      }
    });
    return NextResponse.json({ success: true });
  }
  
  // Terminar llamada
  if (action === 'end') {
    await prisma.videoCall.update({
      where: { roomCode },
      data: { status: 'ended' }
    });
    return NextResponse.json({ success: true });
  }
  
  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
