# Add DELETE to clients API
with open('/home/pvrolo/castle-solutions/src/app/api/clients/route.ts', 'a') as f:
    f.write('''

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  await prisma.document.deleteMany({ where: { clientId: id } });
  await prisma.property.deleteMany({ where: { clientId: id } });
  await prisma.client.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
''')

# Add DELETE to properties API
with open('/home/pvrolo/castle-solutions/src/app/api/properties/route.ts', 'a') as f:
    f.write('''

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  await prisma.property.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
''')

# Add DELETE to contacts API
with open('/home/pvrolo/castle-solutions/src/app/api/contacts/route.ts', 'a') as f:
    f.write('''

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  await prisma.document.deleteMany({ where: { contactId: id } });
  await prisma.contact.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
''')

print('DELETE endpoints added to all APIs')
