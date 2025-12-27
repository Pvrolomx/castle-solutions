with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'r') as f:
    content = f.read()

# Add Photo interface after Property interface
photo_interface = '''
interface Photo {
  id: string;
  propertyId: string;
  url: string;
  caption: string | null;
}
'''

content = content.replace(
    'interface Property {',
    photo_interface + '\ninterface Property {'
)

# Add photos to Property interface
content = content.replace(
    '''notes: string | null;
  client?: Client;
}''',
    '''notes: string | null;
  client?: Client;
  photos?: Photo[];
}'''
)

# Add state for property photos after selectedProperty state
old_state = 'const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);'
new_state = '''const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [propertyPhotos, setPropertyPhotos] = useState<Photo[]>([]);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);'''
content = content.replace(old_state, new_state)

# Add loadPropertyPhotos function after loadContactDocs
load_photos_func = '''

  const loadPropertyPhotos = async (propertyId: string) => {
    const res = await fetch(`/api/photos?propertyId=${propertyId}`);
    const photos = await res.json();
    setPropertyPhotos(photos);
  };

  const savePhoto = async (url: string) => {
    if (!selectedProperty) return;
    await fetch('/api/photos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        propertyId: selectedProperty.id,
        url,
      }),
    });
    loadPropertyPhotos(selectedProperty.id);
    setShowPhotoUpload(false);
  };

  const deletePhoto = async (photoId: string) => {
    if (!confirm('¿Eliminar esta foto?')) return;
    await fetch(`/api/photos?id=${photoId}`, { method: 'DELETE' });
    if (selectedProperty) loadPropertyPhotos(selectedProperty.id);
  };'''

content = content.replace(
    'const loadContactDocs = async (contactId: string) => {',
    'const loadContactDocs = async (contactId: string) => {'
)

# Find where to insert - after loadContactDocs function
old_load_contact = '''const loadContactDocs = async (contactId: string) => {
    const res = await fetch(`/api/documents?contactId=${contactId}`);
    const docs = await res.json();
    setContactDocs(docs);
  };'''

content = content.replace(old_load_contact, old_load_contact + load_photos_func)

# Add useEffect for selectedProperty photos
old_effect = '''useEffect(() => {
    if (selectedContact) {
      loadContactDocs(selectedContact.id);
    } else {
      setContactDocs([]);
    }
  }, [selectedContact]);'''

new_effect = '''useEffect(() => {
    if (selectedContact) {
      loadContactDocs(selectedContact.id);
    } else {
      setContactDocs([]);
    }
  }, [selectedContact]);

  useEffect(() => {
    if (selectedProperty) {
      loadPropertyPhotos(selectedProperty.id);
    } else {
      setPropertyPhotos([]);
    }
  }, [selectedProperty]);'''

content = content.replace(old_effect, new_effect)

with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'w') as f:
    f.write(content)

print('Part 1: Photo state and functions added')
