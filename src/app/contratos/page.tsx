'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { UploadButton } from '@uploadthing/react';

interface Template {
  id: string;
  name: string;
  filename: string;
  url: string;
  createdAt: string;
}

interface Reservation {
  id: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  property: { name: string };
}

interface Property {
  id: string;
  name: string;
  client: { name: string };
}

const AVAILABLE_VARIABLES = [
  { var: '{{FECHA_HOY}}', desc: 'Fecha actual (corta)' },
  { var: '{{FECHA_HOY_LARGO}}', desc: 'Fecha actual (larga)' },
  { var: '{{CLIENTE_NOMBRE}}', desc: 'Nombre del cliente' },
  { var: '{{CLIENTE_EMAIL}}', desc: 'Email del cliente' },
  { var: '{{CLIENTE_TELEFONO}}', desc: 'Teléfono del cliente' },
  { var: '{{PROPIEDAD_NOMBRE}}', desc: 'Nombre de la propiedad' },
  { var: '{{PROPIEDAD_DIRECCION}}', desc: 'Dirección' },
  { var: '{{PROPIEDAD_TIPO}}', desc: 'Tipo de propiedad' },
  { var: '{{HUESPED_NOMBRE}}', desc: 'Nombre del huésped' },
  { var: '{{HUESPED_EMAIL}}', desc: 'Email del huésped' },
  { var: '{{HUESPED_TELEFONO}}', desc: 'Teléfono del huésped' },
  { var: '{{HUESPED_PAIS}}', desc: 'País del huésped' },
  { var: '{{HUESPED_PASAPORTE}}', desc: 'No. pasaporte' },
  { var: '{{NUM_HUESPEDES}}', desc: 'Número de huéspedes' },
  { var: '{{CHECK_IN}}', desc: 'Fecha check-in' },
  { var: '{{CHECK_OUT}}', desc: 'Fecha check-out' },
  { var: '{{NOCHES}}', desc: 'Número de noches' },
  { var: '{{MONTO_TOTAL}}', desc: 'Monto total' },
  { var: '{{MONTO_PAGADO}}', desc: 'Monto pagado' },
  { var: '{{MONEDA}}', desc: 'Moneda (MXN/USD)' },
  { var: '{{PLATAFORMA}}', desc: 'Plataforma de reserva' },
];

export default function ContratosPage() {
  const { data: session } = useSession();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [showGenerate, setShowGenerate] = useState(false);
  const [showVariables, setShowVariables] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [generating, setGenerating] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [pendingUpload, setPendingUpload] = useState<{url: string, filename: string} | null>(null);
  
  const [genSource, setGenSource] = useState<'reservation' | 'property'>('reservation');
  const [genReservationId, setGenReservationId] = useState('');
  const [genPropertyId, setGenPropertyId] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [tplRes, resRes, propRes] = await Promise.all([
      fetch('/api/contract-templates'),
      fetch('/api/reservations'),
      fetch('/api/properties'),
    ]);
    setTemplates(await tplRes.json());
    setReservations(await resRes.json());
    setProperties(await propRes.json());
    setLoading(false);
  };

  const saveTemplate = async () => {
    if (!pendingUpload || !newTemplateName.trim()) return;
    
    await fetch('/api/contract-templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newTemplateName,
        filename: pendingUpload.filename,
        url: pendingUpload.url,
      }),
    });
    
    setShowUpload(false);
    setNewTemplateName('');
    setPendingUpload(null);
    loadData();
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm('¿Eliminar esta plantilla?')) return;
    await fetch(`/api/contract-templates?id=${id}`, { method: 'DELETE' });
    loadData();
  };

  const generateContract = async () => {
    if (!selectedTemplate) return;
    setGenerating(true);
    
    try {
      const body: any = { templateId: selectedTemplate.id };
      if (genSource === 'reservation' && genReservationId) {
        body.reservationId = genReservationId;
      } else if (genSource === 'property' && genPropertyId) {
        body.propertyId = genPropertyId;
      }
      
      const res = await fetch('/api/generate-contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      const result = await res.json();
      
      if (result.success) {
        // Download the template
        const templateRes = await fetch(result.templateUrl);
        const templateBlob = await templateRes.blob();
        const arrayBuffer = await templateBlob.arrayBuffer();
        
        // Use docxtemplater to process
        const PizZip = (await import('pizzip')).default;
        const Docxtemplater = (await import('docxtemplater')).default;
        
        const zip = new PizZip(arrayBuffer);
        const doc = new Docxtemplater(zip, {
          paragraphLoop: true,
          linebreaks: true,
          delimiters: { start: '{{', end: '}}' },
        });
        
        doc.setData(result.data);
        doc.render();
        
        const output = doc.getZip().generate({
          type: 'blob',
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });
        
        // Download the generated contract
        const url = URL.createObjectURL(output);
        const a = document.createElement('a');
        a.href = url;
        a.download = `contrato_${new Date().toISOString().split('T')[0]}.docx`;
        a.click();
        URL.revokeObjectURL(url);
        
        setShowGenerate(false);
        setSelectedTemplate(null);
        alert('¡Contrato generado y descargado!');
      }
    } catch (error) {
      console.error('Error generating contract:', error);
      alert('Error al generar contrato. Verifica que la plantilla tenga variables correctas.');
    }
    
    setGenerating(false);
  };

  if (loading) return <div className="min-h-screen bg-stone-50 flex items-center justify-center"><p>Cargando...</p></div>;

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-2xl font-semibold">CASTLE <span className="text-amber-600 font-light">solutions</span></Link>
            <span className="text-stone-400">|</span>
            <h1 className="text-xl font-medium">Generador de Contratos</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-stone-500">{session?.user?.email}</span>
            <Link href="/" className="text-sm text-stone-400 hover:text-stone-600">← Volver</Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        {/* Actions */}
        <div className="flex gap-3 mb-6">
          <button onClick={() => setShowUpload(true)} className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700">+ Subir Plantilla</button>
          <button onClick={() => setShowVariables(true)} className="bg-stone-200 px-4 py-2 rounded hover:bg-stone-300">Ver Variables</button>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-3 gap-4">
          {templates.map(tpl => (
            <div key={tpl.id} className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{tpl.name}</h3>
                  <p className="text-xs text-stone-400">{tpl.filename}</p>
                </div>
                <span className="text-2xl">📄</span>
              </div>
              <p className="text-xs text-stone-400 mb-3">
                Subido: {new Date(tpl.createdAt).toLocaleDateString('es-MX')}
              </p>
              <div className="flex gap-2">
                <button onClick={() => { setSelectedTemplate(tpl); setShowGenerate(true); }} className="flex-1 bg-green-600 text-white py-1.5 rounded text-sm hover:bg-green-700">Generar</button>
                <a href={tpl.url} target="_blank" className="px-3 py-1.5 bg-stone-100 rounded text-sm hover:bg-stone-200">Ver</a>
                <button onClick={() => deleteTemplate(tpl.id)} className="px-3 py-1.5 text-red-500 hover:bg-red-50 rounded text-sm">✕</button>
              </div>
            </div>
          ))}
          
          {templates.length === 0 && (
            <div className="col-span-3 text-center py-12 text-stone-400">
              <p className="text-4xl mb-2">📄</p>
              <p>No hay plantillas aún</p>
              <p className="text-sm">Sube tu primer machote de contrato</p>
            </div>
          )}
        </div>

        {/* Upload Modal */}
        {showUpload && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-semibold mb-4">Subir Plantilla</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Nombre de la plantilla</label>
                <input type="text" placeholder="Ej: Contrato Airbnb" value={newTemplateName} onChange={e => setNewTemplateName(e.target.value)} className="w-full border rounded p-2" />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Archivo (.docx)</label>
                {pendingUpload ? (
                  <div className="bg-green-50 p-3 rounded text-sm text-green-700">
                    ✓ {pendingUpload.filename}
                  </div>
                ) : (
                  <UploadButton
                    endpoint="documentUploader"
                    onClientUploadComplete={(res) => {
                      if (res && res[0]) {
                        setPendingUpload({ url: res[0].url, filename: res[0].name });
                      }
                    }}
                    onUploadError={(error: Error) => alert(`Error: ${error.message}`)}
                  />
                )}
              </div>
              
              <div className="flex gap-2">
                <button onClick={saveTemplate} disabled={!pendingUpload || !newTemplateName.trim()} className="flex-1 bg-amber-600 text-white py-2 rounded hover:bg-amber-700 disabled:opacity-50">Guardar</button>
                <button onClick={() => { setShowUpload(false); setPendingUpload(null); setNewTemplateName(''); }} className="px-4 py-2 bg-stone-200 rounded hover:bg-stone-300">Cancelar</button>
              </div>
            </div>
          </div>
        )}

        {/* Variables Modal */}
        {showVariables && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">Variables Disponibles</h2>
              <p className="text-sm text-stone-500 mb-4">Usa estas variables en tu documento Word. Se reemplazarán con los datos reales.</p>
              
              <div className="space-y-2">
                {AVAILABLE_VARIABLES.map(v => (
                  <div key={v.var} className="flex justify-between items-center py-2 border-b">
                    <code className="bg-amber-50 px-2 py-1 rounded text-sm text-amber-800">{v.var}</code>
                    <span className="text-sm text-stone-500">{v.desc}</span>
                  </div>
                ))}
              </div>
              
              <button onClick={() => setShowVariables(false)} className="w-full mt-4 bg-stone-200 py-2 rounded hover:bg-stone-300">Cerrar</button>
            </div>
          </div>
        )}

        {/* Generate Modal */}
        {showGenerate && selectedTemplate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-semibold mb-2">Generar Contrato</h2>
              <p className="text-sm text-stone-500 mb-4">Plantilla: {selectedTemplate.name}</p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Fuente de datos</label>
                <div className="flex gap-2">
                  <button onClick={() => setGenSource('reservation')} className={`flex-1 py-2 rounded ${genSource === 'reservation' ? 'bg-amber-600 text-white' : 'bg-stone-100'}`}>Reservación</button>
                  <button onClick={() => setGenSource('property')} className={`flex-1 py-2 rounded ${genSource === 'property' ? 'bg-amber-600 text-white' : 'bg-stone-100'}`}>Propiedad</button>
                </div>
              </div>
              
              {genSource === 'reservation' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Selecciona reservación</label>
                  <select value={genReservationId} onChange={e => setGenReservationId(e.target.value)} className="w-full border rounded p-2">
                    <option value="">-- Seleccionar --</option>
                    {reservations.map(r => (
                      <option key={r.id} value={r.id}>{r.guestName} - {r.property.name} ({new Date(r.checkIn).toLocaleDateString('es-MX')})</option>
                    ))}
                  </select>
                </div>
              )}
              
              {genSource === 'property' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Selecciona propiedad</label>
                  <select value={genPropertyId} onChange={e => setGenPropertyId(e.target.value)} className="w-full border rounded p-2">
                    <option value="">-- Seleccionar --</option>
                    {properties.map(p => (
                      <option key={p.id} value={p.id}>{p.name} - {p.client.name}</option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="flex gap-2">
                <button onClick={generateContract} disabled={generating || (genSource === 'reservation' && !genReservationId) || (genSource === 'property' && !genPropertyId)} className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50">
                  {generating ? 'Generando...' : 'Generar y Descargar'}
                </button>
                <button onClick={() => { setShowGenerate(false); setSelectedTemplate(null); }} className="px-4 py-2 bg-stone-200 rounded hover:bg-stone-300">Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
