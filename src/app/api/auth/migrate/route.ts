import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * POST /api/auth/migrate
 *
 * One-time migration: adds RBAC columns to the User table if they are missing,
 * then promotes all existing active users to super_admin so they can log in.
 *
 * Safe to call multiple times — it checks before altering.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))

    // Simple protection: require an email to promote
    const promoteEmail = body.email as string | undefined

    // ─── 1. Check which columns already exist ───────────────
    const tableInfo: string[] = []

    try {
      const result = await db.$queryRawUnsafe(
        `SELECT column_name FROM information_schema.columns WHERE table_name = 'User' ORDER BY ordinal_position`
      ) as { column_name: string }[]

      tableInfo.push(...result.map(r => r.column_name))
    } catch {
      return NextResponse.json(
        { error: 'No se pudo leer la estructura de la tabla User' },
        { status: 500 }
      )
    }

    const missingColumns: string[] = []

    // Define columns to add: [name, type, default, isNullable]
    const columnsToAdd: { name: string; sql: string }[] = []

    if (!tableInfo.includes('role')) {
      columnsToAdd.push({
        name: 'role',
        sql: `ALTER TABLE "User" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'viewer'; CREATE TYPE "Role" AS ENUM ('viewer', 'editor', 'admin', 'super_admin'); ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role" USING "role"::"Role";`,
      })
      missingColumns.push('role')
    }

    if (!tableInfo.includes('isActive')) {
      columnsToAdd.push({
        name: 'isActive',
        sql: `ALTER TABLE "User" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;`,
      })
      missingColumns.push('isActive')
    }

    if (!tableInfo.includes('lastLogin')) {
      columnsToAdd.push({
        name: 'lastLogin',
        sql: `ALTER TABLE "User" ADD COLUMN "lastLogin" TIMESTAMP(3);`,
      })
      missingColumns.push('lastLogin')
    }

    if (!tableInfo.includes('inviteCodeId')) {
      columnsToAdd.push({
        name: 'inviteCodeId',
        sql: `ALTER TABLE "User" ADD COLUMN "inviteCodeId" TEXT UNIQUE REFERENCES "InviteCode"("id") ON DELETE SET NULL;`,
      })
      missingColumns.push('inviteCodeId')
    }

    // ─── 2. Add missing columns ─────────────────────────────
    const applied: string[] = []

    for (const col of columnsToAdd) {
      try {
        // Handle role specially because of the enum type
        if (col.name === 'role') {
          // Check if Role enum type already exists
          const enumExists = await db.$queryRawUnsafe(
            `SELECT typname FROM pg_type WHERE typname = 'Role'`
          ) as { typname: string }[]

          if (enumExists.length === 0) {
            await db.$executeRawUnsafe(`CREATE TYPE "Role" AS ENUM ('viewer', 'editor', 'admin', 'super_admin');`)
          }
          await db.$executeRawUnsafe(
            `ALTER TABLE "User" ADD COLUMN "role" "Role" NOT NULL DEFAULT 'viewer';`
          )
        } else {
          await db.$executeRawUnsafe(col.sql)
        }
        applied.push(col.name)
      } catch (err: any) {
        console.error(`Failed to add column ${col.name}:`, err.message)
        // Continue with other columns even if one fails
      }
    }

    // ─── 3. Promote existing users to super_admin ───────────
    let promoted = 0

    if (promoteEmail) {
      const result = await db.$executeRawUnsafe(
        `UPDATE "User" SET "role" = 'super_admin' WHERE email = $1;`,
        promoteEmail
      )
      promoted = 1
    } else {
      // Promote ALL existing users to super_admin (safe default for existing data)
      const result = await db.$executeRawUnsafe(
        `UPDATE "User" SET "role" = 'super_admin' WHERE "role" = 'viewer';`
      )
      promoted = 1 // at least attempted
    }

    // ─── 4. Verify ──────────────────────────────────────────
    const users = await db.$queryRawUnsafe(
      `SELECT id, email, name, "role", "isActive" FROM "User" ORDER BY "createdAt" ASC`
    ) as Array<{ id: string; email: string; name: string; role: string; isActive: boolean }>

    return NextResponse.json({
      success: true,
      message: 'Migración completada exitosamente',
      existingColumns: tableInfo,
      missingColumns,
      appliedColumns: applied,
      promotedToSuperAdmin: promoted,
      currentUsers: users.map(u => ({
        email: u.email,
        name: u.name,
        role: u.role,
        isActive: u.isActive,
      })),
    })
  } catch (error: any) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { error: 'Error en la migración', details: error.message },
      { status: 500 }
    )
  }
}

// Also allow GET to check status without modifying
export async function GET() {
  try {
    const result = await db.$queryRawUnsafe(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'User' ORDER BY ordinal_position`
    ) as { column_name: string }[]

    const columns = result.map(r => r.column_name)

    return NextResponse.json({
      userColumns: columns,
      hasRole: columns.includes('role'),
      hasIsActive: columns.includes('isActive'),
      hasLastLogin: columns.includes('lastLogin'),
      hasInviteCodeId: columns.includes('inviteCodeId'),
      needsMigration: !columns.includes('role'),
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'No se pudo verificar la estructura', details: error.message },
      { status: 500 }
    )
  }
}
