const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const clients = await prisma.client.findMany();
    console.log('Clientes encontrados:', clients.length);
    clients.forEach(c => console.log('-', c.name));
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
