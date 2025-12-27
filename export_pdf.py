with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'r') as f:
    content = f.read()

# Add jsPDF import at top
old_imports = "'use client';\n\nimport { useEffect, useState } from 'react';"
new_imports = "'use client';\n\nimport { useEffect, useState } from 'react';\nimport { jsPDF } from 'jspdf';"

content = content.replace(old_imports, new_imports)

# Add export functions after shareViaWhatsApp
export_funcs = '''

  const exportClientToPDF = (client: Client) => {
    const doc = new jsPDF();
    const phones = parsePhones(client.phones);
    
    doc.setFontSize(20);
    doc.text('FICHA DE CLIENTE', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    let y = 40;
    doc.text(`Nombre: ${client.name}`, 20, y); y += 10;
    doc.text(`Teléfono(s): ${phones.join(', ')}`, 20, y); y += 10;
    if (client.email) { doc.text(`Email: ${client.email}`, 20, y); y += 10; }
    if (client.notes) { doc.text(`Notas: ${client.notes}`, 20, y); y += 10; }
    
    y += 10;
    doc.setFontSize(14);
    doc.text(`Propiedades (${client.properties.length})`, 20, y); y += 10;
    doc.setFontSize(10);
    client.properties.forEach(p => {
      doc.text(`• ${p.name} - ${p.address}`, 25, y); y += 7;
    });
    
    doc.save(`cliente_${client.name.replace(/\\s+/g, '_')}.pdf`);
  };

  const exportPropertyToPDF = (property: Property) => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('FICHA DE PROPIEDAD', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    let y = 40;
    doc.text(`Nombre: ${property.name}`, 20, y); y += 10;
    doc.text(`Dirección: ${property.address}`, 20, y); y += 10;
    doc.text(`Tipo: ${property.propertyType}`, 20, y); y += 10;
    doc.text(`Régimen: ${property.regime}`, 20, y); y += 10;
    
    if (property.regime === 'condominio') {
      y += 5;
      doc.setFontSize(11);
      doc.text('DATOS DEL CONDOMINIO:', 20, y); y += 8;
      doc.setFontSize(10);
      if (property.condoName) { doc.text(`Nombre: ${property.condoName}`, 25, y); y += 7; }
      if (property.condoAdminName) { doc.text(`Administrador: ${property.condoAdminName}`, 25, y); y += 7; }
      if (property.condoAdminPhone) { doc.text(`Tel Admin: ${property.condoAdminPhone}`, 25, y); y += 7; }
      if (property.condoFee) { doc.text(`Cuota: ${property.condoFee}`, 25, y); y += 7; }
    }
    
    if (property.client) {
      y += 10;
      doc.setFontSize(11);
      doc.text('PROPIETARIO:', 20, y); y += 8;
      doc.setFontSize(10);
      doc.text(`Nombre: ${property.client.name}`, 25, y); y += 7;
      const clientPhones = parsePhones(property.client.phones);
      doc.text(`Teléfono: ${clientPhones.join(', ')}`, 25, y); y += 7;
      if (property.client.email) { doc.text(`Email: ${property.client.email}`, 25, y); y += 7; }
    }
    
    if (property.notes) {
      y += 10;
      doc.text(`Notas: ${property.notes}`, 20, y);
    }
    
    doc.save(`propiedad_${property.name.replace(/\\s+/g, '_')}.pdf`);
  };'''

content = content.replace(
    "window.open(`https://wa.me/?text=${message}`, '_blank');\n  };",
    "window.open(`https://wa.me/?text=${message}`, '_blank');\n  };" + export_funcs
)

# Add Export PDF button to client detail modal
old_client_btns = '''<div className="flex gap-2 mt-4">
                <button onClick={() => setSelectedClient(null)} className="flex-1 bg-stone-200 py-2 rounded hover:bg-stone-300">Cerrar</button>
                <button onClick={() => startEditClient(selectedClient)} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Editar</button>
                <button onClick={() => deleteClient(selectedClient.id)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Eliminar</button>
              </div>'''

new_client_btns = '''<div className="flex gap-2 mt-4">
                <button onClick={() => setSelectedClient(null)} className="flex-1 bg-stone-200 py-2 rounded hover:bg-stone-300">Cerrar</button>
                <button onClick={() => exportClientToPDF(selectedClient)} className="bg-purple-500 text-white px-3 py-2 rounded hover:bg-purple-600 text-sm">PDF</button>
                <button onClick={() => startEditClient(selectedClient)} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Editar</button>
                <button onClick={() => deleteClient(selectedClient.id)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Eliminar</button>
              </div>'''

content = content.replace(old_client_btns, new_client_btns)

# Add Export PDF button to property detail modal
old_prop_btns = '''<div className="flex gap-2 mt-4">
                <button onClick={() => setSelectedProperty(null)} className="flex-1 bg-stone-200 py-2 rounded hover:bg-stone-300">Cerrar</button>
                <button onClick={() => startEditProperty(selectedProperty)} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Editar</button>
                <button onClick={() => deleteProperty(selectedProperty.id)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Eliminar</button>
              </div>'''

new_prop_btns = '''<div className="flex gap-2 mt-4">
                <button onClick={() => setSelectedProperty(null)} className="flex-1 bg-stone-200 py-2 rounded hover:bg-stone-300">Cerrar</button>
                <button onClick={() => exportPropertyToPDF(selectedProperty)} className="bg-purple-500 text-white px-3 py-2 rounded hover:bg-purple-600 text-sm">PDF</button>
                <button onClick={() => startEditProperty(selectedProperty)} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Editar</button>
                <button onClick={() => deleteProperty(selectedProperty.id)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Eliminar</button>
              </div>'''

content = content.replace(old_prop_btns, new_prop_btns)

with open('/home/pvrolo/castle-solutions/src/app/page.tsx', 'w') as f:
    f.write(content)

print('PDF export added')
