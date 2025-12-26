'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Client {
  id: string;
  name: string;
}

export default function NewProperty() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    clientId: '',
    propertyType: 'casa',
    regime: 'independiente',
    condoName: '',
    condoAdminName: '',
    condoAdminPhone: '',
    condoFee: '',
    notes: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/clients').then(r => r.json()).then(setClients);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    await fetch('/api/properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    
    router.push('/');
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-amber-700">Nueva Propiedad</h1>
        <Link href="/" className="text-gray-600 hover:text-gray-800">← Volver</Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre / Alias *</label>
          <input
            required
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            placeholder="Casa Playa, Depto Centro, etc."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Direccion *</label>
          <input
            required
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            placeholder="Calle, numero, colonia..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cliente / Propietario *</label>
          <select
            required
            value={formData.clientId}
            onChange={(e) => setFormData({...formData, clientId: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
          >
            <option value="">Seleccionar cliente...</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select
              value={formData.propertyType}
              onChange={(e) => setFormData({...formData, propertyType: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            >
              <option value="casa">Casa</option>
              <option value="departamento">Departamento</option>
              <option value="local">Local comercial</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Regimen</label>
            <select
              value={formData.regime}
              onChange={(e) => setFormData({...formData, regime: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            >
              <option value="independiente">Independiente</option>
              <option value="condominio">Condominio</option>
            </select>
          </div>
        </div>

        {formData.regime === 'condominio' && (
          <div className="border-t pt-4 mt-4 space-y-4 bg-blue-50 -mx-6 px-6 py-4">
            <h3 className="font-medium text-blue-800">Datos del Condominio</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del condominio</label>
              <input
                type="text"
                value={formData.condoName}
                onChange={(e) => setFormData({...formData, condoName: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Torres del Mar, etc."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Administrador</label>
                <input
                  type="text"
                  value={formData.condoAdminName}
                  onChange={(e) => setFormData({...formData, condoAdminName: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Nombre"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tel. Administrador</label>
                <input
                  type="tel"
                  value={formData.condoAdminPhone}
                  onChange={(e) => setFormData({...formData, condoAdminPhone: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="322 123 4567"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cuota / Mantenimiento</label>
              <input
                type="text"
                value={formData.condoFee}
                onChange={(e) => setFormData({...formData, condoFee: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="$2,500 mensual"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg h-24"
            placeholder="Codigos de acceso, instrucciones especiales, ubicacion de llaves..."
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-amber-600 text-white py-3 rounded-lg font-medium hover:bg-amber-500 disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar Propiedad'}
          </button>
          <Link href="/" className="px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300 text-center">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
