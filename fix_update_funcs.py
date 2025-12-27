with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'r') as f:
    lines = f.readlines()

# Find the line AFTER parsePhones function (after its closing brace)
insert_line = None
for i, line in enumerate(lines):
    if 'const parsePhones = (phones: string)' in line:
        # parsePhones is a one-liner, insert after it
        insert_line = i + 1
        break

if insert_line is None:
    print('ERROR: parsePhones not found')
    exit(1)

update_funcs = '''
  const updateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;
    await fetch('/api/clients', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: editingClient.id,
        name: clientData.name,
        phones: clientData.phone.split(',').map((p: string) => p.trim()),
        email: clientData.email,
        notes: clientData.notes,
      }),
    });
    setEditingClient(null);
    setSelectedClient(null);
    setClientData({ name: '', phone: '', email: '', notes: '' });
    loadData(search);
  };

  const updateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProperty) return;
    await fetch('/api/properties', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editingProperty.id, ...propertyData }),
    });
    setEditingProperty(null);
    setSelectedProperty(null);
    setPropertyData({ name: '', address: '', clientId: '', propertyType: 'casa', regime: 'independiente', condoName: '', condoAdminName: '', condoAdminPhone: '', condoFee: '', notes: '' });
    loadData(search);
  };

  const updateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContact) return;
    await fetch('/api/contacts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: editingContact.id,
        name: contactData.name,
        phones: contactData.phone.split(',').map((p: string) => p.trim()),
        email: contactData.email,
        category: contactData.category,
        birthday: contactData.birthday,
        address: contactData.address,
        notes: contactData.notes,
      }),
    });
    setEditingContact(null);
    setSelectedContact(null);
    setContactData({ name: '', phone: '', email: '', category: 'familia', birthday: '', address: '', notes: '' });
    loadData(search);
  };

  const startEditClient = () => {
    if (!selectedClient) return;
    setClientData({
      name: selectedClient.name,
      phone: parsePhones(selectedClient.phones).join(', '),
      email: selectedClient.email || '',
      notes: selectedClient.notes || '',
    });
    setEditingClient(selectedClient);
  };

  const startEditProperty = () => {
    if (!selectedProperty) return;
    setPropertyData({
      name: selectedProperty.name,
      address: selectedProperty.address,
      clientId: selectedProperty.client?.id || '',
      propertyType: selectedProperty.propertyType,
      regime: selectedProperty.regime,
      condoName: selectedProperty.condoName || '',
      condoAdminName: selectedProperty.condoAdminName || '',
      condoAdminPhone: selectedProperty.condoAdminPhone || '',
      condoFee: selectedProperty.condoFee || '',
      notes: selectedProperty.notes || '',
    });
    setEditingProperty(selectedProperty);
  };

  const startEditContact = () => {
    if (!selectedContact) return;
    setContactData({
      name: selectedContact.name,
      phone: JSON.parse(selectedContact.phones).join(', '),
      email: selectedContact.email || '',
      category: selectedContact.category,
      birthday: selectedContact.birthday || '',
      address: selectedContact.address || '',
      notes: selectedContact.notes || '',
    });
    setEditingContact(selectedContact);
  };

'''

# Insert after parsePhones
lines.insert(insert_line, update_funcs)

with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'w') as f:
    f.writelines(lines)

print(f'Update functions inserted after line {insert_line}')
