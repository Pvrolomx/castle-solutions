with open('/home/pvrolo/castle-solutions/src/app/calendario/page.tsx', 'r') as f:
    content = f.read()

# Add UploadButton import
content = content.replace(
    "import Link from 'next/link';",
    "import Link from 'next/link';\nimport { UploadButton } from '@uploadthing/react';"
)

# Add GuestDocument interface after Reservation interface
guest_doc_interface = '''

interface GuestDocument {
  id: string;
  reservationId: string;
  docType: string;
  filename: string;
  url: string;
}
'''

content = content.replace(
    "const PLATFORMS = [",
    guest_doc_interface + "\nconst PLATFORMS = ["
)

# Add DOC_TYPES constant
doc_types = '''
const DOC_TYPES = [
  { value: 'pasaporte', label: 'Pasaporte' },
  { value: 'visa', label: 'Visa' },
  { value: 'identificacion', label: 'Identificación' },
  { value: 'contrato', label: 'Contrato' },
  { value: 'otro', label: 'Otro' },
];

'''

content = content.replace(
    "const COUNTRIES = ",
    doc_types + "const COUNTRIES = "
)

# Add guestDocs state
content = content.replace(
    "const [filterProperty, setFilterProperty] = useState('');",
    '''const [filterProperty, setFilterProperty] = useState('');
  const [guestDocs, setGuestDocs] = useState<GuestDocument[]>([]);
  const [newDocType, setNewDocType] = useState('pasaporte');'''
)

# Add loadGuestDocs function
load_docs_func = '''

  const loadGuestDocs = async (reservationId: string) => {
    const res = await fetch(`/api/guest-documents?reservationId=${reservationId}`);
    const docs = await res.json();
    setGuestDocs(docs);
  };

  const saveGuestDoc = async (url: string, filename: string, reservationId: string) => {
    await fetch('/api/guest-documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reservationId, docType: newDocType, filename, url }),
    });
    loadGuestDocs(reservationId);
  };

  const deleteGuestDoc = async (id: string, reservationId: string) => {
    await fetch(`/api/guest-documents?id=${id}`, { method: 'DELETE' });
    loadGuestDocs(reservationId);
  };
'''

content = content.replace(
    "const openEditForm = (r: Reservation) => {",
    load_docs_func + "\n  const openEditForm = (r: Reservation) => {"
)

# Modify openEditForm to load docs
content = content.replace(
    "setShowForm(true);\n  };",
    "setShowForm(true);\n    loadGuestDocs(r.id);\n  };"
)

# Add clear docs when closing form
content = content.replace(
    "setShowForm(false); setSelectedReservation(null);",
    "setShowForm(false); setSelectedReservation(null); setGuestDocs([]);"
)

with open('/home/pvrolo/castle-solutions/src/app/calendario/page.tsx', 'w') as f:
    f.write(content)

print('Guest docs state and functions added')
