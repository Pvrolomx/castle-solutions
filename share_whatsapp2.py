with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'r') as f:
    content = f.read()

# Add share function after deletePhoto function - need to find the correct ending
old_delete_photo = '''const deletePhoto = async (photoId: string) => {
    if (!confirm('¿Eliminar esta foto?')) return;
    await fetch(`/api/photos?id=${photoId}`, { method: 'DELETE' });
    if (selectedProperty) loadPropertyPhotos(selectedProperty.id);
  };'''

share_func = '''const deletePhoto = async (photoId: string) => {
    if (!confirm('¿Eliminar esta foto?')) return;
    await fetch(`/api/photos?id=${photoId}`, { method: 'DELETE' });
    if (selectedProperty) loadPropertyPhotos(selectedProperty.id);
  };

  const shareViaWhatsApp = (url: string, type: string, name: string) => {
    const message = encodeURIComponent(`${type}: ${name}\\n${url}`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };'''

content = content.replace(old_delete_photo, share_func)

# Add share button next to photo delete button
old_photo_grid = '''<div key={photo.id} className="relative group">
                        <img src={photo.url} alt="Propiedad" className="w-full h-24 object-cover rounded" />
                        <button onClick={() => deletePhoto(photo.id)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 text-xs opacity-0 group-hover:opacity-100 transition">✕</button>
                      </div>'''

new_photo_grid = '''<div key={photo.id} className="relative group">
                        <img src={photo.url} alt="Propiedad" className="w-full h-24 object-cover rounded cursor-pointer" onClick={() => window.open(photo.url, '_blank')} />
                        <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                          <button onClick={() => shareViaWhatsApp(photo.url, 'Foto', selectedProperty?.name || '')} className="bg-green-500 text-white rounded-full w-6 h-6 text-xs">↗</button>
                          <button onClick={() => deletePhoto(photo.id)} className="bg-red-500 text-white rounded-full w-6 h-6 text-xs">✕</button>
                        </div>
                      </div>'''

content = content.replace(old_photo_grid, new_photo_grid)

# Add share button to documents
old_doc_item = '''<div key={doc.id} className="flex items-center justify-between bg-stone-50 p-2 rounded">
                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="flex-1 text-amber-600 hover:text-amber-700">
                          <span className="text-xs bg-stone-200 px-2 py-1 rounded mr-2">{getDocTypeLabel(doc.docType)}</span>
                          {doc.filename}
                        </a>
                        <button onClick={() => deleteDocument(doc.id)} className="text-red-400 hover:text-red-600 ml-2">✕</button>
                      </div>'''

new_doc_item = '''<div key={doc.id} className="flex items-center justify-between bg-stone-50 p-2 rounded">
                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="flex-1 text-amber-600 hover:text-amber-700">
                          <span className="text-xs bg-stone-200 px-2 py-1 rounded mr-2">{getDocTypeLabel(doc.docType)}</span>
                          {doc.filename}
                        </a>
                        <div className="flex gap-1 ml-2">
                          <button onClick={() => shareViaWhatsApp(doc.url, getDocTypeLabel(doc.docType), doc.filename)} className="text-green-500 hover:text-green-600">↗</button>
                          <button onClick={() => deleteDocument(doc.id)} className="text-red-400 hover:text-red-600">✕</button>
                        </div>
                      </div>'''

content = content.replace(old_doc_item, new_doc_item)

with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'w') as f:
    f.write(content)

print('WhatsApp share buttons added correctly')
