with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'r') as f:
    content = f.read()

# Add Edit Client button in client detail modal (before delete button)
old_client_btns = '''<div className="flex gap-2 mt-4">
                <button onClick={() => setSelectedClient(null)} className="flex-1 bg-stone-200 py-2 rounded hover:bg-stone-300">Cerrar</button>
                <button onClick={() => deleteClient(selectedClient.id)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Eliminar</button>
              </div>'''

new_client_btns = '''<div className="flex gap-2 mt-4">
                <button onClick={() => setSelectedClient(null)} className="flex-1 bg-stone-200 py-2 rounded hover:bg-stone-300">Cerrar</button>
                <button onClick={() => startEditClient(selectedClient)} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Editar</button>
                <button onClick={() => deleteClient(selectedClient.id)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Eliminar</button>
              </div>'''

content = content.replace(old_client_btns, new_client_btns)

# Add Edit Property button
old_prop_btns = '''<div className="flex gap-2 mt-4">
                <button onClick={() => setSelectedProperty(null)} className="flex-1 bg-stone-200 py-2 rounded hover:bg-stone-300">Cerrar</button>
                <button onClick={() => deleteProperty(selectedProperty.id)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Eliminar</button>
              </div>'''

new_prop_btns = '''<div className="flex gap-2 mt-4">
                <button onClick={() => setSelectedProperty(null)} className="flex-1 bg-stone-200 py-2 rounded hover:bg-stone-300">Cerrar</button>
                <button onClick={() => startEditProperty(selectedProperty)} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Editar</button>
                <button onClick={() => deleteProperty(selectedProperty.id)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Eliminar</button>
              </div>'''

content = content.replace(old_prop_btns, new_prop_btns)

# Add Edit Contact button
old_contact_btns = '''<div className="flex gap-2 mt-4">
                <button onClick={() => setSelectedContact(null)} className="flex-1 bg-stone-200 py-2 rounded hover:bg-stone-300">Cerrar</button>
                <button onClick={() => deleteContact(selectedContact.id)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Eliminar</button>
              </div>'''

new_contact_btns = '''<div className="flex gap-2 mt-4">
                <button onClick={() => setSelectedContact(null)} className="flex-1 bg-stone-200 py-2 rounded hover:bg-stone-300">Cerrar</button>
                <button onClick={() => startEditContact(selectedContact)} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Editar</button>
                <button onClick={() => deleteContact(selectedContact.id)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Eliminar</button>
              </div>'''

content = content.replace(old_contact_btns, new_contact_btns)

with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'w') as f:
    f.write(content)

print('Edit buttons added to detail modals')
