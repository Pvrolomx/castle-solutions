with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'r') as f:
    content = f.read()

# Fix startEditClient to accept parameter
old_edit_client = '''const startEditClient = () => {
    if (!selectedClient) return;
    setClientData({
      name: selectedClient.name,
      phone: parsePhones(selectedClient.phones).join(', '),
      email: selectedClient.email || '',
      notes: selectedClient.notes || '',
    });
    setEditingClient(selectedClient);
  };'''

new_edit_client = '''const startEditClient = (client: Client) => {
    setClientData({
      name: client.name,
      phone: parsePhones(client.phones).join(', '),
      email: client.email || '',
      notes: client.notes || '',
    });
    setEditingClient(client);
    setSelectedClient(null);
    setShowClientForm(true);
  };'''

content = content.replace(old_edit_client, new_edit_client)

# Fix startEditProperty
old_edit_prop = '''const startEditProperty = () => {
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
  };'''

new_edit_prop = '''const startEditProperty = (property: Property) => {
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
      notes: property.notes || '',
    });
    setEditingProperty(property);
    setSelectedProperty(null);
    setShowPropertyForm(true);
  };'''

content = content.replace(old_edit_prop, new_edit_prop)

# Fix startEditContact
old_edit_contact = '''const startEditContact = () => {
    if (!selectedContact) return;
    setContactData({
      name: selectedContact.name,
      phone: parsePhones(selectedContact.phones).join(', '),
      email: selectedContact.email || '',
      category: selectedContact.category,
      birthday: selectedContact.birthday || '',
      address: selectedContact.address || '',
      notes: selectedContact.notes || '',
    });
    setEditingContact(selectedContact);
  };'''

new_edit_contact = '''const startEditContact = (contact: Contact) => {
    setContactData({
      name: contact.name,
      phone: parsePhones(contact.phones).join(', '),
      email: contact.email || '',
      category: contact.category,
      birthday: contact.birthday || '',
      address: contact.address || '',
      notes: contact.notes || '',
    });
    setEditingContact(contact);
    setSelectedContact(null);
    setShowContactForm(true);
  };'''

content = content.replace(old_edit_contact, new_edit_contact)

with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'w') as f:
    f.write(content)

print('Edit functions fixed')
