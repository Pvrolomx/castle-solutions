with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'r') as f:
    content = f.read()

content = content.replace('placeholder="Telefono"', 'placeholder="Telefonos (separar con coma)"')

with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'w') as f:
    f.write(content)

print('Phone placeholder updated')
