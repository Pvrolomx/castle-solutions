with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'r') as f:
    content = f.read()

content = content.replace("import Image from 'next/image';", '')
content = content.replace('<Image src="/logo.webp" alt="Castle Solutions" width={180} height={50} className="h-12 w-auto" />', '<img src="/logo.webp" alt="Castle Solutions" className="h-12 w-auto" />')

with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'w') as f:
    f.write(content)

print('Fixed')
