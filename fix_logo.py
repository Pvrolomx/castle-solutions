import re
with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'r') as f:
    content = f.read()
content = content.replace("import Image from 'next/image';", "// import Image from 'next/image';")
content = content.replace('<Image src="/logo.png" alt="Castle Solutions" width={180} height={50} priority />', '<span className="text-2xl font-semibold tracking-wide">CASTLE <span className="text-amber-600 font-light">solutions</span></span>')
with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'w') as f:
    f.write(content)
print('OK')
