'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Payment { id: string; amount: number; paidDate: string; period: string; }
interface Expense { id: string; type: string; name: string; amount: number; periodicity: string; payments: Payment[]; }
interface Reservation { id: string; guestName: string; checkIn: string; checkOut: string; totalAmount: number | null; status: string; platform: string; }
interface Property { id: string; name: string; address: string; expenses: Expense[]; reservations: Reservation[]; }
interface Client { id: string; name: string; properties: Property[]; }

const EXPENSE_LABELS: Record<string, string> = {
  luz: 'Luz', agua: 'Agua', gas: 'Gas', telefono: 'Teléfono', internet: 'Internet',
  predial: 'Predial', fideicomiso: 'Fideicomiso', mantenimiento: 'Mantenimiento', otro: 'Otro'
};

export default function ClientePortal() {
  const params = useParams();
  const token = params.token as string;
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    loadClientData();
  }, [token]);

  const loadClientData = async () => {
    try {
      const res = await fetch(`/api/client-portal/${token}`);
      if (!res.ok) {
        setError('Link inválido o expirado');
        setLoading(false);
        return;
      }
      const data = await res.json();
      setClient(data);
    } catch (e) {
      setError('Error al cargar datos');
    }
    setLoading(false);
  };

  const getMonthExpenses = (property: Property) => {
    return property.expenses.reduce((sum, exp) => {
      const monthMultiplier = exp.periodicity === 'mensual' ? 1 : 
        exp.periodicity === 'bimestral' ? 0.5 : 
        exp.periodicity === 'trimestral' ? 0.33 : 
        exp.periodicity === 'anual' ? 0.083 : 1;
      return sum + (exp.amount * monthMultiplier);
    }, 0);
  };

  const getMonthIncome = (property: Property) => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    
    return property.reservations
      .filter(r => {
        const checkIn = new Date(r.checkIn);
        return checkIn >= startDate && checkIn <= endDate && r.status !== 'cancelada';
      })
      .reduce((sum, r) => sum + (r.totalAmount || 0), 0);
  };

  const exportToPDF = () => {
    // Simple PDF generation using jsPDF
    import('jspdf').then(({ jsPDF }) => {
      const doc = new jsPDF();
      const monthName = new Date(selectedMonth + '-01').toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
      
      doc.setFontSize(20);
      doc.text('CASTLE Solutions', 105, 20, { align: 'center' });
      doc.setFontSize(14);
      doc.text(`Estado de Cuenta - ${monthName}`, 105, 30, { align: 'center' });
      doc.setFontSize(12);
      doc.text(`Cliente: ${client?.name}`, 20, 45);
      
      let y = 60;
      let totalIngresos = 0;
      let totalGastos = 0;
      
      client?.properties.forEach(prop => {
        const ingresos = getMonthIncome(prop);
        const gastos = getMonthExpenses(prop);
        totalIngresos += ingresos;
        totalGastos += gastos;
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(prop.name, 20, y);
        y += 7;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Ingresos: $${ingresos.toLocaleString()}`, 25, y);
        y += 5;
        doc.text(`Gastos: $${gastos.toLocaleString()}`, 25, y);
        y += 5;
        doc.text(`Balance: $${(ingresos - gastos).toLocaleString()}`, 25, y);
        y += 10;
      });
      
      y += 5;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('RESUMEN TOTAL', 20, y);
      y += 8;
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Ingresos: $${totalIngresos.toLocaleString()}`, 25, y);
      y += 6;
      doc.text(`Total Gastos: $${totalGastos.toLocaleString()}`, 25, y);
      y += 6;
      doc.text(`Balance Final: $${(totalIngresos - totalGastos).toLocaleString()}`, 25, y);
      
      doc.save(`estado_cuenta_${selectedMonth}.pdf`);
    });
  };

  if (loading) return <div className="min-h-screen bg-stone-100 flex items-center justify-center"><p className="text-stone-600">Cargando...</p></div>;
  if (error) return <div className="min-h-screen bg-stone-100 flex items-center justify-center"><p className="text-red-600">{error}</p></div>;
  if (!client) return null;

  const totalIngresos = client.properties.reduce((sum, p) => sum + getMonthIncome(p), 0);
  const totalGastos = client.properties.reduce((sum, p) => sum + getMonthExpenses(p), 0);
  const balance = totalIngresos - totalGastos;

  return (
    <div className="min-h-screen bg-stone-100">
      <header className="bg-gradient-to-r from-amber-600 to-amber-500 text-white px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">CASTLE <span className="font-light">solutions</span></h1>
          <p className="text-amber-100">Estado de Cuenta</p>
          <p className="text-2xl font-semibold mt-4">{client.name}</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 -mt-4">
        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <label className="text-sm text-stone-600">Periodo:</label>
            <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="border rounded px-3 py-2" />
          </div>
          <button onClick={exportToPDF} className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 text-sm">Descargar PDF</button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg p-5 shadow-sm">
            <p className="text-sm text-stone-500 mb-1">Total Ingresos</p>
            <p className="text-2xl font-bold text-green-600">${totalIngresos.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg p-5 shadow-sm">
            <p className="text-sm text-stone-500 mb-1">Total Gastos</p>
            <p className="text-2xl font-bold text-red-500">${totalGastos.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg p-5 shadow-sm">
            <p className="text-sm text-stone-500 mb-1">Balance</p>
            <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>${balance.toLocaleString()}</p>
          </div>
        </div>

        {/* Properties Detail */}
        {client.properties.map(property => {
          const propIngresos = getMonthIncome(property);
          const propGastos = getMonthExpenses(property);
          const propBalance = propIngresos - propGastos;
          
          return (
            <div key={property.id} className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden">
              <div className="bg-stone-800 text-white px-5 py-3">
                <h3 className="font-semibold">{property.name}</h3>
                <p className="text-sm text-stone-300">{property.address}</p>
              </div>
              
              <div className="p-5">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-green-50 rounded">
                    <p className="text-xs text-stone-500">Ingresos</p>
                    <p className="font-semibold text-green-600">${propIngresos.toLocaleString()}</p>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded">
                    <p className="text-xs text-stone-500">Gastos</p>
                    <p className="font-semibold text-red-500">${propGastos.toLocaleString()}</p>
                  </div>
                  <div className={`text-center p-3 rounded ${propBalance >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                    <p className="text-xs text-stone-500">Balance</p>
                    <p className={`font-semibold ${propBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>${propBalance.toLocaleString()}</p>
                  </div>
                </div>

                {/* Expenses */}
                {property.expenses.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-stone-600 mb-2">Gastos Fijos</p>
                    <div className="space-y-1">
                      {property.expenses.map(exp => (
                        <div key={exp.id} className="flex justify-between text-sm py-1 border-b border-stone-100">
                          <span className="text-stone-600">{EXPENSE_LABELS[exp.type] || exp.name}</span>
                          <span className="text-stone-800">${exp.amount.toLocaleString()} <span className="text-xs text-stone-400">/{exp.periodicity}</span></span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reservations */}
                {property.reservations.filter(r => {
                  const [year, month] = selectedMonth.split('-').map(Number);
                  const checkIn = new Date(r.checkIn);
                  return checkIn.getMonth() === month - 1 && checkIn.getFullYear() === year;
                }).length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-stone-600 mb-2">Ingresos (Reservaciones)</p>
                    <div className="space-y-1">
                      {property.reservations.filter(r => {
                        const [year, month] = selectedMonth.split('-').map(Number);
                        const checkIn = new Date(r.checkIn);
                        return checkIn.getMonth() === month - 1 && checkIn.getFullYear() === year && r.status !== 'cancelada';
                      }).map(res => (
                        <div key={res.id} className="flex justify-between text-sm py-1 border-b border-stone-100">
                          <span className="text-stone-600">{res.guestName} <span className="text-xs text-stone-400">({res.platform})</span></span>
                          <span className="text-green-600">${(res.totalAmount || 0).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        <p className="text-center text-xs text-stone-400 mt-8">
          Generado por CASTLE Solutions • {new Date().toLocaleDateString('es-MX')}
        </p>
      </main>
    </div>
  );
}
