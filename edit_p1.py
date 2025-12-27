with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'r') as f:
    content = f.read()

# Add editing state variables after selectedContact state
old_state = '''const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [, setContactDocs] = useState<Document[]>([]);'''

new_state = '''const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [, setContactDocs] = useState<Document[]>([]);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [editClientData, setEditClientData] = useState({ name: '', phones: [''], email: '', notes: '' });
  const [editPropertyData, setEditPropertyData] = useState({ name: '', address: '', propertyType: 'casa', regime: 'independiente', condoName: '', condoAdminName: '', condoAdminPhone: '', condoFee: '', notes: '' });
  const [editContactData, setEditContactData] = useState({ name: '', phones: [''], email: '', category: 'familia', birthday: '', address: '', notes: '' });'''

content = content.replace(old_state, new_state)

# Add phone management functions after parsePhones
old_parse = '''const parsePhones = (phones: string): string[] => {
    try { return JSON.parse(phones); } catch { return [phones]; }
  };'''

new_parse = '''const parsePhones = (phones: string): string[] => {
    try { return JSON.parse(phones); } catch { return [phones]; }
  };

  const startEditClient = (client: Client) => {
    setEditClientData({
      name: client.name,
      phones: parsePhones(client.phones),
      email: client.email || '',
      notes: client.notes || ''
    });
    setEditingClient(client);
    setSelectedClient(null);
  };

  const startEditProperty = (property: Property) => {
    setEditPropertyData({
      name: property.name,
      address: property.address,
      propertyType: property.propertyType,
      regime: property.regime,
      condoName: property.condoName || '',
      condoAdminName: property.condoAdminName || '',
      condoAdminPhone: property.condoAdminPhone || '',
      condoFee: property.condoFee || '',
      notes: property.notes || ''
    });
    setEditingProperty(property);
    setSelectedProperty(null);
  };

  const startEditContact = (contact: Contact) => {
    setEditContactData({
      name: contact.name,
      phones: parsePhones(contact.phones),
      email: contact.email || '',
      category: contact.category,
      birthday: contact.birthday || '',
      address: contact.address || '',
      notes: contact.notes || ''
    });
    setEditingContact(contact);
    setSelectedContact(null);
  };

  const updateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;
    await fetch('/api/clients', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editingClient.id, ...editClientData, phones: editClientData.phones.filter(p => p) }),
    });
    setEditingClient(null);
    loadData(search);
  };

  const updateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProperty) return;
    await fetch('/api/properties', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editingProperty.id, ...editPropertyData }),
    });
    setEditingProperty(null);
    loadData(search);
  };

  const updateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContact) return;
    await fetch('/api/contacts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editingContact.id, ...editContactData, phones: editContactData.phones.filter(p => p) }),
    });
    setEditingContact(null);
    loadData(search);
  };

  const addPhoneField = (type: 'client' | 'contact' | 'editClient' | 'editContact') => {
    if (type === 'editClient') setEditClientData({...editClientData, phones: [...editClientData.phones, '']});
    else if (type === 'editContact') setEditContactData({...editContactData, phones: [...editContactData.phones, '']});
  };

  const updatePhoneField = (type: 'editClient' | 'editContact', index: number, value: string) => {
    if (type === 'editClient') {
      const newPhones = [...editClientData.phones];
      newPhones[index] = value;
      setEditClientData({...editClientData, phones: newPhones});
    } else {
      const newPhones = [...editContactData.phones];
      newPhones[index] = value;
      setEditContactData({...editContactData, phones: newPhones});
    }
  };

  const removePhoneField = (type: 'editClient' | 'editContact', index: number) => {
    if (type === 'editClient') {
      const newPhones = editClientData.phones.filter((_, i) => i !== index);
      setEditClientData({...editClientData, phones: newPhones.length ? newPhones : ['']});
    } else {
      const newPhones = editContactData.phones.filter((_, i) => i !== index);
      setEditContactData({...editContactData, phones: newPhones.length ? newPhones : ['']});
    }
  };'''

content = content.replace(old_parse, new_parse)

with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'w') as f:
    f.write(content)

print('Part 1: Edit state and functions added')
