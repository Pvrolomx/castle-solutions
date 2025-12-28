with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'r') as f:
    content = f.read()

# Add Calendario link after Gastos
old_gastos_link = '''<Link href="/gastos" className="px-5 py-2 rounded-lg font-medium transition shadow-md bg-gradient-to-b from-amber-100 to-amber-200 text-amber-800 hover:from-amber-200 hover:to-amber-300">Gastos</Link>'''

new_gastos_link = '''<Link href="/gastos" className="px-5 py-2 rounded-lg font-medium transition shadow-md bg-gradient-to-b from-amber-100 to-amber-200 text-amber-800 hover:from-amber-200 hover:to-amber-300">Gastos</Link>
            <Link href="/calendario" className="px-5 py-2 rounded-lg font-medium transition shadow-md bg-gradient-to-b from-amber-100 to-amber-200 text-amber-800 hover:from-amber-200 hover:to-amber-300">Calendario</Link>'''

content = content.replace(old_gastos_link, new_gastos_link)

with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'w') as f:
    f.write(content)

print('Calendario link added to header')
