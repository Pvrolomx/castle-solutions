with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'r') as f:
    content = f.read()

# Add logout button after Gastos link
old_gastos = '''<Link href="/gastos" className="px-5 py-2 rounded font-medium transition bg-green-100 text-green-700 hover:bg-green-200">📊 Gastos</Link>
          </div>
        </div>
      </header>'''

new_gastos = '''<Link href="/gastos" className="px-5 py-2 rounded font-medium transition bg-green-100 text-green-700 hover:bg-green-200">📊 Gastos</Link>
          </div>
          {session?.user && (
            <div className="flex items-center gap-3 mt-3">
              <span className="text-sm text-stone-500">{session.user.email}</span>
              <button onClick={() => signOut()} className="text-sm text-red-500 hover:text-red-700 font-medium">Cerrar sesión</button>
            </div>
          )}
        </div>
      </header>'''

content = content.replace(old_gastos, new_gastos)

with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'w') as f:
    f.write(content)

print('Logout button added')
