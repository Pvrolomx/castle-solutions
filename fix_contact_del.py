with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'r') as f:
    content = f.read()

# Fix contact modal close button
old = '''<button onClick={() => setSelectedContact(null)} className="w-full mt-4 bg-stone-200 py-2 rounded hover:bg-stone-300">Cerrar</button>
            </div>
          </div>
        )}
      </main>'''

new = '''<div className="flex gap-2 mt-4">
                <button onClick={() => setSelectedContact(null)} className="flex-1 bg-stone-200 py-2 rounded hover:bg-stone-300">Cerrar</button>
                <button onClick={() => deleteContact(selectedContact.id)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Eliminar</button>
              </div>
            </div>
          </div>
        )}
      </main>'''

content = content.replace(old, new)

with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'w') as f:
    f.write(content)

print('Contact delete button fixed')
