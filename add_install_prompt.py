with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'r') as f:
    content = f.read()

# Add InstallPrompt import
if "import InstallPrompt" not in content:
    content = content.replace(
        "import Link from 'next/link';",
        "import Link from 'next/link';\nimport InstallPrompt from '@/components/InstallPrompt';"
    )

# Add InstallPrompt component before closing main div
# Find the last </main> and add the component before it
if "<InstallPrompt />" not in content:
    content = content.replace(
        "</main>\n    </div>\n  );\n}",
        "</main>\n      <InstallPrompt />\n    </div>\n  );\n}"
    )

with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'w') as f:
    f.write(content)

print('InstallPrompt added to page')
