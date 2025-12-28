'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Property {
  id: string;
  name: string;
  address: string;
  client: { name: string };
}

interface Payment {
  id: string;
  amount: number;
  paidDate: string;
  period: string;
}

interface Expense {
  id: string;
  propertyId: string;
  type: string;
  name: string;
  amount: number;
  periodicity: string;
  dueDay: number | null;
  dueMonth: number | null;
  accountNumber: string | null;
  property: Property;
  payments: Payment[];
}

const EXPENSE_TYPES = [
  { value: 'luz', label: 'Luz', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'agua', label: 'Agua', color: 'bg-blue-100 text-blue-800' },
  { value: 'gas', label: 'Gas', color: 'bg-orange-100 text-orange-800' },
  { value: 'telefono', label: 'Teléfono', color: 'bg-green-100 text-green-800' },
  { value: 'internet', label: 'Internet', color: 'bg-purple-100 text-purple-800' },
  { value: 'predial', label: 'Predial', color: 'bg-red-100 text-red-800' },
  { value: 'fideicomiso', label: 'Fideicomiso', color: 'bg-pink-100 text-pink-800' },
  { value: 'mantenimiento', label: 'Mantenimiento', color: 'bg-amber-100 text-amber-800' },
  { value: 'otro', label: 'Otro', color: 'bg-stone-100 text-stone-800' },
];

const PERIODICITIES = [
  { value: 'mensual', label: 'Mensual' },
  { value: 'bimestral', label: 'Bimestral' },
  { value: 'trimestral', label: 'Trimestral' },
  { value: 'semestral', label: 'Semestral' },
  { value: 'anual', label: 'Anual' },
];

export default function GastosPage() {
  const { data: session } = useSession();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState<Expense | null>(null);
  const [filterProperty, setFilterProperty] = useState('');
  const [filterType, setFilterType] = useState('');
  const [formData, setFormData] = useState({
    propertyId: '', type: 'luz', name: '', amount: '', periodicity: 'mensual',
    dueDay: '', accountNumber: '', notes: ''
  });

  const currentMonth = new Date().toISOString().slice(0, 7);
  const [selectedPeriod, setSelectedPeriod] = useState(currentMonth);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderEmail, setReminderEmail] = useState('');
  const [reminderPhone, setReminderPhone] = useState('');
  const [sendingReminder, setSendingReminder] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [expRes, propRes] = await Promise.all([
      fetch('/api/expenses'),
      fetch('/api/properties')
    ]);
    setExpenses(await expRes.json());
    setProperties(await propRes.json());
    setLoading(false);
  };

  const submitExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    setShowForm(false);
    setFormData({ propertyId: '', type: 'luz', name: '', amount: '', periodicity: 'mensual', dueDay: '', accountNumber: '', notes: '' });
    loadData();
  };

  const markAsPaid = async (expense: Expense) => {
    await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        expenseId: expense.id,
        amount: expense.amount,
        paidDate: new Date().toISOString(),
        period: selectedPeriod,
      }),
    });
    loadData();
  };

  const deleteExpense = async (id: string) => {
    if (!confirm('¿Eliminar este gasto?')) return;
    await fetch(`/api/expenses?id=${id}`, { method: 'DELETE' });
    loadData();
  };

  const isPaidForPeriod = (expense: Expense) => {
    return expense.payments.some(p => p.period === selectedPeriod);
  };

  const getTypeInfo = (type: string) => EXPENSE_TYPES.find(t => t.value === type) || EXPENSE_TYPES[8];

  const filteredExpenses = expenses.filter(e => {
    if (filterProperty && e.propertyId !== filterProperty) return false;
    if (filterType && e.type !== filterType) return false;
    return true;
  });

  const totalMensual = filteredExpenses.reduce((sum, e) => {
    const multiplier = e.periodicity === 'bimestral' ? 0.5 : e.periodicity === 'trimestral' ? 0.33 : e.periodicity === 'semestral' ? 0.17 : e.periodicity === 'anual' ? 0.083 : 1;
    return sum + (e.amount * multiplier);
  }, 0);

  const pendientes = filteredExpenses.filter(e => !isPaidForPeriod(e)).length;

  const exportToCSV = () => {
    const headers = ['Propiedad', 'Cliente', 'Tipo', 'Monto', 'Periodicidad', 'Vence Día', 'No. Cuenta', 'Status'];
    const rows = filteredExpenses.map(e => [
      e.property.name,
      e.property.client.name,
      getTypeInfo(e.type).label,
      e.amount,
      e.periodicity,
      e.dueDay || '-',
      e.accountNumber || '-',
      isPaidForPeriod(e) ? 'PAGADO' : 'PENDIENTE'
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gastos_${selectedPeriod}.csv`;
    a.click();
  };

  const sendReminders = async () => {
    setSendingReminder(true);
    try {
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: reminderEmail, phone: reminderPhone }),
      });
      const data = await res.json();
      
      if (data.success) {
        let message = 'Recordatorios procesados!';
        if (data.results?.email === 'sent') message += ' Email enviado.';
        if (data.results?.whatsapp) {
          window.open(data.results.whatsapp, '_blank');
        }
        alert(message);
        setShowReminderModal(false);
      } else {
        alert(data.message || 'No hay gastos próximos a vencer');
      }
    } catch (error) {
      alert('Error al enviar recordatorios');
    }
    setSendingReminder(false);
  };

  if (loading) return <div className="min-h-screen bg-stone-50 flex items-center justify-center"><p>Cargando...</p></div>;

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-2xl font-semibold">CASTLE <span className="text-amber-600 font-light">solutions</span></Link>
            <span className="text-stone-400">|</span>
            <h1 className="text-xl font-medium">Control de Gastos</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-stone-500">{session?.user?.email}</span>
            <Link href="/" className="text-sm text-stone-400 hover:text-stone-600">← Volver</Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-stone-500">Total Gastos</p>
            <p className="text-2xl font-semibold">{expenses.length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-stone-500">Est. Mensual</p>
            <p className="text-2xl font-semibold text-amber-600">${totalMensual.toLocaleString('es-MX', { minimumFractionDigits: 0 })}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-stone-500">Pendientes ({selectedPeriod})</p>
            <p className="text-2xl font-semibold text-red-600">{pendientes}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-stone-500">Pagados ({selectedPeriod})</p>
            <p className="text-2xl font-semibold text-green-600">{filteredExpenses.length - pendientes}</p>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="bg-white rounded-lg p-4 shadow-sm mb-6 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-3">
            <select value={filterProperty} onChange={e => setFilterProperty(e.target.value)} className="border rounded px-3 py-2 text-sm">
              <option value="">Todas las propiedades</option>
              {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="border rounded px-3 py-2 text-sm">
              <option value="">Todos los tipos</option>
              {EXPENSE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <input type="month" value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)} className="border rounded px-3 py-2 text-sm" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowReminderModal(true)} className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm">Recordatorios</button>
            <button onClick={exportToCSV} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm">Exportar CSV</button>
            <button onClick={() => setShowForm(true)} className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 text-sm">+ Agregar Gasto</button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-stone-100">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-stone-600">Propiedad</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-stone-600">Tipo</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-stone-600">Monto</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-stone-600">Periodicidad</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-stone-600">Vence</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-stone-600">Status</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-stone-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map(expense => {
                const typeInfo = getTypeInfo(expense.type);
                const paid = isPaidForPeriod(expense);
                return (
                  <tr key={expense.id} className={`border-t ${paid ? 'bg-green-50' : ''}`}>
                    <td className="px-4 py-3">
                      <p className="font-medium">{expense.property.name}</p>
                      <p className="text-xs text-stone-400">{expense.property.client.name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${typeInfo.color}`}>{typeInfo.label}</span>
                    </td>
                    <td className="px-4 py-3 font-medium">${expense.amount.toLocaleString('es-MX')}</td>
                    <td className="px-4 py-3 text-sm text-stone-600">{expense.periodicity}</td>
                    <td className="px-4 py-3 text-sm text-stone-600">{expense.dueDay ? `Día ${expense.dueDay}` : '-'}</td>
                    <td className="px-4 py-3">
                      {paid ? (
                        <span className="text-green-600 text-sm font-medium">✓ Pagado</span>
                      ) : (
                        <span className="text-red-500 text-sm">Pendiente</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        {!paid && (
                          <button onClick={() => markAsPaid(expense)} className="text-green-600 hover:text-green-800 text-sm">Pagar</button>
                        )}
                        <button onClick={() => deleteExpense(expense.id)} className="text-red-400 hover:text-red-600 text-sm">Eliminar</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredExpenses.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-stone-400">No hay gastos registrados</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Add Expense Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Agregar Gasto</h2>
              <form onSubmit={submitExpense} className="space-y-4">
                <select required value={formData.propertyId} onChange={e => setFormData({...formData, propertyId: e.target.value})} className="w-full border rounded p-2">
                  <option value="">Selecciona propiedad...</option>
                  {properties.map(p => <option key={p.id} value={p.id}>{p.name} - {p.client?.name}</option>)}
                </select>
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full border rounded p-2">
                  {EXPENSE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                {formData.type === 'otro' && (
                  <input placeholder="Nombre del gasto" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border rounded p-2" />
                )}
                <input required type="number" step="0.01" placeholder="Monto $" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full border rounded p-2" />
                <div className="grid grid-cols-2 gap-4">
                  <select value={formData.periodicity} onChange={e => setFormData({...formData, periodicity: e.target.value})} className="border rounded p-2">
                    {PERIODICITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                  <input type="number" min="1" max="31" placeholder="Día vencimiento" value={formData.dueDay} onChange={e => setFormData({...formData, dueDay: e.target.value})} className="border rounded p-2" />
                </div>
                <input placeholder="No. cuenta/servicio (opcional)" value={formData.accountNumber} onChange={e => setFormData({...formData, accountNumber: e.target.value})} className="w-full border rounded p-2" />
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 bg-amber-600 text-white py-2 rounded hover:bg-amber-700">Guardar</button>
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-stone-200 py-2 rounded hover:bg-stone-300">Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
