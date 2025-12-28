with open('/home/pvrolo/castle-solutions/src/app/calendario/page.tsx', 'r') as f:
    content = f.read()

# Add document section to form (after notes textarea, before the buttons)
doc_section = '''
                  {selectedReservation && (
                    <div className="col-span-2 bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-blue-700 mb-2">Documentos del Huésped</p>
                      
                      {/* Existing docs */}
                      {guestDocs.length > 0 && (
                        <div className="mb-3 space-y-2">
                          {guestDocs.map(doc => (
                            <div key={doc.id} className="flex items-center justify-between bg-white p-2 rounded text-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-blue-600">📄</span>
                                <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                  {doc.filename}
                                </a>
                                <span className="text-xs text-stone-400">({doc.docType})</span>
                              </div>
                              <button type="button" onClick={() => deleteGuestDoc(doc.id, selectedReservation.id)} className="text-red-400 hover:text-red-600">✕</button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Upload new doc */}
                      <div className="flex gap-2 items-center">
                        <select value={newDocType} onChange={e => setNewDocType(e.target.value)} className="border rounded p-2 text-sm">
                          {DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                        <UploadButton
                          endpoint="documentUploader"
                          onClientUploadComplete={(res) => {
                            if (res && res[0] && selectedReservation) {
                              saveGuestDoc(res[0].url, res[0].name, selectedReservation.id);
                            }
                          }}
                          onUploadError={(error: Error) => alert(`Error: ${error.message}`)}
                          appearance={{ button: { background: '#2563eb', padding: '8px 16px', fontSize: '12px' } }}
                        />
                      </div>
                    </div>
                  )}
'''

# Insert before the buttons div
old_buttons = '''<div className="flex gap-2 pt-2">
                  <button type="submit"'''

new_buttons = doc_section + '''
                </div>

                <div className="flex gap-2 pt-2">
                  <button type="submit"'''

content = content.replace(old_buttons, new_buttons)

with open('/home/pvrolo/castle-solutions/src/app/calendario/page.tsx', 'w') as f:
    f.write(content)

print('Guest docs UI added to form')
