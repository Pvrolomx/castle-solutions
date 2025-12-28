with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'r') as f:
    content = f.read()

# Add Contratos link after Calendario
old_calendario_link = '''<Link href="/calendario" className="px-5 py-2 rounded-lg font-medium transition shadow-md bg-gradient-to-b from-amber-100 to-amber-200 text-amber-800 hover:from-amber-200 hover:to-amber-300">Calendario</Link>'''

new_calendario_link = '''<Link href="/calendario" className="px-5 py-2 rounded-lg font-medium transition shadow-md bg-gradient-to-b from-amber-100 to-amber-200 text-amber-800 hover:from-amber-200 hover:to-amber-300">Calendario</Link>
            <Link href="/contratos" className="px-5 py-2 rounded-lg font-medium transition shadow-md bg-gradient-to-b from-amber-100 to-amber-200 text-amber-800 hover:from-amber-200 hover:to-amber-300">Contratos</Link>'''

content = content.replace(old_calendario_link, new_calendario_link)

with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'w') as f:
    f.write(content)

print('Contratos link added to header')
