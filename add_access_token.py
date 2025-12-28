with open('/home/pvrolo/castle-solutions/prisma/schema.prisma', 'r') as f:
    content = f.read()

# Add accessToken to Client model
old_client = '''model Client {
  id          String     @id @default(cuid())
  name        String
  phones      String
  email       String?
  notes       String?
  userId      String?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt'''

new_client = '''model Client {
  id          String     @id @default(cuid())
  name        String
  phones      String
  email       String?
  notes       String?
  userId      String?
  accessToken String?    @unique
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt'''

content = content.replace(old_client, new_client)

with open('/home/pvrolo/castle-solutions/prisma/schema.prisma', 'w') as f:
    f.write(content)

print('accessToken added to Client model')
