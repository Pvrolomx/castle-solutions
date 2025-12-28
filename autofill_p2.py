with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'r') as f:
    content = f.read()

# Add extract button to Client Form Modal (after the title)
old_client_form_title = '''<h2 className="text-xl font-semibold mb-4">Nuevo Cliente</h2>
              <form onSubmit={submitClient} className="space-y-4">'''

new_client_form_title = '''<h2 className="text-xl font-semibold mb-4">Nuevo Cliente</h2>
              <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-700 mb-2">🤖 Auto-llenar con IA (sube contrato/INE)</p>
                <UploadButton
                  endpoint="documentUploader"
                  onClientUploadComplete={(res) => {
                    if (res && res[0]) handleExtractUpload(res[0].url, 'client');
                  }}
                  onUploadError={(error: Error) => alert(`Error: ${error.message}`)}
                  appearance={{ button: { background: '#7c3aed', padding: '8px 16px', fontSize: '12px' } }}
                />
                {extracting && <p className="text-xs text-purple-500 mt-2">Extrayendo datos...</p>}
              </div>
              <form onSubmit={submitClient} className="space-y-4">'''

content = content.replace(old_client_form_title, new_client_form_title)

# Add extract button to Property Form Modal
old_prop_form_title = '''<h2 className="text-xl font-semibold mb-4">Nueva Propiedad</h2>
              <form onSubmit={submitProperty} className="space-y-4">'''

new_prop_form_title = '''<h2 className="text-xl font-semibold mb-4">Nueva Propiedad</h2>
              <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-700 mb-2">🤖 Auto-llenar con IA (sube contrato)</p>
                <UploadButton
                  endpoint="documentUploader"
                  onClientUploadComplete={(res) => {
                    if (res && res[0]) handleExtractUpload(res[0].url, 'property');
                  }}
                  onUploadError={(error: Error) => alert(`Error: ${error.message}`)}
                  appearance={{ button: { background: '#7c3aed', padding: '8px 16px', fontSize: '12px' } }}
                />
                {extracting && <p className="text-xs text-purple-500 mt-2">Extrayendo datos...</p>}
              </div>
              <form onSubmit={submitProperty} className="space-y-4">'''

content = content.replace(old_prop_form_title, new_prop_form_title)

# Add extract button to Contact Form Modal
old_contact_form_title = '''<h2 className="text-xl font-semibold mb-4">Nuevo Contacto</h2>
              <form onSubmit={submitContact} className="space-y-4">'''

new_contact_form_title = '''<h2 className="text-xl font-semibold mb-4">Nuevo Contacto</h2>
              <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-700 mb-2">🤖 Auto-llenar con IA</p>
                <UploadButton
                  endpoint="documentUploader"
                  onClientUploadComplete={(res) => {
                    if (res && res[0]) handleExtractUpload(res[0].url, 'contact');
                  }}
                  onUploadError={(error: Error) => alert(`Error: ${error.message}`)}
                  appearance={{ button: { background: '#7c3aed', padding: '8px 16px', fontSize: '12px' } }}
                />
                {extracting && <p className="text-xs text-purple-500 mt-2">Extrayendo datos...</p>}
              </div>
              <form onSubmit={submitContact} className="space-y-4">'''

content = content.replace(old_contact_form_title, new_contact_form_title)

with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'w') as f:
    f.write(content)

print('Extract UI added to forms')
