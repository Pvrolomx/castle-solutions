with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'r') as f:
    lines = f.readlines()

# Find and remove duplicate editing states (the first occurrence, keep the second)
new_lines = []
skip_lines = []

# Find lines to skip (first occurrence of editing states)
for i, line in enumerate(lines):
    if 'const [editingClient, setEditingClient]' in line and i < 85:
        skip_lines.append(i)
    elif 'const [editingProperty, setEditingProperty]' in line and i < 85:
        skip_lines.append(i)
    elif 'const [editingContact, setEditingContact]' in line and i < 85:
        skip_lines.append(i)

for i, line in enumerate(lines):
    if i not in skip_lines:
        new_lines.append(line)

with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'w') as f:
    f.writelines(new_lines)

print(f'Removed {len(skip_lines)} duplicate lines')
