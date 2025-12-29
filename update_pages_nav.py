import os
import re

# Pages to update
pages = [
    '/home/pvrolo/castle-solutions/src/app/gastos/page.tsx',
    '/home/pvrolo/castle-solutions/src/app/calendario/page.tsx',
    '/home/pvrolo/castle-solutions/src/app/contratos/page.tsx',
    '/home/pvrolo/castle-solutions/src/app/facturacion/page.tsx',
]

for page_path in pages:
    with open(page_path, 'r') as f:
        content = f.read()
    
    # Add Navigation import if not present
    if "import Navigation from '@/components/Navigation'" not in content:
        # Add after the last import
        last_import = content.rfind("import ")
        end_of_import = content.find(";", last_import) + 1
        content = content[:end_of_import] + "\nimport Navigation from '@/components/Navigation';" + content[end_of_import:]
    
    # Replace the header section with <Navigation />
    # Pattern to match the header block
    header_pattern = r'<header className="bg-white border-b px-6 py-4">.*?</header>'
    
    if re.search(header_pattern, content, re.DOTALL):
        content = re.sub(header_pattern, '<Navigation />', content, flags=re.DOTALL)
    
    with open(page_path, 'w') as f:
        f.write(content)
    
    print(f'Updated: {page_path}')

print('All pages updated!')
