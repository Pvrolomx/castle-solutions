'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Client {
  id: string;
  name: string;
  email: string | null;
  commissionType: string;
  commissionRate: number;
  properties: any[];
}

interface Invoice {
  id: string;
  clientId: string;
  period: string;
  totalIncome: number;
  totalExpenses: number;
  commission: number;
  netAmount: number;
  status: string;
  sentAt: string | null;
  client?: { name: string; email: string };
}

export default function FacturacionPage() {
  const { data: session } = useSession();
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [generating, setGenerating] = useState<string | null>(null);
  const [sending, setSending] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [configClient, setConfigClient] = useState<Client | null>(null);
  const [configRate, setConfigRate] = useState('15');
  const [configType, setConfigType] = useState('percentage');

  useEffect(() => { loadData(); }, [selectedPeriod]);

  const loadData = async () => {
    const [clientsRes, invoicesRes] = await Promise.all([
      fetch('/api/clients'),
      fetch(`/api/invoices?period=${selectedPeriod}`),
    ]);
    setClients(await clientsRes.json());
    setInvoices(await invoicesRes.json());
    setLoading(false);
  };

  const generateInvoice = async (clientId: string) => {
    setGenerating(clientId);
    await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, period: selectedPeriod }),
    });
    await loadData();
    setGenerating(null);
  };

  const sendInvoice = async (invoiceId: string) => {
    setSending(invoiceId);
    const res = await fetch('/api/send-invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoiceId }),
    });
    const data = await res.json();
    if (data.success) {
      alert('¡Email enviado al cliente!');
    } else {
      alert(data.error || 'Error al enviar');
    }
    await loadData();
    setSending(null);
  };

  const markAsPaid = async (invoiceId: string) => {
    await fetch('/api/invoices', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: invoiceId, status: 'paid' }),
    });
    loadData();
  };

  const openConfig = (client: Client) => {
    setConfigClient(client);
    setConfigRate(String(client.commissionRate));
    setConfigType(client.commissionType);
    setShowConfig(true);
  };

  const saveConfig = async () => {
    if (!configClient) return;
    await fetch('/api/clients', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: configClient.id,
        commissionType: configType,
        commissionRate: parseFloat(configRate),
      }),
    });
    setShowConfig(false);
    loadData();
  };

  const getInvoiceForClient = (clientId: string) => {
    return invoices.find(inv => inv.clientId === clientId);
  };

  const monthName = new Date(selectedPeriod + '-01').toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });

  const totalPending = invoices.filter(i => i.status === 'sent').reduce((sum, i) => sum + i.netAmount, 0);
  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.netAmount, 0);

  if (loading) return <div className="min-h-screen bg-stone-50 flex items-center justify-center"><p>Cargando...</p></div>;

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-2xl font-semibold">CASTLE <span className="text-amber-600 font-light">solutions</span></Link>
            <span className="text-stone-400">|</span>
            <h1 className="text-xl font-medium">Facturación</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-stone-500">{session?.user?.email}</span>
            <Link href="/" className="text-sm text-stone-400 hover:text-stone-600">← Volver</Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* Period Selector & Stats */}
        <div className="flex gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm flex items-center gap-3">
            <label className="text-sm text-stone-600">Periodo:</label>
            <input type="month" value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)} className="border rounded px-3 py-2" />
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm flex-1">
            <p className="text-sm text-stone-500">Por Cobrar</p>
            <p className="text-xl font-semibold text-amber-600">${totalPending.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm flex-1">
            <p className="text-sm text-stone-500">Cobrado</p>
            <p className="text-xl font-semibold text-green-600">${totalPaid.toLocaleString()}</p>
          </div>
        </div>

        {/* Clients List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="bg-stone-800 text-white px-5 py-3">
            <h2 className="font-semibold">Estados de Cuenta - {monthName}</h2>
          </div>
          
          <div className="divide-y">
            {clients.map(client => {
              const invoice = getInvoiceForClient(client.id);
              
              return (
                <div key={client.id} className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{client.name}</h3>
                      <p className="text-sm text-stone-500">{client.email || 'Sin email'}</p>
                      <p className="text-xs text-stone-400 mt-1">
                        Comisión: {client.commissionType === 'percentage' ? `${client.commissionRate}%` : `$${client.commissionRate} fijo`}
                        <button onClick={() => openConfig(client)} className="ml-2 text-amber-600 hover:underline">editar</button>
                      </p>
                    </div>
                    
                    <div className="text-right">
                      {!invoice ? (
                        <button 
                          onClick={() => generateInvoice(client.id)} 
                          disabled={generating === client.id}
                          className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 disabled:opacity-50"
                        >
                          {generating === client.id ? 'Generando...' : 'Generar Estado'}
                        </button>
                      ) : (
                        <div className="space-y-2">
                          <div className="text-right">
                            <span className={`text-xs px-2 py-1 rounded ${
                              invoice.status === 'draft' ? 'bg-stone-100 text-stone-600' :
                              invoice.status === 'sent' ? 'bg-blue-100 text-blue-600' :
                              'bg-green-100 text-green-600'
                            }`}>
                              {invoice.status === 'draft' ? 'Borrador' : invoice.status === 'sent' ? 'Enviado' : 'Pagado'}
                            </span>
                          </div>
                          
                          <div className="bg-stone-50 p-3 rounded text-sm">
                            <div className="flex justify-between"><span>Ingresos:</span><span className="text-green-600">+${invoice.totalIncome.toLocaleString()}</span></div>
                            <div className="flex justify-between"><span>Gastos:</span><span className="text-red-500">-${invoice.totalExpenses.toLocaleString()}</span></div>
                            <div className="flex justify-between"><span>Comisión:</span><span className="text-red-500">-${invoice.commission.toLocaleString()}</span></div>
                            <div className="flex justify-between font-semibold border-t mt-1 pt-1">
                              <span>Neto:</span>
                              <span className={invoice.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}>${invoice.netAmount.toLocaleString()}</span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 justify-end">
                            {invoice.status === 'draft' && client.email && (
                              <button 
                                onClick={() => sendInvoice(invoice.id)} 
                                disabled={sending === invoice.id}
                                className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                              >
                                {sending === invoice.id ? 'Enviando...' : 'Aprobar y Enviar'}
                              </button>
                            )}
                            {invoice.status === 'sent' && (
                              <button 
                                onClick={() => markAsPaid(invoice.id)} 
                                className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700"
                              >
                                Marcar Pagado
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Config Modal */}
        {showConfig && configClient && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-4">
              <h2 className="text-xl font-semibold mb-4">Configurar Comisión</h2>
              <p className="text-sm text-stone-500 mb-4">{configClient.name}</p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Tipo</label>
                <select value={configType} onChange={e => setConfigType(e.target.value)} className="w-full border rounded p-2">
                  <option value="percentage">Porcentaje</option>
                  <option value="fixed">Monto Fijo</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  {configType === 'percentage' ? 'Porcentaje (%)' : 'Monto Fijo ($)'}
                </label>
                <input type="number" step="0.01" value={configRate} onChange={e => setConfigRate(e.target.value)} className="w-full border rounded p-2" />
              </div>
              
              <div className="flex gap-2">
                <button onClick={saveConfig} className="flex-1 bg-amber-600 text-white py-2 rounded hover:bg-amber-700">Guardar</button>
                <button onClick={() => setShowConfig(false)} className="px-4 py-2 bg-stone-200 rounded hover:bg-stone-300">Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
