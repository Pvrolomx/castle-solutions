with open('/home/pvrolo/castle-solutions/src/app/gastos/page.tsx', 'r') as f:
    content = f.read()

# Add reminder state
old_state = "const [selectedPeriod, setSelectedPeriod] = useState(currentMonth);"
new_state = """const [selectedPeriod, setSelectedPeriod] = useState(currentMonth);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderEmail, setReminderEmail] = useState('');
  const [reminderPhone, setReminderPhone] = useState('');
  const [sendingReminder, setSendingReminder] = useState(false);"""

content = content.replace(old_state, new_state)

# Add send reminder function after exportToCSV
reminder_func = '''

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
  };'''

content = content.replace(
    "const blob = new Blob([csv], { type: 'text/csv' });\n    const url = URL.createObjectURL(blob);\n    const a = document.createElement('a');\n    a.href = url;\n    a.download = `gastos_${selectedPeriod}.csv`;\n    a.click();\n  };",
    "const blob = new Blob([csv], { type: 'text/csv' });\n    const url = URL.createObjectURL(blob);\n    const a = document.createElement('a');\n    a.href = url;\n    a.download = `gastos_${selectedPeriod}.csv`;\n    a.click();\n  };" + reminder_func
)

# Add reminder button next to export
old_buttons = '''<button onClick={exportToCSV} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm">Exportar CSV</button>
            <button onClick={() => setShowForm(true)} className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 text-sm">+ Agregar Gasto</button>'''

new_buttons = '''<button onClick={() => setShowReminderModal(true)} className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm">Recordatorios</button>
            <button onClick={exportToCSV} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm">Exportar CSV</button>
            <button onClick={() => setShowForm(true)} className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 text-sm">+ Agregar Gasto</button>'''

content = content.replace(old_buttons, new_buttons)

# Add reminder modal before closing main
reminder_modal = '''
        {/* Reminder Modal */}
        {showReminderModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Enviar Recordatorios</h2>
              <p className="text-sm text-stone-500 mb-4">
                Envía recordatorios de gastos próximos a vencer (5 días).
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input 
                    type="email" 
                    placeholder="tu@email.com" 
                    value={reminderEmail} 
                    onChange={e => setReminderEmail(e.target.value)} 
                    className="w-full border rounded p-2" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">WhatsApp (con código país)</label>
                  <input 
                    type="tel" 
                    placeholder="521234567890" 
                    value={reminderPhone} 
                    onChange={e => setReminderPhone(e.target.value)} 
                    className="w-full border rounded p-2" 
                  />
                  <p className="text-xs text-stone-400 mt-1">Ejemplo: 52 para México + tu número</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={sendReminders} 
                    disabled={sendingReminder || (!reminderEmail && !reminderPhone)}
                    className="flex-1 bg-purple-600 text-white py-2 rounded hover:bg-purple-700 disabled:opacity-50"
                  >
                    {sendingReminder ? 'Enviando...' : 'Enviar'}
                  </button>
                  <button 
                    onClick={() => setShowReminderModal(false)} 
                    className="flex-1 bg-stone-200 py-2 rounded hover:bg-stone-300"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
'''

# Insert before closing </main>
content = content.replace('</main>\n  );\n}', reminder_modal + '\n      </main>\n  );\n}')

with open('/home/pvrolo/castle-solutions/src/app/gastos/page.tsx', 'w') as f:
    f.write(content)

print('Reminder feature added to gastos page')
