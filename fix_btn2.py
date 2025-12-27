with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'r') as f:
    lines = f.readlines()

# Find and fix line 225 (0-indexed: 224)
for i, line in enumerate(lines):
    if 'setShowContactForm(true)' in line and 'Familia' in line:
        lines[i] = '            <button onClick={() => setShowContactForm(true)} className="bg-rose-600 text-white px-4 py-2 rounded hover:bg-rose-700">+ Familia</button>\n'
        break

with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'w') as f:
    f.writelines(lines)

print('Fixed')
