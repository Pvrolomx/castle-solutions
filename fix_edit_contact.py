with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'r') as f:
    content = f.read()

# Fix startEditContact - matching exact current text
old_edit_contact = '''const startEditContact = () => {
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
  };'''

new_edit_contact = '''const startEditContact = (contact: Contact) => {
    setContactData({
      name: contact.name,
      phone: JSON.parse(contact.phones).join(', '),
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

print('startEditContact fixed')
