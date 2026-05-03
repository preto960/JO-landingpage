import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database with test users...\n')

  // Admin user
  const adminPassword = await bcrypt.hash('Admin@1234', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@joshop.com' },
    update: {},
    create: {
      name: 'Administrador JO-Shop',
      email: 'admin@joshop.com',
      password: adminPassword,
      role: 'admin',
      emailVerified: new Date(),
      isActive: true,
    },
  })
  console.log(`✅ Admin creado: ${admin.email} (role: ${admin.role})`)

  // Regular user
  const userPassword = await bcrypt.hash('User@1234', 12)
  const user = await prisma.user.upsert({
    where: { email: 'usuario@joshop.com' },
    update: {},
    create: {
      name: 'Usuario Demo',
      email: 'usuario@joshop.com',
      password: userPassword,
      role: 'user',
      emailVerified: new Date(),
      isActive: true,
    },
  })
  console.log(`✅ Usuario creado: ${user.email} (role: ${user.role})`)

  // Audit logs
  await prisma.auditLog.createMany({
    data: [
      {
        userId: admin.id,
        action: 'USER_SEEDED',
        details: 'Admin test user created via seed script',
      },
      {
        userId: user.id,
        action: 'USER_SEEDED',
        details: 'Regular test user created via seed script',
      },
    ],
    skipDuplicates: true,
  })

  console.log('\n📋 Credenciales de prueba:')
  console.log('─────────────────────────────────────')
  console.log('👤 ADMIN:')
  console.log('   Email:    admin@joshop.com')
  console.log('   Password: Admin@1234')
  console.log('')
  console.log('👤 USUARIO:')
  console.log('   Email:    usuario@joshop.com')
  console.log('   Password: User@1234')
  console.log('─────────────────────────────────────')
  console.log('\n✨ Seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
