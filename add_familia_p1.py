import re

# Read original file
with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'r') as f:
    content = f.read()

# Add Contact interface after Property interface
contact_interface = '''
interface Contact {
  id: string;
  name: string;
  phones: string;
  email: string | null;
  category: string;
  birthday: string | null;
  address: string | null;
  notes: string | null;
  documents?: Document[];
}

const CONTACT_CATEGORIES = [
  { value: 'familia', label: 'Familia' },
  { value: 'amigos', label: 'Amigos' },
  { value: 'contactos', label: 'Contactos' },
  { value: 'otro', label: 'Otro' },
];
'''

# Insert after DOC_TYPES
content = content.replace(
    "{ value: 'otro', label: 'Otro' },\n];",
    "{ value: 'otro', label: 'Otro' },\n];" + contact_interface
)

# Add contacts state after properties state
old_state = "const [properties, setProperties] = useState<Property[]>([]);"
new_state = """const [properties, setProperties] = useState<Property[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);"""
content = content.replace(old_state, new_state)

# Update view type
content = content.replace(
    "const [view, setView] = useState<'clients' | 'properties'>('clients');",
    "const [view, setView] = useState<'clients' | 'properties' | 'familia'>('clients');"
)

# Add contact form state and selected contact
old_form_state = "const [showPropertyForm, setShowPropertyForm] = useState(false);"
new_form_state = """const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [contactDocs, setContactDocs] = useState<Document[]>([]);"""
content = content.replace(old_form_state, new_form_state)

# Add contact data state
old_data = "condoName: '', condoAdminName: '', condoAdminPhone: '', condoFee: '', notes: ''\n  });"
new_data = """condoName: '', condoAdminName: '', condoAdminPhone: '', condoFee: '', notes: ''
  });
  const [contactData, setContactData] = useState({ name: '', phone: '', email: '', category: 'familia', birthday: '', address: '', notes: '' });"""
content = content.replace(old_data, new_data)

# Update loadData to include contacts
old_load = """const [clientsRes, propsRes] = await Promise.all([
      fetch(`/api/clients${query}`),
      fetch(`/api/properties${query}`)
    ]);
    setClients(await clientsRes.json());
    setProperties(await propsRes.json());"""
new_load = """const [clientsRes, propsRes, contactsRes] = await Promise.all([
      fetch(`/api/clients${query}`),
      fetch(`/api/properties${query}`),
      fetch(`/api/contacts${query}`)
    ]);
    setClients(await clientsRes.json());
    setProperties(await propsRes.json());
    setContacts(await contactsRes.json());"""
content = content.replace(old_load, new_load)

# Add loadContactDocs function after loadClientDocs
old_load_docs = """const loadClientDocs = async (clientId: string) => {
    const res = await fetch(`/api/documents?clientId=${clientId}`);
    const docs = await res.json();
    setClientDocs(docs);
  };"""
new_load_docs = """const loadClientDocs = async (clientId: string) => {
    const res = await fetch(`/api/documents?clientId=${clientId}`);
    const docs = await res.json();
    setClientDocs(docs);
  };

  const loadContactDocs = async (contactId: string) => {
    const res = await fetch(`/api/documents?contactId=${contactId}`);
    const docs = await res.json();
    setContactDocs(docs);
  };"""
content = content.replace(old_load_docs, new_load_docs)

# Add useEffect for selectedContact
old_effect = """useEffect(() => {
    if (selectedClient) {
      loadClientDocs(selectedClient.id);
    } else {
      setClientDocs([]);
    }
  }, [selectedClient]);"""
new_effect = """useEffect(() => {
    if (selectedClient) {
      loadClientDocs(selectedClient.id);
    } else {
      setClientDocs([]);
    }
  }, [selectedClient]);

  useEffect(() => {
    if (selectedContact) {
      loadContactDocs(selectedContact.id);
    } else {
      setContactDocs([]);
    }
  }, [selectedContact]);"""
content = content.replace(old_effect, new_effect)

# Add createContact function after createProperty
create_contact = '''
  const createContact = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contactData),
    });
    setShowContactForm(false);
    setContactData({ name: '', phone: '', email: '', category: 'familia', birthday: '', address: '', notes: '' });
    loadData(search);
  };
'''

# Find createProperty function end and add createContact after
content = content.replace(
    "loadData(search);\n  };\n\n  const saveDocument",
    "loadData(search);\n  };" + create_contact + "\n\n  const saveDocument"
)

with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'w') as f:
    f.write(content)

print('Part 1 done - state and functions added')
