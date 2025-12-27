with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'r') as f:
    content = f.read()

# Fix header: center logo and buttons
old_header = '''<header className="bg-white border-b border-stone-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <img src="/logo.png" alt="Castle Solutions" className="h-12 w-auto" />
          <div className="flex gap-2">'''

new_header = '''<header className="bg-white border-b border-stone-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-4">
          <img src="/logo.png" alt="Castle Solutions" className="h-14 w-auto" />
          <div className="flex gap-2 justify-center">'''

content = content.replace(old_header, new_header)

# Fix closing div
old_close = '''          </div>
        </div>
      </header>'''

new_close = '''          </div>
        </div>
      </header>'''

content = content.replace(old_close, new_close)

with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'w') as f:
    f.write(content)

print('Header fixed: logo centered, buttons centered')
