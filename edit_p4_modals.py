with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'r') as f:
    content = f.read()

# Add Edit Modals after Contact Form Modal
edit_modals = '''

        {/* Edit Client Modal */}
        {editingClient && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">Editar Cliente</h2>
              <form onSubmit={updateClient} className="space-y-4">
                <input required placeholder="Nombre completo" value={editClientData.name} onChange={e => setEditClientData({...editClientData, name: e.target.value})} className="w-full border rounded p-2" />
                <div className="space-y-2">
                  <label className="text-sm text-stone-500">Teléfonos</label>
                  {editClientData.phones.map((phone, i) => (
                    <div key={i} className="flex gap-2">
                      <input placeholder="Teléfono" value={phone} onChange={e => updatePhoneField('editClient', i, e.target.value)} className="flex-1 border rounded p-2" />
                      {editClientData.phones.length > 1 && <button type="button" onClick={() => removePhoneField('editClient', i)} className="text-red-500 px-2">✕</button>}
                    </div>
                  ))}
                  <button type="button" onClick={() => addPhoneField('editClient')} className="text-sm text-blue-500">+ Agregar teléfono</button>
                </div>
                <input placeholder="Email (opcional)" type="email" value={editClientData.email} onChange={e => setEditClientData({...editClientData, email: e.target.value})} className="w-full border rounded p-2" />
                <textarea placeholder="Notas (opcional)" value={editClientData.notes} onChange={e => setEditClientData({...editClientData, notes: e.target.value})} className="w-full border rounded p-2" rows={3} />
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600">Guardar</button>
                  <button type="button" onClick={() => setEditingClient(null)} className="flex-1 bg-stone-200 py-2 rounded hover:bg-stone-300">Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Property Modal */}
        {editingProperty && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">Editar Propiedad</h2>
              <form onSubmit={updateProperty} className="space-y-4">
                <input required placeholder="Nombre/Alias" value={editPropertyData.name} onChange={e => setEditPropertyData({...editPropertyData, name: e.target.value})} className="w-full border rounded p-2" />
                <input required placeholder="Dirección completa" value={editPropertyData.address} onChange={e => setEditPropertyData({...editPropertyData, address: e.target.value})} className="w-full border rounded p-2" />
                <div className="grid grid-cols-2 gap-4">
                  <select value={editPropertyData.propertyType} onChange={e => setEditPropertyData({...editPropertyData, propertyType: e.target.value})} className="border rounded p-2">
                    <option value="casa">Casa</option>
                    <option value="departamento">Departamento</option>
                    <option value="local">Local</option>
                    <option value="otro">Otro</option>
                  </select>
                  <select value={editPropertyData.regime} onChange={e => setEditPropertyData({...editPropertyData, regime: e.target.value})} className="border rounded p-2">
                    <option value="independiente">Independiente</option>
                    <option value="condominio">Condominio</option>
                  </select>
                </div>
                {editPropertyData.regime === 'condominio' && (
                  <div className="space-y-4 p-4 bg-amber-50 rounded-lg">
                    <p className="text-sm text-amber-800 font-medium">Datos del Condominio</p>
                    <input placeholder="Nombre del condominio" value={editPropertyData.condoName} onChange={e => setEditPropertyData({...editPropertyData, condoName: e.target.value})} className="w-full border rounded p-2" />
                    <input placeholder="Administrador" value={editPropertyData.condoAdminName} onChange={e => setEditPropertyData({...editPropertyData, condoAdminName: e.target.value})} className="w-full border rounded p-2" />
                    <input placeholder="Teléfono administrador" value={editPropertyData.condoAdminPhone} onChange={e => setEditPropertyData({...editPropertyData, condoAdminPhone: e.target.value})} className="w-full border rounded p-2" />
                    <input placeholder="Cuota/Mantenimiento" value={editPropertyData.condoFee} onChange={e => setEditPropertyData({...editPropertyData, condoFee: e.target.value})} className="w-full border rounded p-2" />
                  </div>
                )}
                <textarea placeholder="Notas (opcional)" value={editPropertyData.notes} onChange={e => setEditPropertyData({...editPropertyData, notes: e.target.value})} className="w-full border rounded p-2" rows={3} />
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600">Guardar</button>
                  <button type="button" onClick={() => setEditingProperty(null)} className="flex-1 bg-stone-200 py-2 rounded hover:bg-stone-300">Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Contact Modal */}
        {editingContact && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">Editar Contacto</h2>
              <form onSubmit={updateContact} className="space-y-4">
                <input required placeholder="Nombre completo" value={editContactData.name} onChange={e => setEditContactData({...editContactData, name: e.target.value})} className="w-full border rounded p-2" />
                <div className="space-y-2">
                  <label className="text-sm text-stone-500">Teléfonos</label>
                  {editContactData.phones.map((phone, i) => (
                    <div key={i} className="flex gap-2">
                      <input placeholder="Teléfono" value={phone} onChange={e => updatePhoneField('editContact', i, e.target.value)} className="flex-1 border rounded p-2" />
                      {editContactData.phones.length > 1 && <button type="button" onClick={() => removePhoneField('editContact', i)} className="text-red-500 px-2">✕</button>}
                    </div>
                  ))}
                  <button type="button" onClick={() => addPhoneField('editContact')} className="text-sm text-blue-500">+ Agregar teléfono</button>
                </div>
                <input placeholder="Email (opcional)" type="email" value={editContactData.email} onChange={e => setEditContactData({...editContactData, email: e.target.value})} className="w-full border rounded p-2" />
                <select value={editContactData.category} onChange={e => setEditContactData({...editContactData, category: e.target.value})} className="w-full border rounded p-2">
                  {CONTACT_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                <input placeholder="Cumpleaños (opcional)" value={editContactData.birthday} onChange={e => setEditContactData({...editContactData, birthday: e.target.value})} className="w-full border rounded p-2" />
                <input placeholder="Dirección (opcional)" value={editContactData.address} onChange={e => setEditContactData({...editContactData, address: e.target.value})} className="w-full border rounded p-2" />
                <textarea placeholder="Notas (opcional)" value={editContactData.notes} onChange={e => setEditContactData({...editContactData, notes: e.target.value})} className="w-full border rounded p-2" rows={3} />
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600">Guardar</button>
                  <button type="button" onClick={() => setEditingContact(null)} className="flex-1 bg-stone-200 py-2 rounded hover:bg-stone-300">Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        )}
'''

# Insert after Contact Form Modal
content = content.replace(
    '''                </div>
              </form>
            </div>
          </div>
        )}

        {/* Client Detail Modal */}''',
    '''                </div>
              </form>
            </div>
          </div>
        )}''' + edit_modals + '''

        {/* Client Detail Modal */}'''
)

with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'w') as f:
    f.write(content)

print('Edit modals added')
