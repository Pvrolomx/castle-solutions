with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'r') as f:
    content = f.read()

# Update all header buttons to amber color with 3D effect
old_buttons = '''<div className="flex gap-2 justify-center">
            <button onClick={() => setView('clients')} className={`px-5 py-2 rounded font-medium transition ${view === 'clients' ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'}`}>Clientes</button>
            <button onClick={() => setView('properties')} className={`px-5 py-2 rounded font-medium transition ${view === 'properties' ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}>Propiedades</button>
            <button onClick={() => setView('familia')} className={`px-5 py-2 rounded font-medium transition ${view === 'familia' ? 'bg-rose-600 text-white' : 'bg-rose-100 text-rose-700 hover:bg-rose-200'}`}>Familia</button>
            <Link href="/gastos" className="px-5 py-2 rounded font-medium transition bg-green-100 text-green-700 hover:bg-green-200">📊 Gastos</Link>
          </div>'''

new_buttons = '''<div className="flex gap-2 justify-center">
            <button onClick={() => setView('clients')} className={`px-5 py-2 rounded-lg font-medium transition shadow-md ${view === 'clients' ? 'bg-gradient-to-b from-amber-500 to-amber-600 text-white shadow-amber-300' : 'bg-gradient-to-b from-amber-100 to-amber-200 text-amber-800 hover:from-amber-200 hover:to-amber-300'}`}>Clientes</button>
            <button onClick={() => setView('properties')} className={`px-5 py-2 rounded-lg font-medium transition shadow-md ${view === 'properties' ? 'bg-gradient-to-b from-amber-500 to-amber-600 text-white shadow-amber-300' : 'bg-gradient-to-b from-amber-100 to-amber-200 text-amber-800 hover:from-amber-200 hover:to-amber-300'}`}>Propiedades</button>
            <button onClick={() => setView('familia')} className={`px-5 py-2 rounded-lg font-medium transition shadow-md ${view === 'familia' ? 'bg-gradient-to-b from-amber-500 to-amber-600 text-white shadow-amber-300' : 'bg-gradient-to-b from-amber-100 to-amber-200 text-amber-800 hover:from-amber-200 hover:to-amber-300'}`}>Familia</button>
            <Link href="/gastos" className="px-5 py-2 rounded-lg font-medium transition shadow-md bg-gradient-to-b from-amber-100 to-amber-200 text-amber-800 hover:from-amber-200 hover:to-amber-300">Gastos</Link>
          </div>'''

content = content.replace(old_buttons, new_buttons)

with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'w') as f:
    f.write(content)

print('Buttons updated: same amber color, 3D effect, no emoji on Gastos')
