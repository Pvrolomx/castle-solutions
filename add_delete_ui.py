with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'r') as f:
    content = f.read()

# Add delete functions after deleteDocument
delete_funcs = '''

  const deleteClient = async (clientId: string) => {
    if (!confirm('¿Eliminar este cliente y todas sus propiedades?')) return;
    await fetch(`/api/clients?id=${clientId}`, { method: 'DELETE' });
    setSelectedClient(null);
    loadData(search);
  };

  const deleteProperty = async (propertyId: string) => {
    if (!confirm('¿Eliminar esta propiedad?')) return;
    await fetch(`/api/properties?id=${propertyId}`, { method: 'DELETE' });
    setSelectedProperty(null);
    loadData(search);
  };

  const deleteContact = async (contactId: string) => {
    if (!confirm('¿Eliminar este contacto?')) return;
    await fetch(`/api/contacts?id=${contactId}`, { method: 'DELETE' });
    setSelectedContact(null);
    loadData(search);
  };
'''

# Insert after deleteDocument function
content = content.replace(
    'if (selectedClient) loadClientDocs(selectedClient.id);\n  };',
    'if (selectedClient) loadClientDocs(selectedClient.id);\n  };' + delete_funcs
)

# Add delete button to Client Detail Modal (before Cerrar button)
old_client_close = '''<button onClick={() => setSelectedClient(null)} className="w-full mt-4 bg-stone-200 py-2 rounded hover:bg-stone-300">Cerrar</button>
            </div>
          </div>
        )}

        {/* Document Upload Modal */}'''

new_client_close = '''<div className="flex gap-2 mt-4">
                <button onClick={() => setSelectedClient(null)} className="flex-1 bg-stone-200 py-2 rounded hover:bg-stone-300">Cerrar</button>
                <button onClick={() => deleteClient(selectedClient.id)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Eliminar</button>
              </div>
            </div>
          </div>
        )}

        {/* Document Upload Modal */}'''

content = content.replace(old_client_close, new_client_close)

# Add delete button to Property Detail Modal
old_prop_close = '''<button onClick={() => setSelectedProperty(null)} className="w-full mt-4 bg-stone-200 py-2 rounded hover:bg-stone-300">Cerrar</button>
            </div>
          </div>
        )}

        {/* Lists */}'''

new_prop_close = '''<div className="flex gap-2 mt-4">
                <button onClick={() => setSelectedProperty(null)} className="flex-1 bg-stone-200 py-2 rounded hover:bg-stone-300">Cerrar</button>
                <button onClick={() => deleteProperty(selectedProperty.id)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Eliminar</button>
              </div>
            </div>
          </div>
        )}

        {/* Lists */}'''

content = content.replace(old_prop_close, new_prop_close)

# Add delete button to Contact Detail Modal
old_contact_close = '''<button onClick={() => setSelectedContact(null)} className="w-full mt-4 bg-stone-200 py-2 rounded hover:bg-stone-300">Cerrar</button>
            </div>
          </div>
        )}

      </main>'''

new_contact_close = '''<div className="flex gap-2 mt-4">
                <button onClick={() => setSelectedContact(null)} className="flex-1 bg-stone-200 py-2 rounded hover:bg-stone-300">Cerrar</button>
                <button onClick={() => deleteContact(selectedContact.id)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Eliminar</button>
              </div>
            </div>
          </div>
        )}

      </main>'''

content = content.replace(old_contact_close, new_contact_close)

with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'w') as f:
    f.write(content)

print('Delete buttons added to all detail modals')
