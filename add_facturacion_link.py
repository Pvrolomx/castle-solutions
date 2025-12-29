with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'r') as f:
    content = f.read()

# Add Facturacion link after Contratos
old_contratos_link = '''<Link href="/contratos" className="px-5 py-2 rounded-lg font-medium transition shadow-md bg-gradient-to-b from-amber-100 to-amber-200 text-amber-800 hover:from-amber-200 hover:to-amber-300">Contratos</Link>'''

new_contratos_link = '''<Link href="/contratos" className="px-5 py-2 rounded-lg font-medium transition shadow-md bg-gradient-to-b from-amber-100 to-amber-200 text-amber-800 hover:from-amber-200 hover:to-amber-300">Contratos</Link>
            <Link href="/facturacion" className="px-5 py-2 rounded-lg font-medium transition shadow-md bg-gradient-to-b from-amber-100 to-amber-200 text-amber-800 hover:from-amber-200 hover:to-amber-300">Facturación</Link>'''

content = content.replace(old_contratos_link, new_contratos_link)

with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'w') as f:
    f.write(content)

print('Facturacion link added to header')
