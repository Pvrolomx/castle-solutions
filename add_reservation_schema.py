with open('/home/pvrolo/castle-solutions/prisma/schema.prisma', 'r') as f:
    content = f.read()

# Add Reservation model and update Property
reservation_model = '''

model Reservation {
  id            String   @id @default(cuid())
  propertyId    String
  
  // Guest info
  guestName     String
  guestEmail    String?
  guestPhone    String?
  guestCountry  String?
  guestPassport String?
  numGuests     Int      @default(1)
  
  // Dates
  checkIn       DateTime
  checkOut      DateTime
  
  // Booking details
  platform      String   @default("directo") // airbnb, booking, vrbo, directo
  status        String   @default("confirmada") // pendiente, confirmada, checkin, checkout, cancelada
  
  // Financials
  totalAmount   Float?
  paidAmount    Float?   @default(0)
  currency      String   @default("MXN")
  
  notes         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  property      Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  
  @@index([propertyId])
  @@index([checkIn])
  @@index([checkOut])
  @@index([status])
}
'''

# Add reservations relation to Property model
old_property_relations = '''client                Client   @relation(fields: [clientId], references: [id])
  photos                Photo[]
  expenses              Expense[]'''

new_property_relations = '''client                Client   @relation(fields: [clientId], references: [id])
  photos                Photo[]
  expenses              Expense[]
  reservations          Reservation[]'''

content = content.replace(old_property_relations, new_property_relations)

# Add reservation model at the end
content = content + reservation_model

with open('/home/pvrolo/castle-solutions/prisma/schema.prisma', 'w') as f:
    f.write(content)

print('Reservation model added to schema')
