with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'r') as f:
    content = f.read()

# 1. Add editing states after selectedContact state
old_states = '''const [selectedContact, setSelectedContact] = useState<Contact | null>(null);'''
new_states = '''const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);'''
content = content.replace(old_states, new_states)

# 2. Add update functions after getDocTypeLabel
old_get_doc = '''  const getDocTypeLabel = (type: string) => {
    return DOC_TYPES.find(d => d.value === type)?.label || type;
  };

  if (loading)'''

new_get_doc = '''  const getDocTypeLabel = (type: string) => {
    return DOC_TYPES.find(d => d.value === type)?.label || type;
  };

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

  if (loading)'''
content = content.replace(old_get_doc, new_get_doc)

# 3. Update Client Form Modal to handle edit
content = content.replace(
    '{showClientForm && (',
    '{(showClientForm || editingClient) && ('
)
content = content.replace(
    '<h2 className="text-xl font-semibold mb-4">Nuevo Cliente</h2>\n              <form onSubmit={createClient}',
    '<h2 className="text-xl font-semibold mb-4">{editingClient ? "Editar Cliente" : "Nuevo Cliente"}</h2>\n              <form onSubmit={editingClient ? updateClient : createClient}'
)
content = content.replace(
    '<button type="button" onClick={() => setShowClientForm(false)} className="flex-1 bg-stone-200 py-2 rounded hover:bg-stone-300">Cancelar</button>',
    '<button type="button" onClick={() => { setShowClientForm(false); setEditingClient(null); setClientData({ name: "", phone: "", email: "", notes: "" }); }} className="flex-1 bg-stone-200 py-2 rounded hover:bg-stone-300">Cancelar</button>'
)

# 4. Update Property Form Modal
content = content.replace(
    '{showPropertyForm && (',
    '{(showPropertyForm || editingProperty) && ('
)
content = content.replace(
    '<h2 className="text-xl font-semibold mb-4">Nueva Propiedad</h2>\n              <form onSubmit={createProperty}',
    '<h2 className="text-xl font-semibold mb-4">{editingProperty ? "Editar Propiedad" : "Nueva Propiedad"}</h2>\n              <form onSubmit={editingProperty ? updateProperty : createProperty}'
)
content = content.replace(
    '<button type="button" onClick={() => setShowPropertyForm(false)} className="flex-1 bg-stone-200 py-2 rounded hover:bg-stone-300">Cancelar</button>',
    '<button type="button" onClick={() => { setShowPropertyForm(false); setEditingProperty(null); }} className="flex-1 bg-stone-200 py-2 rounded hover:bg-stone-300">Cancelar</button>'
)

# 5. Update Contact Form Modal
content = content.replace(
    '{showContactForm && (',
    '{(showContactForm || editingContact) && ('
)
content = content.replace(
    '<h2 className="text-xl font-semibold mb-4">Nuevo Contacto</h2>\n              <form onSubmit={createContact}',
    '<h2 className="text-xl font-semibold mb-4">{editingContact ? "Editar Contacto" : "Nuevo Contacto"}</h2>\n              <form onSubmit={editingContact ? updateContact : createContact}'
)
content = content.replace(
    '<button type="button" onClick={() => setShowContactForm(false)} className="flex-1 bg-rose-600 text-white py-2 rounded hover:bg-rose-700">Crear</button>',
    '<button type="submit" className="flex-1 bg-rose-600 text-white py-2 rounded hover:bg-rose-700">{editingContact ? "Guardar" : "Crear"}</button>'
)

# 6. Add Edit buttons to detail modals - Client
old_client_btns = '''<button onClick={() => setSelectedClient(null)} className="w-full mt-4 bg-stone-200 py-2 rounded hover:bg-stone-300">Cerrar</button>'''
new_client_btns = '''<div className="flex gap-2 mt-4">
                <button onClick={() => setSelectedClient(null)} className="flex-1 bg-stone-200 py-2 rounded hover:bg-stone-300">Cerrar</button>
                <button onClick={startEditClient} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Editar</button>
                <button onClick={() => deleteClient(selectedClient.id)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Eliminar</button>
              </div>'''
content = content.replace(old_client_btns, new_client_btns)

# Property
old_prop_btns = '''<button onClick={() => setSelectedProperty(null)} className="w-full mt-4 bg-stone-200 py-2 rounded hover:bg-stone-300">Cerrar</button>'''
new_prop_btns = '''<div className="flex gap-2 mt-4">
                <button onClick={() => setSelectedProperty(null)} className="flex-1 bg-stone-200 py-2 rounded hover:bg-stone-300">Cerrar</button>
                <button onClick={startEditProperty} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Editar</button>
                <button onClick={() => deleteProperty(selectedProperty.id)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Eliminar</button>
              </div>'''
content = content.replace(old_prop_btns, new_prop_btns)

# Contact
old_contact_btns = '''<button onClick={() => setSelectedContact(null)} className="w-full mt-4 bg-stone-200 py-2 rounded hover:bg-stone-300">Cerrar</button>'''
new_contact_btns = '''<div className="flex gap-2 mt-4">
                <button onClick={() => setSelectedContact(null)} className="flex-1 bg-stone-200 py-2 rounded hover:bg-stone-300">Cerrar</button>
                <button onClick={startEditContact} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Editar</button>
                <button onClick={() => deleteContact(selectedContact.id)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Eliminar</button>
              </div>'''
content = content.replace(old_contact_btns, new_contact_btns)

with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'w') as f:
    f.write(content)

print('Edit functionality added completely')
