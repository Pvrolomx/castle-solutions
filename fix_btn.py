with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'r') as f:
    content = f.read()

old = '''<button onClick={() => setShowPropertyForm(true)} className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700">+ Propiedad</button>
        </div>'''

new = '''<button onClick={() => setShowPropertyForm(true)} className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700">+ Propiedad</button>
          <button onClick={() => setShowContactForm(true)} className="bg-rose-600 text-white px-4 py-2 rounded hover:bg-rose-700">+ Familia</button>
        </div>'''

content = content.replace(old, new)

with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'w') as f:
    f.write(content)

print('Boton +Familia agregado')
