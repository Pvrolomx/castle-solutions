with open('/home/pvrolo/castle-solutions/prisma/schema.prisma', 'r') as f:
    content = f.read()

# Add billing fields to Client
old_client = '''model Client {
  id          String     @id @default(cuid())
  name        String
  phones      String
  email       String?
  notes       String?
  userId      String?
  accessToken String?    @unique
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt'''

new_client = '''model Client {
  id              String     @id @default(cuid())
  name            String
  phones          String
  email           String?
  notes           String?
  userId          String?
  accessToken     String?    @unique
  commissionType  String     @default("percentage") // percentage, fixed
  commissionRate  Float      @default(15) // 15% or fixed amount
  cutoffDay       Int        @default(1) // day of month for billing
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt'''

content = content.replace(old_client, new_client)

# Add Invoice model
invoice_model = '''

model Invoice {
  id            String   @id @default(cuid())
  clientId      String
  period        String   // "2024-12"
  totalIncome   Float
  totalExpenses Float
  commission    Float
  netAmount     Float    // amount to pay to client
  status        String   @default("draft") // draft, sent, paid
  sentAt        DateTime?
  paidAt        DateTime?
  pdfUrl        String?
  notes         String?
  createdAt     DateTime @default(now())
  
  @@unique([clientId, period])
  @@index([clientId])
  @@index([period])
  @@index([status])
}
'''

content = content + invoice_model

with open('/home/pvrolo/castle-solutions/prisma/schema.prisma', 'w') as f:
    f.write(content)

print('Invoice model and billing fields added')
