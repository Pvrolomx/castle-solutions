with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'r') as f:
    content = f.read()

# Update form titles to show Edit vs New
content = content.replace(
    '<h2 className="text-xl font-semibold mb-4">Nuevo Cliente</h2>',
    '<h2 className="text-xl font-semibold mb-4">{editingClient ? "Editar Cliente" : "Nuevo Cliente"}</h2>'
)
content = content.replace(
    '<h2 className="text-xl font-semibold mb-4">Nueva Propiedad</h2>',
    '<h2 className="text-xl font-semibold mb-4">{editingProperty ? "Editar Propiedad" : "Nueva Propiedad"}</h2>'
)
content = content.replace(
    '<h2 className="text-xl font-semibold mb-4">Nuevo Contacto</h2>',
    '<h2 className="text-xl font-semibold mb-4">{editingContact ? "Editar Contacto" : "Nuevo Contacto"}</h2>'
)

# Update submit button text
content = content.replace(
    '<button type="submit" className="flex-1 bg-stone-800 text-white py-2 rounded hover:bg-stone-700">Crear</button>',
    '<button type="submit" className="flex-1 bg-stone-800 text-white py-2 rounded hover:bg-stone-700">{editingClient ? "Guardar" : "Crear"}</button>'
)
content = content.replace(
    '<button type="submit" className="flex-1 bg-amber-600 text-white py-2 rounded hover:bg-amber-700">Crear</button>',
    '<button type="submit" className="flex-1 bg-amber-600 text-white py-2 rounded hover:bg-amber-700">{editingProperty ? "Guardar" : "Crear"}</button>'
)
content = content.replace(
    '<button type="submit" className="flex-1 bg-rose-600 text-white py-2 rounded hover:bg-rose-700">Crear</button>',
    '<button type="submit" className="flex-1 bg-rose-600 text-white py-2 rounded hover:bg-rose-700">{editingContact ? "Guardar" : "Crear"}</button>'
)

# Update cancel buttons to also clear editing state
content = content.replace(
    '<button type="button" onClick={() => setShowClientForm(false)} className="flex-1 bg-stone-200 py-2 rounded hover:bg-stone-300">Cancelar</button>',
    '<button type="button" onClick={() => { setShowClientForm(false); setEditingClient(null); setClientData({ name: "", phone: "", email: "", notes: "" }); }} className="flex-1 bg-stone-200 py-2 rounded hover:bg-stone-300">Cancelar</button>'
)
content = content.replace(
    '<button type="button" onClick={() => setShowPropertyForm(false)} className="flex-1 bg-stone-200 py-2 rounded hover:bg-stone-300">Cancelar</button>',
    '<button type="button" onClick={() => { setShowPropertyForm(false); setEditingProperty(null); }} className="flex-1 bg-stone-200 py-2 rounded hover:bg-stone-300">Cancelar</button>'
)
content = content.replace(
    '<button type="button" onClick={() => setShowContactForm(false)} className="flex-1 bg-stone-200 py-2 rounded hover:bg-stone-300">Cancelar</button>',
    '<button type="button" onClick={() => { setShowContactForm(false); setEditingContact(null); }} className="flex-1 bg-stone-200 py-2 rounded hover:bg-stone-300">Cancelar</button>'
)

# Add Edit button to Client Detail Modal (before delete button)
old_client_btns = '''<div className="flex gap-2 mt-4">
                <button onClick={() => setSelectedClient(null)} className="flex-1 bg-stone-200 py-2 rounded hover:bg-stone-300">Cerrar</button>
                <button onClick={() => deleteClient(selectedClient.id)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Eliminar</button>
              </div>'''

new_client_btns = '''<div className="flex gap-2 mt-4">
                <button onClick={() => setSelectedClient(null)} className="flex-1 bg-stone-200 py-2 rounded hover:bg-stone-300">Cerrar</button>
                <button onClick={() => startEditClient(selectedClient)} className="bg-stone-800 text-white px-4 py-2 rounded hover:bg-stone-700">Editar</button>
                <button onClick={() => deleteClient(selectedClient.id)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Eliminar</button>
              </div>'''

content = content.replace(old_client_btns, new_client_btns)

# Add Edit button to Property Detail Modal
old_prop_btns = '''<div className="flex gap-2 mt-4">
                <button onClick={() => setSelectedProperty(null)} className="flex-1 bg-stone-200 py-2 rounded hover:bg-stone-300">Cerrar</button>
                <button onClick={() => deleteProperty(selectedProperty.id)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Eliminar</button>
              </div>'''

new_prop_btns = '''<div className="flex gap-2 mt-4">
                <button onClick={() => setSelectedProperty(null)} className="flex-1 bg-stone-200 py-2 rounded hover:bg-stone-300">Cerrar</button>
                <button onClick={() => startEditProperty(selectedProperty)} className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700">Editar</button>
                <button onClick={() => deleteProperty(selectedProperty.id)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Eliminar</button>
              </div>'''

content = content.replace(old_prop_btns, new_prop_btns)

# Add Edit button to Contact Detail Modal
old_contact_btns = '''<div className="flex gap-2 mt-4">
                <button onClick={() => setSelectedContact(null)} className="flex-1 bg-stone-200 py-2 rounded hover:bg-stone-300">Cerrar</button>
                <button onClick={() => deleteContact(selectedContact.id)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Eliminar</button>
              </div>'''

new_contact_btns = '''<div className="flex gap-2 mt-4">
                <button onClick={() => setSelectedContact(null)} className="flex-1 bg-stone-200 py-2 rounded hover:bg-stone-300">Cerrar</button>
                <button onClick={() => startEditContact(selectedContact)} className="bg-rose-600 text-white px-4 py-2 rounded hover:bg-rose-700">Editar</button>
                <button onClick={() => deleteContact(selectedContact.id)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Eliminar</button>
              </div>'''

content = content.replace(old_contact_btns, new_contact_btns)

with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'w') as f:
    f.write(content)

print('Edit UI added - part 2')
