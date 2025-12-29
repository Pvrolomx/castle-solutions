import os
import re

pages = [
    '/home/pvrolo/castle-solutions/src/app/gastos/page.tsx',
    '/home/pvrolo/castle-solutions/src/app/calendario/page.tsx',
    '/home/pvrolo/castle-solutions/src/app/contratos/page.tsx',
    '/home/pvrolo/castle-solutions/src/app/facturacion/page.tsx',
    '/home/pvrolo/castle-solutions/src/app/page.tsx',
]

for page_path in pages:
    with open(page_path, 'r') as f:
        content = f.read()
    
    # Add Footer import if not present
    if "import Footer from '@/components/Footer'" not in content:
        # Find the last import line
        last_import = content.rfind("import ")
        end_of_import = content.find(";", last_import) + 1
        content = content[:end_of_import] + "\nimport Footer from '@/components/Footer';" + content[end_of_import:]
    
    # Add <Footer /> before the closing </div> of the main container
    # The main container is <div className="min-h-screen ...
    if '<Footer />' not in content:
        # Find the last </div> which should be the container close
        # We need to add Footer before </main> or the last </div>
        if '</main>' in content:
            content = content.replace('</main>', '</main>\n      <Footer />')
        else:
            # Find the pattern for closing the main container div
            # Usually it's the last </div> before the closing of return
            last_div_close = content.rfind('</div>\n  );\n}')
            if last_div_close > 0:
                content = content[:last_div_close] + '<Footer />\n      </div>\n  );\n}'

    with open(page_path, 'w') as f:
        f.write(content)
    
    print(f'Updated: {page_path}')

print('Footer added to all pages!')
