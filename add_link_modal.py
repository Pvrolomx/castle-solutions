with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'r') as f:
    content = f.read()

# Add link modal at the end before closing main tag
link_modal = '''
        {/* Link Modal */}
        {showLinkModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-semibold mb-2">Portal del Cliente</h2>
              <p className="text-sm text-stone-500 mb-4">{linkClientName}</p>
              
              <div className="bg-stone-50 p-3 rounded mb-4">
                <p className="text-xs text-stone-400 mb-1">Link generado:</p>
                <p className="text-sm break-all text-blue-600">{generatedLink}</p>
              </div>
              
              <div className="flex gap-2 mb-4">
                <button onClick={copyLink} className="flex-1 bg-stone-200 py-2 rounded hover:bg-stone-300 text-sm">Copiar Link</button>
                <button onClick={shareWhatsApp} className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 text-sm">WhatsApp</button>
              </div>
              
              <button onClick={() => setShowLinkModal(false)} className="w-full bg-amber-600 text-white py-2 rounded hover:bg-amber-700">Cerrar</button>
            </div>
          </div>
        )}
'''

# Find closing </main> and insert before it
content = content.replace('</main>\n  );\n}', link_modal + '\n      </main>\n  );\n}')

with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'w') as f:
    f.write(content)

print('Link modal added')
