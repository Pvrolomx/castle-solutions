'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import InstallPrompt from '@/components/InstallPrompt';
import { useSession, signOut } from 'next-auth/react';
import { jsPDF } from 'jspdf';

import { UploadButton } from '@/lib/uploadthing';
import '@uploadthing/react/styles.css';

interface Document {
  id: string;
  clientId: string;
  docType: string;
  filename: string;
  url: string;
}

interface Client {
  id: string;
  name: string;
  phones: string;
  email: string | null;
  notes: string | null;
  properties: Property[];
  documents?: Document[];
}


interface Photo {
  id: string;
  propertyId: string;
  url: string;
  caption: string | null;
}

interface Property {
  id: string;
  name: string;
  address: string;
  propertyType: string;
  regime: string;
  condoName: string | null;
  condoAdminName: string | null;
  condoAdminPhone: string | null;
  condoFee: string | null;
  notes: string | null;
  client?: Client;
  photos?: Photo[];
}

const DOC_TYPES = [
  { value: 'pasaporte', label: 'Pasaporte' },
  { value: 'ine', label: 'INE/ID' },
  { value: 'contrato', label: 'Contrato' },
  { value: 'escrituras', label: 'Escrituras' },
  { value: 'comprobante', label: 'Comprobante Domicilio' },
  { value: 'otro', label: 'Otro' },
];
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


export default function Home() {
  const { data: session } = useSession();
  const [clients, setClients] = useState<Client[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'clients' | 'properties' | 'familia'>('clients');
  const [showClientForm, setShowClientForm] = useState(false);
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [, setContactDocs] = useState<Document[]>([]);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [listening, setListening] = useState(false);
  const [editClientData, setEditClientData] = useState({ name: '', phones: [''], email: '', notes: '' });
  const [editPropertyData, setEditPropertyData] = useState({ name: '', address: '', propertyType: 'casa', regime: 'independiente', condoName: '', condoAdminName: '', condoAdminPhone: '', condoFee: '', notes: '' });
  const [editContactData, setEditContactData] = useState({ name: '', phones: [''], email: '', category: 'familia', birthday: '', address: '', notes: '' });
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [propertyPhotos, setPropertyPhotos] = useState<Photo[]>([]);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [showDocUpload, setShowDocUpload] = useState(false);
  const [docType, setDocType] = useState('pasaporte');
  const [clientDocs, setClientDocs] = useState<Document[]>([]);

  const [clientData, setClientData] = useState({ name: '', phone: '', email: '', notes: '' });
  const [propertyData, setPropertyData] = useState({
    name: '', address: '', clientId: '', propertyType: 'casa', regime: 'independiente',
    condoName: '', condoAdminName: '', condoAdminPhone: '', condoFee: '', notes: ''
  });
  const [contactData, setContactData] = useState({ name: '', phone: '', email: '', category: 'familia', birthday: '', address: '', notes: '' });

  

  const generateClientLink = async (clientId: string, clientName: string) => {
    const res = await fetch('/api/generate-client-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId }),
    });
    const data = await res.json();
    if (data.success) {
      setGeneratedLink(data.url);
      setLinkClientName(clientName);
      setShowLinkModal(true);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    alert('Link copiado!');
  };

  const shareWhatsApp = () => {
    const message = encodeURIComponent(`Hola! Aquí está tu estado de cuenta de Castle Solutions:\n${generatedLink}`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const loadData = async (searchTerm = '') => {
    const query = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
    const [clientsRes, propsRes, contactsRes] = await Promise.all([
      fetch(`/api/clients${query}`),
      fetch(`/api/properties${query}`),
      fetch(`/api/contacts${query}`)
    ]);
    setClients(await clientsRes.json());
    setProperties(await propsRes.json());
    setContacts(await contactsRes.json());
    setLoading(false);
  };

  const loadClientDocs = async (clientId: string) => {
    const res = await fetch(`/api/documents?clientId=${clientId}`);
    const docs = await res.json();
    setClientDocs(docs);
  };

  const loadContactDocs = async (contactId: string) => {
    const res = await fetch(`/api/documents?contactId=${contactId}`);
    const docs = await res.json();
    setContactDocs(docs);
  };

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
  };

  const shareViaWhatsApp = (url: string, type: string, name: string) => {
    const message = encodeURIComponent(`${type}: ${name}\n${url}`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const extractFromDocument = async (url: string, type: 'client' | 'property' | 'contact') => {
    setExtracting(true);
    try {
      // First parse PDF to get text
      const parseRes = await fetch('/api/parse-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const parseData = await parseRes.json();
      
      if (!parseData.success) {
        alert('Error al leer el documento');
        setExtracting(false);
        return;
      }
      
      // Then extract fields with Ollama
      const extractRes = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: parseData.text, type }),
      });
      const extractData = await extractRes.json();
      
      if (extractData.success && extractData.data) {
        if (type === 'client') {
          setClientData({
            name: extractData.data.name || '',
            phone: extractData.data.phone || '',
            email: extractData.data.email || '',
            notes: extractData.data.notes || '',
          });
        } else if (type === 'property') {
          setPropertyData(prev => ({
            ...prev,
            name: extractData.data.name || prev.name,
            address: extractData.data.address || prev.address,
            propertyType: extractData.data.propertyType || prev.propertyType,
            regime: extractData.data.regime || prev.regime,
            condoName: extractData.data.condoName || prev.condoName,
            condoAdminName: extractData.data.condoAdminName || prev.condoAdminName,
            condoAdminPhone: extractData.data.condoAdminPhone || prev.condoAdminPhone,
            condoFee: extractData.data.condoFee || prev.condoFee,
            notes: extractData.data.notes || prev.notes,
          }));
        } else if (type === 'contact') {
          setContactData({
            name: extractData.data.name || '',
            phone: extractData.data.phone || '',
            email: extractData.data.email || '',
            category: 'familia',
            birthday: extractData.data.birthday || '',
            address: extractData.data.address || '',
            notes: extractData.data.notes || '',
          });
        }
        alert('✅ Datos extraídos con IA');
      } else {
        alert(extractData.error || 'No se pudieron extraer datos');
      }
    } catch (error) {
      alert('Error de conexión con Ollama');
    }
    setExtracting(false);
  };

  const handleExtractUpload = async (url: string, type: 'client' | 'property' | 'contact') => {
    await extractFromDocument(url, type);
  };

  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Tu navegador no soporta búsqueda por voz. Usa Chrome o Edge.');
      return;
    }
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'es-MX';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearch(transcript);
      loadData(transcript);
    };
    
    recognition.start();
  };

  const exportClientToPDF = (client: Client) => {
    const doc = new jsPDF();
    const phones = parsePhones(client.phones);
    
    doc.setFontSize(20);
    doc.text('FICHA DE CLIENTE', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    let y = 40;
    doc.text(`Nombre: ${client.name}`, 20, y); y += 10;
    doc.text(`Teléfono(s): ${phones.join(', ')}`, 20, y); y += 10;
    if (client.email) { doc.text(`Email: ${client.email}`, 20, y); y += 10; }
    if (client.notes) { doc.text(`Notas: ${client.notes}`, 20, y); y += 10; }
    
    y += 10;
    doc.setFontSize(14);
    doc.text(`Propiedades (${client.properties.length})`, 20, y); y += 10;
    doc.setFontSize(10);
    client.properties.forEach(p => {
      doc.text(`• ${p.name} - ${p.address}`, 25, y); y += 7;
    });
    
    doc.save(`cliente_${client.name.replace(/\s+/g, '_')}.pdf`);
  };

  const exportPropertyToPDF = (property: Property) => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('FICHA DE PROPIEDAD', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    let y = 40;
    doc.text(`Nombre: ${property.name}`, 20, y); y += 10;
    doc.text(`Dirección: ${property.address}`, 20, y); y += 10;
    doc.text(`Tipo: ${property.propertyType}`, 20, y); y += 10;
    doc.text(`Régimen: ${property.regime}`, 20, y); y += 10;
    
    if (property.regime === 'condominio') {
      y += 5;
      doc.setFontSize(11);
      doc.text('DATOS DEL CONDOMINIO:', 20, y); y += 8;
      doc.setFontSize(10);
      if (property.condoName) { doc.text(`Nombre: ${property.condoName}`, 25, y); y += 7; }
      if (property.condoAdminName) { doc.text(`Administrador: ${property.condoAdminName}`, 25, y); y += 7; }
      if (property.condoAdminPhone) { doc.text(`Tel Admin: ${property.condoAdminPhone}`, 25, y); y += 7; }
      if (property.condoFee) { doc.text(`Cuota: ${property.condoFee}`, 25, y); y += 7; }
    }
    
    if (property.client) {
      y += 10;
      doc.setFontSize(11);
      doc.text('PROPIETARIO:', 20, y); y += 8;
      doc.setFontSize(10);
      doc.text(`Nombre: ${property.client.name}`, 25, y); y += 7;
      const clientPhones = parsePhones(property.client.phones);
      doc.text(`Teléfono: ${clientPhones.join(', ')}`, 25, y); y += 7;
      if (property.client.email) { doc.text(`Email: ${property.client.email}`, 25, y); y += 7; }
    }
    
    if (property.notes) {
      y += 10;
      doc.text(`Notas: ${property.notes}`, 20, y);
    }
    
    doc.save(`propiedad_${property.name.replace(/\s+/g, '_')}.pdf`);
  };

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    const timer = setTimeout(() => { loadData(search); }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
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
  }, [selectedContact]);

  useEffect(() => {
    if (selectedProperty) {
      loadPropertyPhotos(selectedProperty.id);
    } else {
      setPropertyPhotos([]);
    }
  }, [selectedProperty]);

  const createClient = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clientData),
    });
    setShowClientForm(false);
    setClientData({ name: '', phone: '', email: '', notes: '' });
    loadData(search);
  };

  const createProperty = async (e: React.FormEvent) => {
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
  };
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


  const saveDocument = async (url: string, filename: string) => {
    if (!selectedClient) return;
    await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: selectedClient.id,
        docType,
        filename,
        url,
      }),
    });
    loadClientDocs(selectedClient.id);
    setShowDocUpload(false);
  };

  const deleteDocument = async (docId: string) => {
    if (!confirm('¿Eliminar este documento?')) return;
    await fetch(`/api/documents?id=${docId}`, { method: 'DELETE' });
    if (selectedClient) loadClientDocs(selectedClient.id);
  };

  const deleteClient = async (clientId: string) => {
    if (!confirm('¿Eliminar este cliente y todas sus propiedades?')) return;
    await fetch(`/api/clients?id=${clientId}`, { method: 'DELETE' });
    setSelectedClient(null);
    loadData(search);
  };

  const deleteProperty = async (propertyId: string) => {
    if (!confirm('¿Eliminar esta propiedad?')) return;
    await fetch(`/api/properties?id=${propertyId}`, { method: 'DELETE' });
    setSelectedProperty(null);
    loadData(search);
  };

  const deleteContact = async (contactId: string) => {
    if (!confirm('¿Eliminar este contacto?')) return;
    await fetch(`/api/contacts?id=${contactId}`, { method: 'DELETE' });
    setSelectedContact(null);
    loadData(search);
  };


  const parsePhones = (phones: string): string[] => {
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
  };

  const getDocTypeLabel = (type: string) => {
    return DOC_TYPES.find(d => d.value === type)?.label || type;
  };

  if (loading) return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="text-stone-400">Cargando...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-4">
          <img src="/logo.png" alt="Castle Solutions" className="h-14 w-auto" />
          <div className="flex gap-2 justify-center">
            <button onClick={() => setView('clients')} className={`px-5 py-2 rounded-lg font-medium transition shadow-md ${view === 'clients' ? 'bg-gradient-to-b from-amber-500 to-amber-600 text-white shadow-amber-300' : 'bg-gradient-to-b from-amber-100 to-amber-200 text-amber-800 hover:from-amber-200 hover:to-amber-300'}`}>Clientes</button>
            <button onClick={() => setView('properties')} className={`px-5 py-2 rounded-lg font-medium transition shadow-md ${view === 'properties' ? 'bg-gradient-to-b from-amber-500 to-amber-600 text-white shadow-amber-300' : 'bg-gradient-to-b from-amber-100 to-amber-200 text-amber-800 hover:from-amber-200 hover:to-amber-300'}`}>Propiedades</button>
            <button onClick={() => setView('familia')} className={`px-5 py-2 rounded-lg font-medium transition shadow-md ${view === 'familia' ? 'bg-gradient-to-b from-amber-500 to-amber-600 text-white shadow-amber-300' : 'bg-gradient-to-b from-amber-100 to-amber-200 text-amber-800 hover:from-amber-200 hover:to-amber-300'}`}>Familia</button>
            <Link href="/gastos" className="px-5 py-2 rounded-lg font-medium transition shadow-md bg-gradient-to-b from-amber-100 to-amber-200 text-amber-800 hover:from-amber-200 hover:to-amber-300">Gastos</Link>
            <Link href="/calendario" className="px-5 py-2 rounded-lg font-medium transition shadow-md bg-gradient-to-b from-amber-100 to-amber-200 text-amber-800 hover:from-amber-200 hover:to-amber-300">Calendario</Link>
            <Link href="/contratos" className="px-5 py-2 rounded-lg font-medium transition shadow-md bg-gradient-to-b from-amber-100 to-amber-200 text-amber-800 hover:from-amber-200 hover:to-amber-300">Contratos</Link>
            <Link href="/facturacion" className="px-5 py-2 rounded-lg font-medium transition shadow-md bg-gradient-to-b from-amber-100 to-amber-200 text-amber-800 hover:from-amber-200 hover:to-amber-300">Facturación</Link>
          </div>
          {session?.user && (
            <div className="flex items-center gap-3 mt-3">
              <span className="text-sm text-stone-500">{session.user.email}</span>
              <button onClick={() => signOut()} className="text-sm text-red-500 hover:text-red-700 font-medium">Cerrar sesión</button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* Search */}
        <div className="mb-6">
          <div className="flex gap-2 w-full">
            <input type="text" placeholder="Buscar cliente, propiedad, direccion, notas..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 px-4 py-3 text-lg border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500" />
            <button onClick={startVoiceSearch} className={`px-4 py-3 rounded-lg text-xl transition ${listening ? 'bg-red-500 text-white animate-pulse' : 'bg-stone-100 hover:bg-stone-200 border border-stone-300'}`} title="Búsqueda por voz">🎤</button>
          </div>
        </div>



        {/* Client Form Modal */}
        {showClientForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Nuevo Cliente</h2>
              <form onSubmit={createClient} className="space-y-4">
                <input required placeholder="Nombre completo" value={clientData.name} onChange={e => setClientData({...clientData, name: e.target.value})} className="w-full border rounded p-2" />
                <input required placeholder="Telefono" value={clientData.phone} onChange={e => setClientData({...clientData, phone: e.target.value})} className="w-full border rounded p-2" />
                <input placeholder="Email (opcional)" type="email" value={clientData.email} onChange={e => setClientData({...clientData, email: e.target.value})} className="w-full border rounded p-2" />
                <textarea placeholder="Notas (opcional)" value={clientData.notes} onChange={e => setClientData({...clientData, notes: e.target.value})} className="w-full border rounded p-2" rows={3} />
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 bg-stone-800 text-white py-2 rounded hover:bg-stone-700">Crear</button>
                  <button type="button" onClick={() => setShowClientForm(false)} className="flex-1 bg-stone-200 py-2 rounded hover:bg-stone-300">Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Property Form Modal */}
        {showPropertyForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">Nueva Propiedad</h2>
              <form onSubmit={createProperty} className="space-y-4">
                <input required placeholder="Nombre/Alias de la propiedad" value={propertyData.name} onChange={e => setPropertyData({...propertyData, name: e.target.value})} className="w-full border rounded p-2" />
                <input required placeholder="Direccion completa" value={propertyData.address} onChange={e => setPropertyData({...propertyData, address: e.target.value})} className="w-full border rounded p-2" />
                <select required value={propertyData.clientId} onChange={e => setPropertyData({...propertyData, clientId: e.target.value})} className="w-full border rounded p-2">
                  <option value="">Seleccionar Cliente</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <div className="grid grid-cols-2 gap-4">
                  <select value={propertyData.propertyType} onChange={e => setPropertyData({...propertyData, propertyType: e.target.value})} className="border rounded p-2">
                    <option value="casa">Casa</option>
                    <option value="departamento">Departamento</option>
                    <option value="local">Local</option>
                    <option value="otro">Otro</option>
                  </select>
                  <select value={propertyData.regime} onChange={e => setPropertyData({...propertyData, regime: e.target.value})} className="border rounded p-2">
                    <option value="independiente">Independiente</option>
                    <option value="condominio">Condominio</option>
                  </select>
                </div>
                {propertyData.regime === 'condominio' && (
                  <div className="space-y-4 p-4 bg-amber-50 rounded-lg">
                    <p className="text-sm text-amber-800 font-medium">Datos del Condominio</p>
                    <input placeholder="Nombre del condominio" value={propertyData.condoName} onChange={e => setPropertyData({...propertyData, condoName: e.target.value})} className="w-full border rounded p-2" />
                    <input placeholder="Administrador del condominio" value={propertyData.condoAdminName} onChange={e => setPropertyData({...propertyData, condoAdminName: e.target.value})} className="w-full border rounded p-2" />
                    <input placeholder="Telefono administrador" value={propertyData.condoAdminPhone} onChange={e => setPropertyData({...propertyData, condoAdminPhone: e.target.value})} className="w-full border rounded p-2" />
                    <input placeholder="Cuota/Mantenimiento" value={propertyData.condoFee} onChange={e => setPropertyData({...propertyData, condoFee: e.target.value})} className="w-full border rounded p-2" />
                  </div>
                )}
                <textarea placeholder="Notas (opcional)" value={propertyData.notes} onChange={e => setPropertyData({...propertyData, notes: e.target.value})} className="w-full border rounded p-2" rows={3} />
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 bg-amber-600 text-white py-2 rounded hover:bg-amber-700">Crear</button>
                  <button type="button" onClick={() => setShowPropertyForm(false)} className="flex-1 bg-stone-200 py-2 rounded hover:bg-stone-300">Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Contact Form Modal */}
        {showContactForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Nuevo Contacto</h2>
              <form onSubmit={createContact} className="space-y-4">
                <input required placeholder="Nombre completo" value={contactData.name} onChange={e => setContactData({...contactData, name: e.target.value})} className="w-full border rounded p-2" />
                <input required placeholder="Telefono" value={contactData.phone} onChange={e => setContactData({...contactData, phone: e.target.value})} className="w-full border rounded p-2" />
                <input placeholder="Email (opcional)" type="email" value={contactData.email} onChange={e => setContactData({...contactData, email: e.target.value})} className="w-full border rounded p-2" />
                <select value={contactData.category} onChange={e => setContactData({...contactData, category: e.target.value})} className="w-full border rounded p-2">
                  {CONTACT_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                <input placeholder="Cumpleaños (opcional)" value={contactData.birthday} onChange={e => setContactData({...contactData, birthday: e.target.value})} className="w-full border rounded p-2" />
                <input placeholder="Direccion (opcional)" value={contactData.address} onChange={e => setContactData({...contactData, address: e.target.value})} className="w-full border rounded p-2" />
                <textarea placeholder="Notas (opcional)" value={contactData.notes} onChange={e => setContactData({...contactData, notes: e.target.value})} className="w-full border rounded p-2" rows={3} />
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 bg-rose-600 text-white py-2 rounded hover:bg-rose-700">Crear</button>
                  <button type="button" onClick={() => setShowContactForm(false)} className="flex-1 bg-stone-200 py-2 rounded hover:bg-stone-300">Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        )}


        {/* Client Detail Modal */}
        {selectedClient && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedClient(null)}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <h2 className="text-2xl font-semibold mb-2">{selectedClient.name}</h2>
              <div className="space-y-3 mb-4">
                {parsePhones(selectedClient.phones).map((phone, i) => (
                  <a key={i} href={`tel:${phone}`} className="flex items-center gap-2 text-stone-700 hover:text-amber-600">📞 {phone}</a>
                ))}
                {selectedClient.email && <a href={`mailto:${selectedClient.email}`} className="flex items-center gap-2 text-stone-700 hover:text-amber-600">✉️ {selectedClient.email}</a>}
              </div>
              {selectedClient.notes && <p className="text-stone-600 bg-stone-50 p-3 rounded mb-4">{selectedClient.notes}</p>}
              
              {/* Documents Section */}
              <div className="border-t pt-4 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium">📄 Documentos ({clientDocs.length})</h3>
                  <button onClick={() => setShowDocUpload(true)} className="text-sm bg-amber-100 text-amber-700 px-3 py-1 rounded hover:bg-amber-200">+ Subir</button>
                </div>
                {clientDocs.length === 0 ? (
                  <p className="text-sm text-stone-400">Sin documentos</p>
                ) : (
                  <div className="space-y-2">
                    {clientDocs.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between bg-stone-50 p-2 rounded">
                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="flex-1 text-amber-600 hover:text-amber-700">
                          <span className="text-xs bg-stone-200 px-2 py-1 rounded mr-2">{getDocTypeLabel(doc.docType)}</span>
                          {doc.filename}
                        </a>
                        <div className="flex gap-1 ml-2">
                          <button onClick={() => shareViaWhatsApp(doc.url, getDocTypeLabel(doc.docType), doc.filename)} className="text-green-500 hover:text-green-600">↗</button>
                          <button onClick={() => deleteDocument(doc.id)} className="text-red-400 hover:text-red-600">✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-medium mb-2">🏠 Propiedades ({selectedClient.properties.length})</h3>
                {selectedClient.properties.map(p => (
                  <div key={p.id} className="border rounded p-3 mb-2">
                    <p className="font-medium">{p.name}</p>
                    <p className="text-sm text-stone-500">{p.address}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setSelectedClient(null)} className="flex-1 bg-stone-200 py-2 rounded hover:bg-stone-300">Cerrar</button>
                <button onClick={() => exportClientToPDF(selectedClient)} className="bg-purple-500 text-white px-3 py-2 rounded hover:bg-purple-600 text-sm">PDF</button>
                <button onClick={() => startEditClient(selectedClient)} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Editar</button>
                <button onClick={() => deleteClient(selectedClient.id)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Eliminar</button>
              </div>
            </div>
          </div>
        )}

        {/* Document Upload Modal */}
        {showDocUpload && selectedClient && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" onClick={() => setShowDocUpload(false)}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
              <h2 className="text-xl font-semibold mb-4">Subir Documento</h2>
              <p className="text-sm text-stone-500 mb-4">Cliente: {selectedClient.name}</p>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Tipo de documento</label>
                <select value={docType} onChange={e => setDocType(e.target.value)} className="w-full border rounded p-2">
                  {DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="mb-4">
                <UploadButton
                  endpoint="documentUploader"
                  onClientUploadComplete={(res) => {
                    if (res && res[0]) {
                      saveDocument(res[0].url, res[0].name);
                    }
                  }}
                  onUploadError={(error: Error) => {
                    alert(`Error: ${error.message}`);
                  }}
                />
              </div>
              <button onClick={() => setShowDocUpload(false)} className="w-full bg-stone-200 py-2 rounded hover:bg-stone-300">Cancelar</button>
            </div>
          </div>
        )}

        {/* Property Detail Modal */}
        {selectedProperty && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedProperty(null)}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
              <h2 className="text-2xl font-semibold mb-1">{selectedProperty.name}</h2>
              <p className="text-stone-500 mb-4">{selectedProperty.propertyType} · {selectedProperty.regime}</p>
              <a href={`https://maps.google.com/?q=${encodeURIComponent(selectedProperty.address)}`} target="_blank" className="flex items-center gap-2 text-amber-600 hover:text-amber-700 mb-4">📍 {selectedProperty.address}</a>
              {selectedProperty.client && (
                <div className="bg-stone-50 p-3 rounded mb-4">
                  <p className="text-sm text-stone-500">Propietario</p>
                  <p className="font-medium">{selectedProperty.client.name}</p>
                  {selectedProperty.client.phones && parsePhones(selectedProperty.client.phones).map((phone, i) => (
                    <a key={i} href={`tel:${phone}`} className="text-sm text-amber-600 block">📞 {phone}</a>
                  ))}
                </div>
              )}
              {selectedProperty.regime === 'condominio' && selectedProperty.condoName && (
                <div className="bg-amber-50 p-3 rounded mb-4">
                  <p className="text-sm text-amber-800 font-medium">Condominio</p>
                  <p>{selectedProperty.condoName}</p>
                  {selectedProperty.condoAdminName && <p className="text-sm">Admin: {selectedProperty.condoAdminName}</p>}
                  {selectedProperty.condoAdminPhone && <a href={`tel:${selectedProperty.condoAdminPhone}`} className="text-sm text-amber-600 block">📞 {selectedProperty.condoAdminPhone}</a>}
                  {selectedProperty.condoFee && <p className="text-sm">Cuota: {selectedProperty.condoFee}</p>}
                </div>
              )}
              {selectedProperty.notes && <p className="text-stone-600 bg-stone-50 p-3 rounded mb-4">{selectedProperty.notes}</p>}
              
              {/* Photos Section */}
              <div className="border-t pt-4 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium">📷 Fotos ({propertyPhotos.length})</h3>
                  <button onClick={() => setShowPhotoUpload(true)} className="text-sm bg-amber-100 text-amber-700 px-3 py-1 rounded hover:bg-amber-200">+ Subir Foto</button>
                </div>
                {propertyPhotos.length === 0 ? (
                  <p className="text-sm text-stone-400">Sin fotos</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {propertyPhotos.map(photo => (
                      <div key={photo.id} className="relative group">
                        <img src={photo.url} alt="Propiedad" className="w-full h-24 object-cover rounded cursor-pointer" onClick={() => window.open(photo.url, '_blank')} />
                        <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                          <button onClick={() => shareViaWhatsApp(photo.url, 'Foto', selectedProperty?.name || '')} className="bg-green-500 text-white rounded-full w-6 h-6 text-xs">↗</button>
                          <button onClick={() => deletePhoto(photo.id)} className="bg-red-500 text-white rounded-full w-6 h-6 text-xs">✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <button onClick={() => setSelectedProperty(null)} className="flex-1 bg-stone-200 py-2 rounded hover:bg-stone-300">Cerrar</button>
                <button onClick={() => exportPropertyToPDF(selectedProperty)} className="bg-purple-500 text-white px-3 py-2 rounded hover:bg-purple-600 text-sm">PDF</button>
                <button onClick={() => startEditProperty(selectedProperty)} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Editar</button>
                <button onClick={() => deleteProperty(selectedProperty.id)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Eliminar</button>
              </div>
            </div>
          </div>
        )}

        {/* Photo Upload Modal */}
        {showPhotoUpload && selectedProperty && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" onClick={() => setShowPhotoUpload(false)}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
              <h2 className="text-xl font-semibold mb-4">Subir Foto</h2>
              <p className="text-sm text-stone-500 mb-4">Propiedad: {selectedProperty.name}</p>
              <div className="mb-4">
                <UploadButton
                  endpoint="documentUploader"
                  onClientUploadComplete={(res) => {
                    if (res && res[0]) {
                      savePhoto(res[0].url);
                    }
                  }}
                  onUploadError={(error: Error) => {
                    alert(`Error: ${error.message}`);
                  }}
                />
              </div>
              <button onClick={() => setShowPhotoUpload(false)} className="w-full bg-stone-200 py-2 rounded hover:bg-stone-300">Cancelar</button>
            </div>
          </div>
        )}

        {/* Lists */}
        {view === 'clients' && (
          <div className="grid gap-4">
            <button onClick={() => setShowClientForm(true)} className="w-full py-3 border-2 border-dashed border-stone-300 rounded-lg text-stone-500 hover:border-stone-400 hover:text-stone-600 transition">+ Nuevo Cliente</button>
            {clients.length === 0 ? (
              <div className="text-center text-stone-400 py-8">No hay clientes aún.</div>
            ) : clients.map(client => (
              <div key={client.id} onClick={() => setSelectedClient(client)} className="bg-white rounded-lg shadow p-4 hover:shadow-md cursor-pointer transition">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{client.name}</h3>
                    <p className="text-stone-500">{parsePhones(client.phones).join(' · ')}</p>
                    {client.email && <p className="text-stone-400 text-sm">{client.email}</p>}
                  </div>
                  <span className="bg-stone-100 text-stone-600 px-2 py-1 rounded text-sm">{client.properties.length} prop.</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {view === 'properties' && (
          <div className="grid gap-4">
            <button onClick={() => setShowPropertyForm(true)} className="w-full py-3 border-2 border-dashed border-amber-300 rounded-lg text-amber-500 hover:border-amber-400 hover:text-amber-600 transition">+ Nueva Propiedad</button>
            {properties.length === 0 ? (
              <div className="text-center text-stone-400 py-8">No hay propiedades aún.</div>
            ) : properties.map(property => (
              <div key={property.id} onClick={() => setSelectedProperty(property)} className="bg-white rounded-lg shadow p-4 hover:shadow-md cursor-pointer transition">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{property.name}</h3>
                    <p className="text-stone-500">{property.address}</p>
                    {property.client && <p className="text-amber-600 text-sm">👤 {property.client.name}</p>}
                  </div>
                  <div className="text-right">
                    <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-sm">{property.propertyType}</span>
                    {property.regime === 'condominio' && <span className="block mt-1 text-xs text-stone-400">condominio</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {view === 'familia' && (
          <div className="grid gap-4">
            <button onClick={() => setShowContactForm(true)} className="w-full py-3 border-2 border-dashed border-rose-300 rounded-lg text-rose-500 hover:border-rose-400 hover:text-rose-600 transition">+ Nuevo Contacto</button>
            {contacts.length === 0 ? (
              <div className="text-center text-stone-400 py-8">No hay contactos aún.</div>
            ) : contacts.map(contact => (
              <div key={contact.id} onClick={() => setSelectedContact(contact)} className="bg-white rounded-lg shadow p-4 hover:shadow-md cursor-pointer transition">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{contact.name}</h3>
                    <p className="text-stone-500">{JSON.parse(contact.phones).join(' · ')}</p>
                    {contact.email && <p className="text-stone-400 text-sm">{contact.email}</p>}
                  </div>
                  <span className="bg-rose-100 text-rose-600 px-2 py-1 rounded text-sm">{contact.category}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      

        {/* Contact Detail Modal */}
        {selectedContact && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedContact(null)}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <h2 className="text-2xl font-semibold mb-2">{selectedContact.name}</h2>
              <span className="inline-block bg-rose-100 text-rose-600 px-2 py-1 rounded text-sm mb-4">{selectedContact.category}</span>
              <div className="space-y-3 mb-4">
                {JSON.parse(selectedContact.phones).map((phone: string, i: number) => (
                  <a key={i} href={`tel:${phone}`} className="flex items-center gap-2 text-stone-700 hover:text-rose-600">📞 {phone}</a>
                ))}
                {selectedContact.email && <a href={`mailto:${selectedContact.email}`} className="flex items-center gap-2 text-stone-700 hover:text-rose-600">✉️ {selectedContact.email}</a>}
                {selectedContact.birthday && <p className="text-stone-600">🎂 {selectedContact.birthday}</p>}
                {selectedContact.address && <p className="text-stone-600">📍 {selectedContact.address}</p>}
              </div>
              {selectedContact.notes && <p className="text-stone-600 bg-stone-50 p-3 rounded mb-4">{selectedContact.notes}</p>}
              <div className="flex gap-2 mt-4">
                <button onClick={() => setSelectedContact(null)} className="flex-1 bg-stone-200 py-2 rounded hover:bg-stone-300">Cerrar</button>
                <button onClick={() => startEditContact(selectedContact)} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Editar</button>
                <button onClick={() => deleteContact(selectedContact.id)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Eliminar</button>
              </div>
            </div>
          </div>
        )}
      </main>
      <InstallPrompt />
    </div>
  );
}
