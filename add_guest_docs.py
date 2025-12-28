with open('/home/pvrolo/castle-solutions/prisma/schema.prisma', 'r') as f:
    content = f.read()

# Add GuestDocument model
guest_doc_model = '''

model GuestDocument {
  id            String   @id @default(cuid())
  reservationId String
  docType       String   // pasaporte, visa, identificacion, otro
  filename      String
  url           String
  createdAt     DateTime @default(now())
  
  reservation   Reservation @relation(fields: [reservationId], references: [id], onDelete: Cascade)
  
  @@index([reservationId])
}
'''

# Add relation to Reservation
old_reservation_end = '''property      Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  
  @@index([propertyId])'''

new_reservation_end = '''property      Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  documents     GuestDocument[]
  
  @@index([propertyId])'''

content = content.replace(old_reservation_end, new_reservation_end)
content = content + guest_doc_model

with open('/home/pvrolo/castle-solutions/prisma/schema.prisma', 'w') as f:
    f.write(content)

print('GuestDocument model added')
