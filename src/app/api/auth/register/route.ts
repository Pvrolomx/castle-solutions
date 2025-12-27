import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const data = await request.json();
  
  // Check if any users exist
  const userCount = await prisma.user.count();
  
  // Only allow registration if no users exist (first admin) or if requester is admin
  if (userCount > 0) {
    return NextResponse.json({ error: 'Registration closed' }, { status: 403 });
  }
  
  const hashedPassword = await bcrypt.hash(data.password, 10);
  
  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
      role: 'admin',
    },
  });
  
  return NextResponse.json({ id: user.id, email: user.email, name: user.name });
}
