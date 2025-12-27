with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'r') as f:
    content = f.read()

# Add useSession import
old_imports = "import { useEffect, useState } from 'react';"
new_imports = "import { useEffect, useState } from 'react';\nimport { useSession, signOut } from 'next-auth/react';"

content = content.replace(old_imports, new_imports)

# Add session hook at start of component
old_component_start = "export default function Home() {\n  const [clients, setClients] = useState<Client[]>([]);"
new_component_start = """export default function Home() {
  const { data: session } = useSession();
  const [clients, setClients] = useState<Client[]>([]);"""

content = content.replace(old_component_start, new_component_start)

# Add user info and logout button in header (after the logo)
old_header = """<img src="/castle-logo.webp" alt="CASTLE solutions" className="h-14" />
          </div>
          <div className="flex gap-2 mt-4">"""

new_header = """<img src="/castle-logo.webp" alt="CASTLE solutions" className="h-14" />
            {session?.user && (
              <div className="flex items-center gap-3 mt-2">
                <span className="text-sm text-stone-500">{session.user.email}</span>
                <button onClick={() => signOut()} className="text-xs text-stone-400 hover:text-stone-600">Salir</button>
              </div>
            )}
          </div>
          <div className="flex gap-2 mt-4">"""

content = content.replace(old_header, new_header)

with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'w') as f:
    f.write(content)

print('Session handling added to main page')
