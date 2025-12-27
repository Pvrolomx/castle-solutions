# Add PUT to properties API
with open('/home/pvrolo/castle-solutions/src/app/api/properties/route.ts', 'r') as f:
    props_content = f.read()

if 'PUT' not in props_content:
    props_content += '''

export async function PUT(request: Request) {
  const data = await request.json();
  const property = await prisma.property.update({
    where: { id: data.id },
    data: {
      name: data.name,
      address: data.address,
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
'''
    with open('/home/pvrolo/castle-solutions/src/app/api/properties/route.ts', 'w') as f:
        f.write(props_content)
    print('PUT added to properties API')
else:
    print('PUT already exists in properties API')

# Add PUT to contacts API
with open('/home/pvrolo/castle-solutions/src/app/api/contacts/route.ts', 'r') as f:
    contacts_content = f.read()

if 'PUT' not in contacts_content:
    contacts_content += '''

export async function PUT(request: Request) {
  const data = await request.json();
  const contact = await prisma.contact.update({
    where: { id: data.id },
    data: {
      name: data.name,
      phones: JSON.stringify(data.phones || []),
      email: data.email || null,
      category: data.category || 'familia',
      birthday: data.birthday || null,
      address: data.address || null,
      notes: data.notes || null,
    },
    include: { documents: true },
  });
  return NextResponse.json(contact);
}
'''
    with open('/home/pvrolo/castle-solutions/src/app/api/contacts/route.ts', 'w') as f:
        f.write(contacts_content)
    print('PUT added to contacts API')
else:
    print('PUT already exists in contacts API')
