with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'r') as f:
    content = f.read()

# Add Link import if not present
if "import Link from 'next/link'" not in content:
    content = content.replace(
        "import { useEffect, useState } from 'react';",
        "import { useEffect, useState } from 'react';\nimport Link from 'next/link';"
    )

# Add Gastos button in header after the tabs
old_header_btns = '''<button onClick={() => setView('familia')} className={`px-5 py-2 rounded font-medium transition ${view === 'familia' ? 'bg-rose-600 text-white' : 'bg-rose-100 text-rose-700 hover:bg-rose-200'}`}>Familia</button>'''

new_header_btns = '''<button onClick={() => setView('familia')} className={`px-5 py-2 rounded font-medium transition ${view === 'familia' ? 'bg-rose-600 text-white' : 'bg-rose-100 text-rose-700 hover:bg-rose-200'}`}>Familia</button>
            <Link href="/gastos" className="px-5 py-2 rounded font-medium transition bg-green-100 text-green-700 hover:bg-green-200">📊 Gastos</Link>'''

content = content.replace(old_header_btns, new_header_btns)

with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'w') as f:
    f.write(content)

print('Added Gastos link to header')
