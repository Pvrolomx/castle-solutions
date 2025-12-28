with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'r') as f:
    content = f.read()

# Find the actual search input and wrap it with mic button
old_search = '''<input type="text" placeholder="Buscar cliente, propiedad, direccion, notas..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full px-4 py-3 text-lg border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500" />'''

new_search = '''<div className="flex gap-2 w-full">
            <input type="text" placeholder="Buscar cliente, propiedad, direccion, notas..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 px-4 py-3 text-lg border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500" />
            <button onClick={startVoiceSearch} className={`px-4 py-3 rounded-lg text-xl transition ${listening ? 'bg-red-500 text-white animate-pulse' : 'bg-stone-100 hover:bg-stone-200 border border-stone-300'}`} title="Búsqueda por voz">🎤</button>
          </div>'''

content = content.replace(old_search, new_search)

with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'w') as f:
    f.write(content)

print('Mic button added correctly')
