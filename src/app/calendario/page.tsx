'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { UploadButton } from '@uploadthing/react';

interface Property {
  id: string;
  name: string;
  client: { name: string };
}

interface Reservation {
  id: string;
  propertyId: string;
  guestName: string;
  guestEmail: string | null;
  guestPhone: string | null;
  guestCountry: string | null;
  guestPassport: string | null;
  numGuests: number;
  checkIn: string;
  checkOut: string;
  platform: string;
  status: string;
  totalAmount: number | null;
  paidAmount: number | null;
  currency: string;
  notes: string | null;
  property: Property;
}

interface GuestDocument {
  id: string;
  reservationId: string;
  docType: string;
  filename: string;
  url: string;
}

const PLATFORMS = [
  { value: 'airbnb', label: 'Airbnb', color: 'bg-red-100 text-red-800' },
  { value: 'booking', label: 'Booking', color: 'bg-blue-100 text-blue-800' },
  { value: 'vrbo', label: 'VRBO', color: 'bg-purple-100 text-purple-800' },
  { value: 'directo', label: 'Directo', color: 'bg-green-100 text-green-800' },
];

const STATUSES = [
  { value: 'pendiente', label: 'Pendiente', color: 'bg-yellow-500' },
  { value: 'confirmada', label: 'Confirmada', color: 'bg-blue-500' },
  { value: 'checkin', label: 'Check-in', color: 'bg-green-500' },
  { value: 'checkout', label: 'Check-out', color: 'bg-stone-500' },
  { value: 'cancelada', label: 'Cancelada', color: 'bg-red-500' },
];

const DOC_TYPES = [
  { value: 'pasaporte', label: 'Pasaporte' },
  { value: 'visa', label: 'Visa' },
  { value: 'identificacion', label: 'Identificación' },
  { value: 'contrato', label: 'Contrato' },
  { value: 'otro', label: 'Otro' },
];

const COUNTRIES = ['USA', 'Canada', 'Mexico', 'UK', 'Germany', 'France', 'Spain', 'Australia', 'Brazil', 'Argentina', 'Colombia', 'Otro'];

export default function CalendarioPage() {
  const { data: session } = useSession();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [filterProperty, setFilterProperty] = useState('');
  const [guestDocs, setGuestDocs] = useState<GuestDocument[]>([]);
  const [newDocType, setNewDocType] = useState('pasaporte');
  
  const [formData, setFormData] = useState({
    propertyId: '', guestName: '', guestEmail: '', guestPhone: '', guestCountry: '',
    guestPassport: '', numGuests: '1', checkIn: '', checkOut: '', platform: 'directo',
    status: 'confirmada', totalAmount: '', paidAmount: '', currency: 'MXN', notes: ''
  });

  useEffect(() => { loadData(); }, [currentMonth, filterProperty]);

  const loadData = async () => {
    const monthStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
    const [resRes, propRes] = await Promise.all([
      fetch(`/api/reservations?month=${monthStr}${filterProperty ? `&propertyId=${filterProperty}` : ''}`),
      fetch('/api/properties')
    ]);
    setReservations(await resRes.json());
    setProperties(await propRes.json());
    setLoading(false);
  };

  const loadGuestDocs = async (reservationId: string) => {
    const res = await fetch(`/api/guest-documents?reservationId=${reservationId}`);
    const docs = await res.json();
    setGuestDocs(Array.isArray(docs) ? docs : []);
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

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const getReservationsForDay = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return reservations.filter(r => {
      const checkIn = new Date(r.checkIn);
      const checkOut = new Date(r.checkOut);
      return date >= new Date(checkIn.setHours(0,0,0,0)) && date <= new Date(checkOut.setHours(23,59,59,999));
    });
  };

  const submitReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = selectedReservation ? 'PUT' : 'POST';
    const body = selectedReservation ? { ...formData, id: selectedReservation.id } : formData;
    
    await fetch('/api/reservations', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    
    setShowForm(false);
    setSelectedReservation(null);
    setGuestDocs([]);
    resetForm();
    loadData();
  };

  const deleteReservation = async (id: string) => {
    if (!confirm('¿Eliminar esta reservación?')) return;
    await fetch(`/api/reservations?id=${id}`, { method: 'DELETE' });
    setSelectedReservation(null);
    setGuestDocs([]);
    loadData();
  };

  const resetForm = () => {
    setFormData({
      propertyId: '', guestName: '', guestEmail: '', guestPhone: '', guestCountry: '',
      guestPassport: '', numGuests: '1', checkIn: '', checkOut: '', platform: 'directo',
      status: 'confirmada', totalAmount: '', paidAmount: '', currency: 'MXN', notes: ''
    });
  };

  const openEditForm = (r: Reservation) => {
    setSelectedReservation(r);
    setFormData({
      propertyId: r.propertyId, guestName: r.guestName, guestEmail: r.guestEmail || '',
      guestPhone: r.guestPhone || '', guestCountry: r.guestCountry || '',
      guestPassport: r.guestPassport || '', numGuests: String(r.numGuests),
      checkIn: r.checkIn.split('T')[0], checkOut: r.checkOut.split('T')[0],
      platform: r.platform, status: r.status,
      totalAmount: r.totalAmount ? String(r.totalAmount) : '',
      paidAmount: r.paidAmount ? String(r.paidAmount) : '',
      currency: r.currency, notes: r.notes || ''
    });
    setShowForm(true);
    loadGuestDocs(r.id);
  };

  const { firstDay, daysInMonth } = getDaysInMonth();
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const totalIncome = reservations.reduce((sum, r) => sum + (r.totalAmount || 0), 0);
  const occupiedDays = new Set(reservations.flatMap(r => {
    const days: number[] = [];
    const start = new Date(r.checkIn);
    const end = new Date(r.checkOut);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (d.getMonth() === currentMonth.getMonth()) days.push(d.getDate());
    }
    return days;
  })).size;

  if (loading) return <div className="min-h-screen bg-stone-50 flex items-center justify-center"><p>Cargando...</p></div>;

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-2xl font-semibold">CASTLE <span className="text-amber-600 font-light">solutions</span></Link>
            <span className="text-stone-400">|</span>
            <h1 className="text-xl font-medium">Calendario de Reservaciones</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-stone-500">{session?.user?.email}</span>
            <Link href="/" className="text-sm text-stone-400 hover:text-stone-600">← Volver</Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm"><p className="text-sm text-stone-500">Reservaciones</p><p className="text-2xl font-semibold">{reservations.length}</p></div>
          <div className="bg-white rounded-lg p-4 shadow-sm"><p className="text-sm text-stone-500">Ingresos del Mes</p><p className="text-2xl font-semibold text-green-600">${totalIncome.toLocaleString()}</p></div>
          <div className="bg-white rounded-lg p-4 shadow-sm"><p className="text-sm text-stone-500">Días Ocupados</p><p className="text-2xl font-semibold text-amber-600">{occupiedDays}</p></div>
          <div className="bg-white rounded-lg p-4 shadow-sm"><p className="text-sm text-stone-500">Ocupación</p><p className="text-2xl font-semibold">{Math.round((occupiedDays / daysInMonth) * 100)}%</p></div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm mb-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-2 hover:bg-stone-100 rounded">←</button>
            <h2 className="text-xl font-semibold">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h2>
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-2 hover:bg-stone-100 rounded">→</button>
          </div>
          <div className="flex gap-3">
            <select value={filterProperty} onChange={e => setFilterProperty(e.target.value)} className="border rounded px-3 py-2 text-sm">
              <option value="">Todas las propiedades</option>
              {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <button onClick={() => { resetForm(); setSelectedReservation(null); setGuestDocs([]); setShowForm(true); }} className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 text-sm">+ Nueva Reservación</button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid grid-cols-7 bg-stone-100">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
              <div key={day} className="p-3 text-center text-sm font-medium text-stone-600">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} className="p-2 min-h-24 bg-stone-50" />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayReservations = getReservationsForDay(day);
              const isToday = new Date().toDateString() === new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString();
              return (
                <div key={day} className={`p-2 min-h-24 border-t border-l ${isToday ? 'bg-amber-50' : ''}`}>
                  <p className={`text-sm font-medium ${isToday ? 'text-amber-600' : 'text-stone-600'}`}>{day}</p>
                  <div className="mt-1 space-y-1">
                    {dayReservations.slice(0, 3).map(r => (
                      <button key={r.id} onClick={() => openEditForm(r)} className={`w-full text-left text-xs p-1 rounded truncate ${STATUSES.find(s => s.value === r.status)?.color} text-white`}>
                        {r.guestName.split(' ')[0]}
                      </button>
                    ))}
                    {dayReservations.length > 3 && <p className="text-xs text-stone-400">+{dayReservations.length - 3} más</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-8">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">{selectedReservation ? 'Editar' : 'Nueva'} Reservación</h2>
              <form onSubmit={submitReservation} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Propiedad *</label>
                    <select required value={formData.propertyId} onChange={e => setFormData({...formData, propertyId: e.target.value})} className="w-full border rounded p-2">
                      <option value="">Seleccionar...</option>
                      {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  
                  <div className="col-span-2 bg-stone-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-stone-600 mb-2">Información del Huésped</p>
                    <div className="grid grid-cols-2 gap-3">
                      <input required placeholder="Nombre completo *" value={formData.guestName} onChange={e => setFormData({...formData, guestName: e.target.value})} className="border rounded p-2" />
                      <input placeholder="Email" type="email" value={formData.guestEmail} onChange={e => setFormData({...formData, guestEmail: e.target.value})} className="border rounded p-2" />
                      <input placeholder="Teléfono" value={formData.guestPhone} onChange={e => setFormData({...formData, guestPhone: e.target.value})} className="border rounded p-2" />
                      <select value={formData.guestCountry} onChange={e => setFormData({...formData, guestCountry: e.target.value})} className="border rounded p-2">
                        <option value="">País de origen</option>
                        {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <input placeholder="No. Pasaporte" value={formData.guestPassport} onChange={e => setFormData({...formData, guestPassport: e.target.value})} className="border rounded p-2" />
                      <input type="number" min="1" placeholder="# Huéspedes" value={formData.numGuests} onChange={e => setFormData({...formData, numGuests: e.target.value})} className="border rounded p-2" />
                    </div>
                  </div>

                  <div><label className="block text-sm font-medium mb-1">Check-in *</label><input required type="date" value={formData.checkIn} onChange={e => setFormData({...formData, checkIn: e.target.value})} className="w-full border rounded p-2" /></div>
                  <div><label className="block text-sm font-medium mb-1">Check-out *</label><input required type="date" value={formData.checkOut} onChange={e => setFormData({...formData, checkOut: e.target.value})} className="w-full border rounded p-2" /></div>

                  <div><label className="block text-sm font-medium mb-1">Plataforma</label><select value={formData.platform} onChange={e => setFormData({...formData, platform: e.target.value})} className="w-full border rounded p-2">{PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}</select></div>
                  <div><label className="block text-sm font-medium mb-1">Status</label><select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full border rounded p-2">{STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</select></div>

                  <div><label className="block text-sm font-medium mb-1">Monto Total</label><div className="flex gap-2"><input type="number" step="0.01" placeholder="0.00" value={formData.totalAmount} onChange={e => setFormData({...formData, totalAmount: e.target.value})} className="flex-1 border rounded p-2" /><select value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})} className="w-20 border rounded p-2"><option value="MXN">MXN</option><option value="USD">USD</option></select></div></div>
                  <div><label className="block text-sm font-medium mb-1">Monto Pagado</label><input type="number" step="0.01" placeholder="0.00" value={formData.paidAmount} onChange={e => setFormData({...formData, paidAmount: e.target.value})} className="w-full border rounded p-2" /></div>

                  <div className="col-span-2"><label className="block text-sm font-medium mb-1">Notas</label><textarea placeholder="Notas adicionales..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full border rounded p-2" rows={2} /></div>

                  {selectedReservation && (
                    <div className="col-span-2 bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-blue-700 mb-2">Documentos del Huésped</p>
                      {guestDocs.length > 0 && (
                        <div className="mb-3 space-y-2">
                          {guestDocs.map(doc => (
                            <div key={doc.id} className="flex items-center justify-between bg-white p-2 rounded text-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-blue-600">📄</span>
                                <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{doc.filename}</a>
                                <span className="text-xs text-stone-400">({doc.docType})</span>
                              </div>
                              <button type="button" onClick={() => deleteGuestDoc(doc.id, selectedReservation.id)} className="text-red-400 hover:text-red-600">✕</button>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2 items-center">
                        <select value={newDocType} onChange={e => setNewDocType(e.target.value)} className="border rounded p-2 text-sm">{DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select>
                        <UploadButton endpoint="documentUploader" onClientUploadComplete={(res) => { if (res && res[0] && selectedReservation) saveGuestDoc(res[0].url, res[0].name, selectedReservation.id); }} onUploadError={(error: Error) => alert(`Error: ${error.message}`)} appearance={{ button: { background: '#2563eb', padding: '8px 16px', fontSize: '12px' } }} />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <button type="submit" className="flex-1 bg-amber-600 text-white py-2 rounded hover:bg-amber-700">{selectedReservation ? 'Guardar Cambios' : 'Crear Reservación'}</button>
                  {selectedReservation && <button type="button" onClick={() => deleteReservation(selectedReservation.id)} className="px-4 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200">Eliminar</button>}
                  <button type="button" onClick={() => { setShowForm(false); setSelectedReservation(null); setGuestDocs([]); }} className="px-4 py-2 bg-stone-200 rounded hover:bg-stone-300">Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
