'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

interface Client {
  id: string;
  name: string;
  phones: string;
  email: string | null;
  properties: Property[];
}

interface Property {
  id: string;
  name: string;
  address: string;
  propertyType: string;
  client?: { name: string };
}

export default function HomePage() {
  const { data: session } = useSession();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);

  const loadClients = async () => {
    setLoading(true);
    const res = await fetch('/api/clients');
    setClients(await res.json() || []);
    setLoading(false);
  };

  const loadProperties = async () => {
    setLoading(true);
    const res = await fetch('/api/properties');
    setProperties(await res.json() || []);
    setLoading(false);
  };

  const handleSectionClick = async (section: string) => {
    if (activeSection === section) {
      setActiveSection(null);
    } else {
      setActiveSection(section);
      if (section === 'clientes') await loadClients();
      if (section === 'propiedades') await loadProperties();
    }
  };

  const parsePhones = (phones: string): string[] => {
    try {
      return JSON.parse(phones);
    } catch {
      return [phones];
    }
  };

  return (
    <div className="min-h-screen bg-stone-100">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 pt-6 pb-4 px-6">
        <div className="max-w-lg mx-auto text-center">
          <img src="/logo.png" alt="Castle Solutions" className="h-16 mx-auto mb-2" />
          <p className="text-stone-500 text-sm">Administración de Propiedades</p>
          {session?.user && (
            <div className="mt-2 flex items-center justify-center gap-3">
              <span className="text-xs text-stone-400">{session.user.email}</span>
              <button onClick={() => signOut()} className="text-xs text-red-500 hover:text-red-700">Salir</button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 max-w-lg mx-auto">
        {!activeSection ? (
          <div className="grid grid-cols-2 gap-4">
            {/* Clientes */}
            <button onClick={() => handleSectionClick('clientes')}
              className="bg-white rounded-3xl overflow-hidden shadow-lg border border-stone-200 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 active:scale-95">
              <img src="/btn-clientes.jpg" alt="Clientes" className="w-full aspect-square object-cover" />
              <div className="p-3 text-center bg-gradient-to-t from-white to-transparent -mt-8 relative">
                <span className="text-stone-800 font-semibold text-lg block">Clientes</span>
                <span className="text-stone-400 text-xs">Propietarios</span>
              </div>
            </button>

            {/* Propiedades */}
            <button onClick={() => handleSectionClick('propiedades')}
              className="bg-white rounded-3xl overflow-hidden shadow-lg border border-stone-200 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 active:scale-95">
              <img src="/btn-propiedades.jpg" alt="Propiedades" className="w-full aspect-square object-cover" />
              <div className="p-3 text-center bg-gradient-to-t from-white to-transparent -mt-8 relative">
                <span className="text-stone-800 font-semibold text-lg block">Propiedades</span>
                <span className="text-stone-400 text-xs">Casas y deptos</span>
              </div>
            </button>

            {/* Gastos */}
            <Link href="/gastos"
              className="bg-white rounded-3xl overflow-hidden shadow-lg border border-stone-200 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 active:scale-95">
              <img src="/btn-gastos.jpg" alt="Gastos" className="w-full aspect-square object-cover" />
              <div className="p-3 text-center bg-gradient-to-t from-white to-transparent -mt-8 relative">
                <span className="text-stone-800 font-semibold text-lg block">Gastos</span>
                <span className="text-stone-400 text-xs">Control financiero</span>
              </div>
            </Link>

            {/* Calendario */}
            <Link href="/calendario"
              className="bg-white rounded-3xl overflow-hidden shadow-lg border border-stone-200 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 active:scale-95">
              <img src="/btn-calendario.jpg" alt="Calendario" className="w-full aspect-square object-cover" />
              <div className="p-3 text-center bg-gradient-to-t from-white to-transparent -mt-8 relative">
                <span className="text-stone-800 font-semibold text-lg block">Calendario</span>
                <span className="text-stone-400 text-xs">Reservaciones</span>
              </div>
            </Link>

            {/* Contratos */}
            <Link href="/contratos"
              className="bg-white rounded-3xl overflow-hidden shadow-lg border border-stone-200 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 active:scale-95">
              <img src="/btn-contratos.jpg" alt="Contratos" className="w-full aspect-square object-cover" />
              <div className="p-3 text-center bg-gradient-to-t from-white to-transparent -mt-8 relative">
                <span className="text-stone-800 font-semibold text-lg block">Contratos</span>
                <span className="text-stone-400 text-xs">Documentos legales</span>
              </div>
            </Link>

            {/* Facturación */}
            <Link href="/facturacion"
              className="bg-white rounded-3xl overflow-hidden shadow-lg border border-stone-200 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 active:scale-95">
              <img src="/btn-facturacion.jpg" alt="Facturación" className="w-full aspect-square object-cover" />
              <div className="p-3 text-center bg-gradient-to-t from-white to-transparent -mt-8 relative">
                <span className="text-stone-800 font-semibold text-lg block">Facturación</span>
                <span className="text-stone-400 text-xs">Cobros y pagos</span>
              </div>
            </Link>
          </div>
        ) : (
          <div className="animate-fadeIn">
            {/* Back button */}
            <button onClick={() => setActiveSection(null)}
              className="mb-4 flex items-center gap-2 text-stone-500 hover:text-stone-800 transition">
              <span>←</span> <span>Volver</span>
            </button>

            {/* Clientes Section */}
            {activeSection === 'clientes' && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-stone-200">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <img src="/btn-clientes.jpg" alt="Clientes" className="w-12 h-12 rounded-xl object-cover" />
                    <h2 className="text-xl font-bold text-stone-800">Clientes</h2>
                  </div>
                  <Link href="/clients/new" className="px-4 py-2 bg-gradient-to-b from-amber-500 to-amber-600 text-white rounded-xl font-medium text-sm shadow-md hover:from-amber-600 hover:to-amber-700 transition">
                    + Nuevo
                  </Link>
                </div>
                
                {loading ? (
                  <p className="text-stone-400 text-center py-8">Cargando...</p>
                ) : clients.length === 0 ? (
                  <div className="text-center py-8">
                    <img src="/btn-clientes.jpg" alt="" className="w-20 h-20 mx-auto mb-3 rounded-2xl opacity-50" />
                    <p className="text-stone-500">No hay clientes</p>
                    <Link href="/clients/new" className="text-amber-600 font-medium mt-2 inline-block hover:underline">Agregar primero</Link>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {clients.map(c => (
                      <div key={c.id} className="p-4 bg-stone-50 hover:bg-amber-50 rounded-xl transition border border-stone-100 hover:border-amber-200">
                        <p className="font-medium text-stone-800">{c.name}</p>
                        <p className="text-sm text-stone-500">{parsePhones(c.phones).join(', ')} {c.email && `• ${c.email}`}</p>
                        <p className="text-xs text-stone-400 mt-1">{c.properties.length} propiedad(es)</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Propiedades Section */}
            {activeSection === 'propiedades' && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-stone-200">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <img src="/btn-propiedades.jpg" alt="Propiedades" className="w-12 h-12 rounded-xl object-cover" />
                    <h2 className="text-xl font-bold text-stone-800">Propiedades</h2>
                  </div>
                  <Link href="/properties/new" className="px-4 py-2 bg-gradient-to-b from-amber-500 to-amber-600 text-white rounded-xl font-medium text-sm shadow-md hover:from-amber-600 hover:to-amber-700 transition">
                    + Nueva
                  </Link>
                </div>
                
                {loading ? (
                  <p className="text-stone-400 text-center py-8">Cargando...</p>
                ) : properties.length === 0 ? (
                  <div className="text-center py-8">
                    <img src="/btn-propiedades.jpg" alt="" className="w-20 h-20 mx-auto mb-3 rounded-2xl opacity-50" />
                    <p className="text-stone-500">No hay propiedades</p>
                    <Link href="/properties/new" className="text-amber-600 font-medium mt-2 inline-block hover:underline">Agregar primero</Link>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {properties.map(p => (
                      <div key={p.id} className="p-4 bg-stone-50 hover:bg-amber-50 rounded-xl transition border border-stone-100 hover:border-amber-200">
                        <p className="font-medium text-stone-800">{p.name}</p>
                        <p className="text-sm text-stone-500">{p.address}</p>
                        <p className="text-xs text-stone-400 mt-1">{p.propertyType} {p.client && `• ${p.client.name}`}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center">
          <img src="/logo.png" alt="" className="h-8 mx-auto mb-2 opacity-30" />
          <p className="text-stone-400 text-sm">
            Hecho por <span className="text-amber-600">Colmena (C6)</span> • 2025
          </p>
        </footer>
      </main>

      
      {/* Chat Flotante */}
      <Link href="/chat" className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-50">
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </Link>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
