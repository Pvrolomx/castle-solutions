with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'r') as f:
    content = f.read()

# Add edit states after existing states
old_state = "const [contactData, setContactData] = useState({ name: '', phone: '', email: '', category: 'familia', birthday: '', address: '', notes: '' });"
new_state = """const [contactData, setContactData] = useState({ name: '', phone: '', email: '', category: 'familia', birthday: '', address: '', notes: '' });
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);"""
content = content.replace(old_state, new_state)

# Add edit functions after delete functions
edit_funcs = '''

  const startEditClient = (client: Client) => {
    setClientData({
      name: client.name,
      phone: JSON.parse(client.phones).join(', '),
      email: client.email || '',
      notes: client.notes || ''
    });
    setEditingClient(client);
    setSelectedClient(null);
    setShowClientForm(true);
  };

  const startEditProperty = (property: Property) => {
    setPropertyData({
      name: property.name,
      address: property.address,
      clientId: property.client?.id || '',
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
    setShowPropertyForm(true);
  };

  const startEditContact = (contact: Contact) => {
    setContactData({
      name: contact.name,
      phone: JSON.parse(contact.phones).join(', '),
      email: contact.email || '',
      category: contact.category,
      birthday: contact.birthday || '',
      address: contact.address || '',
      notes: contact.notes || ''
    });
    setEditingContact(contact);
    setSelectedContact(null);
    setShowContactForm(true);
  };
'''

content = content.replace(
    "loadData(search);\n  };\n\n  const parsePhones",
    "loadData(search);\n  };" + edit_funcs + "\n\n  const parsePhones"
)

# Modify createClient to handle edit
old_create_client = """const createClient = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clientData),
    });
    setShowClientForm(false);
    setClientData({ name: '', phone: '', email: '', notes: '' });
    loadData(search);
  };"""

new_create_client = """const createClient = async (e: React.FormEvent) => {
    e.preventDefault();
    const phones = clientData.phone.split(',').map(p => p.trim()).filter(p => p);
    if (editingClient) {
      await fetch('/api/clients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...clientData, id: editingClient.id, phones }),
      });
      setEditingClient(null);
    } else {
      await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...clientData, phones }),
      });
    }
    setShowClientForm(false);
    setClientData({ name: '', phone: '', email: '', notes: '' });
    loadData(search);
  };"""

content = content.replace(old_create_client, new_create_client)

# Modify createProperty to handle edit
old_create_prop = """const createProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(propertyData),
    });
    setShowPropertyForm(false);
    setPropertyData({
      name: '', address: '', clientId: '', propertyType: 'casa', regime: 'independiente',
      condoName: '', condoAdminName: '', condoAdminPhone: '', condoFee: '', notes: ''
    });
    loadData(search);
  };"""

new_create_prop = """const createProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProperty) {
      await fetch('/api/properties', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...propertyData, id: editingProperty.id }),
      });
      setEditingProperty(null);
    } else {
      await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(propertyData),
      });
    }
    setShowPropertyForm(false);
    setPropertyData({
      name: '', address: '', clientId: '', propertyType: 'casa', regime: 'independiente',
      condoName: '', condoAdminName: '', condoAdminPhone: '', condoFee: '', notes: ''
    });
    loadData(search);
  };"""

content = content.replace(old_create_prop, new_create_prop)

# Modify createContact to handle edit
old_create_contact = """const createContact = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contactData),
    });
    setShowContactForm(false);
    setContactData({ name: '', phone: '', email: '', category: 'familia', birthday: '', address: '', notes: '' });
    loadData(search);
  };"""

new_create_contact = """const createContact = async (e: React.FormEvent) => {
    e.preventDefault();
    const phones = contactData.phone.split(',').map(p => p.trim()).filter(p => p);
    if (editingContact) {
      await fetch('/api/contacts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...contactData, id: editingContact.id, phones }),
      });
      setEditingContact(null);
    } else {
      await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...contactData, phones }),
      });
    }
    setShowContactForm(false);
    setContactData({ name: '', phone: '', email: '', category: 'familia', birthday: '', address: '', notes: '' });
    loadData(search);
  };"""

content = content.replace(old_create_contact, new_create_contact)

with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'w') as f:
    f.write(content)

print('Edit logic added - part 1')
