with open('/home/pvrolo/castle-solutions/prisma/schema.prisma', 'r') as f:
    content = f.read()

# Add ContractTemplate model
contract_model = '''

model ContractTemplate {
  id          String   @id @default(cuid())
  name        String
  filename    String
  url         String
  variables   String?  // JSON array of detected variables
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  contracts   Contract[]
}

model Contract {
  id            String   @id @default(cuid())
  templateId    String
  reservationId String?
  propertyId    String?
  clientId      String?
  filename      String
  url           String
  generatedAt   DateTime @default(now())
  
  template      ContractTemplate @relation(fields: [templateId], references: [id])
  
  @@index([templateId])
  @@index([reservationId])
}
'''

content = content + contract_model

with open('/home/pvrolo/castle-solutions/prisma/schema.prisma', 'w') as f:
    f.write(content)

print('Contract models added')
