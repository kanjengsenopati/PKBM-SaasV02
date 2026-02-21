import 'dotenv/config';
import { prisma } from './lib/prisma';

async function migrateTutorEducation() {
  console.log('Migrating Tutor Education...');
  try {
    await prisma.query(`
      ALTER TABLE "Tutor"
      ADD COLUMN IF NOT EXISTS "educationHistory" JSONB DEFAULT '[]'
    `);
    console.log('Migration successful: Added educationHistory to Tutor table.');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrateTutorEducation();
