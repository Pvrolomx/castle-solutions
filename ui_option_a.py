with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'r') as f:
    content = f.read()

# Change header buttons from "+ Cliente" to just "Clientes" and make them set view
old_header_buttons = '''<button onClick={() => setShowClientForm(true)} className="bg-stone-800 text-white px-4 py-2 rounded hover:bg-stone-700">+ Cliente</button>
            <button onClick={() => setShowPropertyForm(true)} className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700">+ Propiedad</button>
            <button onClick={() => setShowContactForm(true)} className="bg-rose-600 text-white px-4 py-2 rounded hover:bg-rose-700">+ Familia</button>'''

new_header_buttons = '''<button onClick={() => setView('clients')} className={`px-5 py-2 rounded font-medium transition ${view === 'clients' ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'}`}>Clientes</button>
            <button onClick={() => setView('properties')} className={`px-5 py-2 rounded font-medium transition ${view === 'properties' ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}>Propiedades</button>
            <button onClick={() => setView('familia')} className={`px-5 py-2 rounded font-medium transition ${view === 'familia' ? 'bg-rose-600 text-white' : 'bg-rose-100 text-rose-700 hover:bg-rose-200'}`}>Familia</button>'''

content = content.replace(old_header_buttons, new_header_buttons)

# Remove the old tabs section
old_tabs = '''        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button onClick={() => setView('clients')} className={`px-6 py-2 rounded-lg font-medium ${view === 'clients' ? 'bg-stone-800 text-white' : 'bg-white text-stone-600 border'}`}>Clientes ({clients.length})</button>
          <button onClick={() => setView('properties')} className={`px-6 py-2 rounded-lg font-medium ${view === 'properties' ? 'bg-amber-600 text-white' : 'bg-white text-stone-600 border'}`}>Propiedades ({properties.length})</button>
          <button onClick={() => setView('familia')} className={`px-6 py-2 rounded-lg font-medium ${view === 'familia' ? 'bg-rose-600 text-white' : 'bg-white text-stone-600 border'}`}>Familia ({contacts.length})</button>
        </div>'''

content = content.replace(old_tabs, '')

# Add "+ Nuevo" button inside Clients list
old_clients_list = '''{view === 'clients' && (
          <div className="grid gap-4">
            {clients.length === 0 ? (
              <div className="text-center text-stone-400 py-12">No hay clientes. Crea el primero.</div>
            ) : clients.map(client =>'''

new_clients_list = '''{view === 'clients' && (
          <div className="grid gap-4">
            <button onClick={() => setShowClientForm(true)} className="w-full py-3 border-2 border-dashed border-stone-300 rounded-lg text-stone-500 hover:border-stone-400 hover:text-stone-600 transition">+ Nuevo Cliente</button>
            {clients.length === 0 ? (
              <div className="text-center text-stone-400 py-8">No hay clientes aún.</div>
            ) : clients.map(client =>'''

content = content.replace(old_clients_list, new_clients_list)

# Add "+ Nuevo" button inside Properties list
old_props_list = '''{view === 'properties' && (
          <div className="grid gap-4">
            {properties.length === 0 ? (
              <div className="text-center text-stone-400 py-12">No hay propiedades. Crea la primera.</div>
            ) : properties.map(property =>'''

new_props_list = '''{view === 'properties' && (
          <div className="grid gap-4">
            <button onClick={() => setShowPropertyForm(true)} className="w-full py-3 border-2 border-dashed border-amber-300 rounded-lg text-amber-500 hover:border-amber-400 hover:text-amber-600 transition">+ Nueva Propiedad</button>
            {properties.length === 0 ? (
              <div className="text-center text-stone-400 py-8">No hay propiedades aún.</div>
            ) : properties.map(property =>'''

content = content.replace(old_props_list, new_props_list)

# Add "+ Nuevo" button inside Familia list
old_familia_list = '''{view === 'familia' && (
          <div className="grid gap-4">
            {contacts.length === 0 ? (
              <div className="text-center text-stone-400 py-12">No hay contactos. Crea el primero.</div>
            ) : contacts.map(contact =>'''

new_familia_list = '''{view === 'familia' && (
          <div className="grid gap-4">
            <button onClick={() => setShowContactForm(true)} className="w-full py-3 border-2 border-dashed border-rose-300 rounded-lg text-rose-500 hover:border-rose-400 hover:text-rose-600 transition">+ Nuevo Contacto</button>
            {contacts.length === 0 ? (
              <div className="text-center text-stone-400 py-8">No hay contactos aún.</div>
            ) : contacts.map(contact =>'''

content = content.replace(old_familia_list, new_familia_list)

with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'w') as f:
    f.write(content)

print('UI refactored: Option A implemented')
