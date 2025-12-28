with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'r') as f:
    content = f.read()

# Add "Portal" button next to client actions - look for the edit/delete buttons area
# Looking for the client card header where buttons are

old_client_buttons = '''<button onClick={() => setEditingClient(client)} className="text-amber-600 hover:text-amber-800 text-sm">Editar</button>
                          <button onClick={() => deleteClient(client.id)} className="text-red-500 hover:text-red-700 text-sm">Eliminar</button>'''

new_client_buttons = '''<button onClick={() => generateClientLink(client.id, client.name)} className="text-purple-600 hover:text-purple-800 text-sm">Portal</button>
                          <button onClick={() => setEditingClient(client)} className="text-amber-600 hover:text-amber-800 text-sm">Editar</button>
                          <button onClick={() => deleteClient(client.id)} className="text-red-500 hover:text-red-700 text-sm">Eliminar</button>'''

content = content.replace(old_client_buttons, new_client_buttons)

with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'w') as f:
    f.write(content)

print('Portal button added to client cards')
