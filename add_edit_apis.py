# Add PUT endpoints to APIs for editing

# Clients
with open('/home/pvrolo/castle-solutions/src/app/api/clients/route.ts', 'a') as f:
    f.write('''

export async function PUT(request: Request) {
  const data = await request.json();
  const client = await prisma.client.update({
    where: { id: data.id },
    data: {
      name: data.name,
      phones: JSON.stringify(data.phones || [data.phone]),
      email: data.email || null,
      notes: data.notes || null,
    },
    include: { properties: true },
  });
  return NextResponse.json(client);
}
''')

# Properties
with open('/home/pvrolo/castle-solutions/src/app/api/properties/route.ts', 'a') as f:
    f.write('''

export async function PUT(request: Request) {
  const data = await request.json();
  const property = await prisma.property.update({
    where: { id: data.id },
    data: {
      name: data.name,
      address: data.address,
      clientId: data.clientId,
      propertyType: data.propertyType,
      regime: data.regime,
      condoName: data.condoName || null,
      condoAdminName: data.condoAdminName || null,
      condoAdminPhone: data.condoAdminPhone || null,
      condoFee: data.condoFee || null,
      notes: data.notes || null,
    },
    include: { client: true },
  });
  return NextResponse.json(property);
}
''')

# Contacts
with open('/home/pvrolo/castle-solutions/src/app/api/contacts/route.ts', 'a') as f:
    f.write('''

export async function PUT(request: Request) {
  const data = await request.json();
  const contact = await prisma.contact.update({
    where: { id: data.id },
    data: {
      name: data.name,
      phones: JSON.stringify(data.phones || [data.phone]),
      email: data.email || null,
      category: data.category,
      birthday: data.birthday || null,
      address: data.address || null,
      notes: data.notes || null,
    },
    include: { documents: true },
  });
  return NextResponse.json(contact);
}
''')

print('PUT endpoints added')
