with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'r') as f:
    content = f.read()

# Add Photos section in Property Detail Modal - before the buttons at the bottom
# Find the property detail modal buttons and add photos section before them

old_prop_buttons = '''<div className="flex gap-2 mt-4">
                <button onClick={() => setSelectedProperty(null)} className="flex-1 bg-stone-200 py-2 rounded hover:bg-stone-300">Cerrar</button>
                <button onClick={() => startEditProperty(selectedProperty)} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Editar</button>
                <button onClick={() => deleteProperty(selectedProperty.id)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Eliminar</button>
              </div>
            </div>
          </div>
        )}

        {/* Lists */}'''

photos_section = '''
              {/* Photos Section */}
              <div className="border-t pt-4 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium">📷 Fotos ({propertyPhotos.length})</h3>
                  <button onClick={() => setShowPhotoUpload(true)} className="text-sm bg-amber-100 text-amber-700 px-3 py-1 rounded hover:bg-amber-200">+ Subir Foto</button>
                </div>
                {propertyPhotos.length === 0 ? (
                  <p className="text-sm text-stone-400">Sin fotos</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {propertyPhotos.map(photo => (
                      <div key={photo.id} className="relative group">
                        <img src={photo.url} alt="Propiedad" className="w-full h-24 object-cover rounded" />
                        <button onClick={() => deletePhoto(photo.id)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 text-xs opacity-0 group-hover:opacity-100 transition">✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <button onClick={() => setSelectedProperty(null)} className="flex-1 bg-stone-200 py-2 rounded hover:bg-stone-300">Cerrar</button>
                <button onClick={() => startEditProperty(selectedProperty)} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Editar</button>
                <button onClick={() => deleteProperty(selectedProperty.id)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Eliminar</button>
              </div>
            </div>
          </div>
        )}

        {/* Photo Upload Modal */}
        {showPhotoUpload && selectedProperty && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" onClick={() => setShowPhotoUpload(false)}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
              <h2 className="text-xl font-semibold mb-4">Subir Foto</h2>
              <p className="text-sm text-stone-500 mb-4">Propiedad: {selectedProperty.name}</p>
              <div className="mb-4">
                <UploadButton
                  endpoint="documentUploader"
                  onClientUploadComplete={(res) => {
                    if (res && res[0]) {
                      savePhoto(res[0].url);
                    }
                  }}
                  onUploadError={(error: Error) => {
                    alert(`Error: ${error.message}`);
                  }}
                />
              </div>
              <button onClick={() => setShowPhotoUpload(false)} className="w-full bg-stone-200 py-2 rounded hover:bg-stone-300">Cancelar</button>
            </div>
          </div>
        )}

        {/* Lists */}'''

content = content.replace(old_prop_buttons, photos_section)

with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'w') as f:
    f.write(content)

print('Part 2: Photos UI added to property detail')
