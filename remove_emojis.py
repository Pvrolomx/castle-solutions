with open('/home/pvrolo/castle-solutions/src/app/gastos/page.tsx', 'r') as f:
    content = f.read()

# Remove emojis from expense types
content = content.replace("{ value: 'luz', label: '💡 Luz'", "{ value: 'luz', label: 'Luz'")
content = content.replace("{ value: 'agua', label: '💧 Agua'", "{ value: 'agua', label: 'Agua'")
content = content.replace("{ value: 'gas', label: '🔥 Gas'", "{ value: 'gas', label: 'Gas'")
content = content.replace("{ value: 'telefono', label: '📞 Teléfono'", "{ value: 'telefono', label: 'Teléfono'")
content = content.replace("{ value: 'internet', label: '🌐 Internet'", "{ value: 'internet', label: 'Internet'")
content = content.replace("{ value: 'predial', label: '🏛️ Predial'", "{ value: 'predial', label: 'Predial'")
content = content.replace("{ value: 'fideicomiso', label: '📜 Fideicomiso'", "{ value: 'fideicomiso', label: 'Fideicomiso'")
content = content.replace("{ value: 'mantenimiento', label: '🔧 Mantenimiento'", "{ value: 'mantenimiento', label: 'Mantenimiento'")
content = content.replace("{ value: 'otro', label: '📋 Otro'", "{ value: 'otro', label: 'Otro'")

# Remove emoji from title
content = content.replace('📊 Control de Gastos', 'Control de Gastos')

# Remove emojis from action buttons
content = content.replace('💰 Pagar', 'Pagar')
content = content.replace('🗑️', 'Eliminar')

# Remove emoji from export button
content = content.replace('📥 Exportar CSV', 'Exportar CSV')

with open('/home/pvrolo/castle-solutions/src/app/gastos/page.tsx', 'w') as f:
    f.write(content)

print('Emojis removed from Gastos page')
