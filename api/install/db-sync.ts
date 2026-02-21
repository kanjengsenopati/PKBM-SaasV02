import { prisma } from '../../lib/prisma';

export default async function handler() {
  try {
    console.log('Synchronizing database with Official "name" Column Support...');

    // 1. Role Enum
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "Role" AS ENUM ('ADMIN', 'TUTOR', 'SISWA');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);

    // 2. Core Tables - Tenant
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Tenant" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "npsn" TEXT,
        "address" TEXT,
        "foundationName" TEXT,
        "principalName" TEXT,
        "logoUrl" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Core Tables - User
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT PRIMARY KEY,
        "email" TEXT UNIQUE NOT NULL,
        "name" TEXT,
        "fullName" TEXT,
        "tenantId" TEXT NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE
      );
    `);

    // MIGRATION: Ensure "fullName" and "name" columns exist
    console.log('[Migration] Checking/Adding identity columns to User table...');
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "name" TEXT;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "fullName" TEXT;`);
    console.log('[Migration] Identity columns verified.');

    // Ensure other critical columns exist
    const userColumns = [
      ['password', 'TEXT'],
      ['role', '"Role" NOT NULL DEFAULT \'SISWA\''],
      ['createdAt', 'TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP'],
      ['updatedAt', 'TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP']
    ];

    for (const [col, type] of userColumns) {
      try {
        await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "${col}" ${type}`);
      } catch (e: any) {
        console.warn(`Could not add/update column ${col} in User:`, e.message);
      }
    }

    // 4. Seeding Default Tenant
    await prisma.$executeRawUnsafe(`
      INSERT INTO "Tenant" (id, name, npsn, address, "foundationName", "principalName") 
      VALUES ('pkbm-pena-hikmah', 'PKBM Pena Hikmah', '12345678', 'Jl. Pendidikan No. 123', 'Yayasan Bina Hikmah', 'H. Akhmad Fauzi, M.Pd') 
      ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
    `);

    // 5. Seeding Default Users
    const seedUsers = [
      { id: 'admin_ph', email: 'admin@penahikmah.com', name: 'Admin Utama', role: 'ADMIN' },
      { id: 'tutor_ph', email: 'tutor@penahikmah.com', name: 'Tutor Pengajar', role: 'TUTOR' },
      { id: 'siswa_ph', email: 'siswa@penahikmah.com', name: 'Siswa Belajar', role: 'SISWA' }
    ];

    for (const user of seedUsers) {
      await prisma.$executeRawUnsafe(`
        INSERT INTO "User" (id, email, "name", role, "tenantId", "password") 
        VALUES ($1, $2, $3, $4, 'pkbm-pena-hikmah', 'ef92b778bafe421e592046e03b0e12120e43960098f98c8a147395048d613936') 
        ON CONFLICT (email) DO UPDATE SET "name" = COALESCE(EXCLUDED."name", "User"."name"), role = EXCLUDED.role;
      `, user.id, user.email, user.name, user.role);
    }

    // 6. Student Table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Student" (
        "id" TEXT PRIMARY KEY,
        "userId" TEXT UNIQUE NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
        "nisn" TEXT UNIQUE,
        "birthPlace" TEXT,
        "birthDate" TIMESTAMP,
        "program" TEXT,
        "grade" TEXT,
        "major" TEXT,
        "address" TEXT,
        "phoneNumber" TEXT,
        "fatherName" TEXT,
        "motherName" TEXT,
        "parentJob" TEXT,
        "parentPhone" TEXT,
        "parentAddress" TEXT,
        "status" TEXT NOT NULL DEFAULT 'AKTIF',
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure new columns exist if table was already created
    const studentColumns = [
      ['birthPlace', 'TEXT'],
      ['birthDate', 'TIMESTAMP'],
      ['program', 'TEXT'],
      ['grade', 'TEXT'],
      ['major', 'TEXT'],
      ['fatherName', 'TEXT'],
      ['motherName', 'TEXT'],
      ['parentJob', 'TEXT'],
      ['parentPhone', 'TEXT'],
      ['parentAddress', 'TEXT']
    ];
    for (const [col, type] of studentColumns) {
      try {
        await prisma.$executeRawUnsafe(`ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "${col}" ${type}`);
      } catch (e) {}
    }

    // MIGRATION: Drop fullName from Student if it exists (Moved to User)
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE "Student" DROP COLUMN IF EXISTS "fullName";`);
    } catch (e) {}

    // 7. Tutor Table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Tutor" (
        "id" TEXT PRIMARY KEY,
        "userId" TEXT UNIQUE NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
        "nuptk" TEXT UNIQUE,
        "specialization" TEXT,
        "birthPlace" TEXT,
        "birthDate" TIMESTAMP,
        "address" TEXT,
        "phoneNumber" TEXT,
        "status" TEXT NOT NULL DEFAULT 'AKTIF',
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed a tutor record for the default tutor user
    await prisma.$executeRawUnsafe(`
      INSERT INTO "Tutor" (id, "userId", nuptk, specialization, status)
      VALUES ('t_tutor_ph', 'tutor_ph', '1234567890123456', 'Matematika & Sains', 'AKTIF')
      ON CONFLICT ("userId") DO UPDATE SET specialization = EXCLUDED.specialization;
    `);

    // 8. Payment Table (Keuangan)
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Payment" (
        "id" TEXT PRIMARY KEY,
        "studentId" TEXT NOT NULL REFERENCES "Student"("id") ON DELETE CASCADE,
        "amount" DECIMAL(10, 2) NOT NULL,
        "type" TEXT NOT NULL, -- SPP, Uang Gedung, dll
        "status" TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, PAID, FAILED
        "paymentDate" TIMESTAMP,
        "tenantId" TEXT NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    return { success: true, message: 'Database migrated successfully with Student, Tutor, and Payment support.' };
  } catch (error: any) {
    console.error('Migration Failed:', error);
    return { success: false, message: error.message };
  }
}
