with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'r') as f:
    content = f.read()

# Add Familia button in header
old_buttons = '''<button onClick={() => setShowClientForm(true)} className="bg-stone-800 text-white px-4 py-2 rounded hover:bg-stone-700">+ Cliente</button>
          <button onClick={() => setShowPropertyForm(true)} className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700">+ Propiedad</button>'''
new_buttons = '''<button onClick={() => setShowClientForm(true)} className="bg-stone-800 text-white px-4 py-2 rounded hover:bg-stone-700">+ Cliente</button>
          <button onClick={() => setShowPropertyForm(true)} className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700">+ Propiedad</button>
          <button onClick={() => setShowContactForm(true)} className="bg-rose-600 text-white px-4 py-2 rounded hover:bg-rose-700">+ Familia</button>'''
content = content.replace(old_buttons, new_buttons)

# Add Familia tab
old_tabs = '''<button onClick={() => setView('clients')} className={`px-6 py-2 rounded-lg font-medium ${view === 'clients' ? 'bg-stone-800 text-white' : 'bg-white text-stone-600 border'}`}>Clientes ({clients.length})</button>
          <button onClick={() => setView('properties')} className={`px-6 py-2 rounded-lg font-medium ${view === 'properties' ? 'bg-amber-600 text-white' : 'bg-white text-stone-600 border'}`}>Propiedades ({properties.length})</button>'''
new_tabs = '''<button onClick={() => setView('clients')} className={`px-6 py-2 rounded-lg font-medium ${view === 'clients' ? 'bg-stone-800 text-white' : 'bg-white text-stone-600 border'}`}>Clientes ({clients.length})</button>
          <button onClick={() => setView('properties')} className={`px-6 py-2 rounded-lg font-medium ${view === 'properties' ? 'bg-amber-600 text-white' : 'bg-white text-stone-600 border'}`}>Propiedades ({properties.length})</button>
          <button onClick={() => setView('familia')} className={`px-6 py-2 rounded-lg font-medium ${view === 'familia' ? 'bg-rose-600 text-white' : 'bg-white text-stone-600 border'}`}>Familia ({contacts.length})</button>'''
content = content.replace(old_tabs, new_tabs)

# Add Contact Form Modal after Property Form Modal
contact_form = '''
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
'''

# Insert after Property Form Modal closing
content = content.replace(
    '</form>\n            </div>\n          </div>\n        )}\n\n        {/* Client Detail Modal */',
    '</form>\n            </div>\n          </div>\n        )}' + contact_form + '\n\n        {/* Client Detail Modal */'
)

with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'w') as f:
    f.write(content)

print('Part 2 done - UI buttons, tabs, form added')
