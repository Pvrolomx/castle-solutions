import re

with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'r') as f:
    content = f.read()

# Add Image import
old_import = "import { useEffect, useState } from 'react';"
new_import = """import { useEffect, useState } from 'react';
import Image from 'next/image';"""

content = content.replace(old_import, new_import)

# Replace text logo with Image
old_logo = '<span className="text-2xl font-semibold tracking-wide">CASTLE <span className="text-amber-600 font-light">solutions</span></span>'
new_logo = '<Image src="/logo.png" alt="Castle Solutions" width={180} height={50} className="h-12 w-auto" />'

content = content.replace(old_logo, new_logo)

with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'w') as f:
    f.write(content)

print('Logo updated!')
