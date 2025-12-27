with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'r') as f:
    content = f.read()

# Add Familia list view after properties list
familia_list = '''

        {view === 'familia' && (
          <div className="grid gap-4">
            {contacts.length === 0 ? (
              <div className="text-center text-stone-400 py-12">No hay contactos. Crea el primero.</div>
            ) : contacts.map(contact => (
              <div key={contact.id} onClick={() => setSelectedContact(contact)} className="bg-white rounded-lg shadow p-4 hover:shadow-md cursor-pointer transition">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{contact.name}</h3>
                    <p className="text-stone-500">{JSON.parse(contact.phones).join(' · ')}</p>
                    {contact.email && <p className="text-stone-400 text-sm">{contact.email}</p>}
                  </div>
                  <span className="bg-rose-100 text-rose-600 px-2 py-1 rounded text-sm">{contact.category}</span>
                </div>
              </div>
            ))}
          </div>
        )}'''

# Add after properties view closing
old_properties_end = '''            ))}
          </div>
        )}
      </main>'''
new_properties_end = '''            ))}
          </div>
        )}''' + familia_list + '''
      </main>'''
content = content.replace(old_properties_end, new_properties_end)

# Add Contact Detail Modal before the final closing tags
contact_detail = '''

        {/* Contact Detail Modal */}
        {selectedContact && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedContact(null)}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <h2 className="text-2xl font-semibold mb-2">{selectedContact.name}</h2>
              <span className="inline-block bg-rose-100 text-rose-600 px-2 py-1 rounded text-sm mb-4">{selectedContact.category}</span>
              <div className="space-y-3 mb-4">
                {JSON.parse(selectedContact.phones).map((phone: string, i: number) => (
                  <a key={i} href={`tel:${phone}`} className="flex items-center gap-2 text-stone-700 hover:text-rose-600">📞 {phone}</a>
                ))}
                {selectedContact.email && <a href={`mailto:${selectedContact.email}`} className="flex items-center gap-2 text-stone-700 hover:text-rose-600">✉️ {selectedContact.email}</a>}
                {selectedContact.birthday && <p className="text-stone-600">🎂 {selectedContact.birthday}</p>}
                {selectedContact.address && <p className="text-stone-600">📍 {selectedContact.address}</p>}
              </div>
              {selectedContact.notes && <p className="text-stone-600 bg-stone-50 p-3 rounded mb-4">{selectedContact.notes}</p>}
              <button onClick={() => setSelectedContact(null)} className="w-full mt-4 bg-stone-200 py-2 rounded hover:bg-stone-300">Cerrar</button>
            </div>
          </div>
        )}'''

# Insert before </main>
content = content.replace('</main>\n    </div>\n  );', contact_detail + '\n      </main>\n    </div>\n  );')

with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'w') as f:
    f.write(content)

print('Part 3 done - familia list and detail modal added')
