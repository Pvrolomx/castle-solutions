'use client';

import { useEffect, useState } from 'react';
// import Image from 'next/image';

interface Client {
  id: string;
  name: string;
  phones: string;
  email: string | null;
  notes: string | null;
  properties: Property[];
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
}

export default function Home() {
  const [clients, setClients] = useState<Client[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'clients' | 'properties'>('clients');
  const [showClientForm, setShowClientForm] = useState(false);
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const [clientData, setClientData] = useState({ name: '', phone: '', email: '', notes: '' });
  const [propertyData, setPropertyData] = useState({
    name: '', address: '', clientId: '', propertyType: 'casa', regime: 'independiente',
    condoName: '', condoAdminName: '', condoAdminPhone: '', condoFee: '', notes: ''
  });

  const loadData = async (searchTerm = '') => {
    const query = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
    const [clientsRes, propsRes] = await Promise.all([
      fetch(`/api/clients${query}`),
      fetch(`/api/properties${query}`)
    ]);
    setClients(await clientsRes.json());
    setProperties(await propsRes.json());
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    const timer = setTimeout(() => { loadData(search); }, 300);
    return () => clearTimeout(timer);
  }, [search]);

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

  const parsePhones = (phones: string): string[] => {
    try { return JSON.parse(phones); } catch { return [phones]; }
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
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-semibold tracking-wide">CASTLE <span className="text-amber-600 font-light">solutions</span></span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowClientForm(true)} className="bg-stone-800 text-white px-4 py-2 rounded hover:bg-stone-700">+ Cliente</button>
            <button onClick={() => setShowPropertyForm(true)} className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700">+ Propiedad</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar cliente, propiedad, direccion, notas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 text-lg border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button onClick={() => setView('clients')} className={`px-6 py-2 rounded-lg font-medium ${view === 'clients' ? 'bg-stone-800 text-white' : 'bg-white text-stone-600 border'}`}>
            Clientes ({clients.length})
          </button>
          <button onClick={() => setView('properties')} className={`px-6 py-2 rounded-lg font-medium ${view === 'properties' ? 'bg-amber-600 text-white' : 'bg-white text-stone-600 border'}`}>
            Propiedades ({properties.length})
          </button>
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

        {/* Client Detail Modal */}
        {selectedClient && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedClient(null)}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
              <h2 className="text-2xl font-semibold mb-2">{selectedClient.name}</h2>
              <div className="space-y-3 mb-4">
                {parsePhones(selectedClient.phones).map((phone, i) => (
                  <a key={i} href={`tel:${phone}`} className="flex items-center gap-2 text-stone-700 hover:text-amber-600">
                    <span>📞</span> {phone}
                  </a>
                ))}
                {selectedClient.email && (
                  <a href={`mailto:${selectedClient.email}`} className="flex items-center gap-2 text-stone-700 hover:text-amber-600">
                    <span>✉️</span> {selectedClient.email}
                  </a>
                )}
              </div>
              {selectedClient.notes && <p className="text-stone-600 bg-stone-50 p-3 rounded mb-4">{selectedClient.notes}</p>}
              <div>
                <h3 className="font-medium mb-2">Propiedades ({selectedClient.properties.length})</h3>
                {selectedClient.properties.map(p => (
                  <div key={p.id} className="border rounded p-3 mb-2">
                    <p className="font-medium">{p.name}</p>
                    <p className="text-sm text-stone-500">{p.address}</p>
                  </div>
                ))}
              </div>
              <button onClick={() => setSelectedClient(null)} className="w-full mt-4 bg-stone-200 py-2 rounded hover:bg-stone-300">Cerrar</button>
            </div>
          </div>
        )}

        {/* Property Detail Modal */}
        {selectedProperty && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedProperty(null)}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
              <h2 className="text-2xl font-semibold mb-1">{selectedProperty.name}</h2>
              <p className="text-stone-500 mb-4">{selectedProperty.propertyType} · {selectedProperty.regime}</p>
              <a href={`https://maps.google.com/?q=${encodeURIComponent(selectedProperty.address)}`} target="_blank" className="flex items-center gap-2 text-amber-600 hover:text-amber-700 mb-4">
                <span>📍</span> {selectedProperty.address}
              </a>
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
              <button onClick={() => setSelectedProperty(null)} className="w-full mt-4 bg-stone-200 py-2 rounded hover:bg-stone-300">Cerrar</button>
            </div>
          </div>
        )}

        {/* Lists */}
        {view === 'clients' && (
          <div className="grid gap-4">
            {clients.length === 0 ? (
              <div className="text-center text-stone-400 py-12">No hay clientes. Crea el primero.</div>
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
            {properties.length === 0 ? (
              <div className="text-center text-stone-400 py-12">No hay propiedades. Crea la primera.</div>
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
      </main>
    </div>
  );
}
