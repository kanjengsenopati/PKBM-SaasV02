import 'dotenv/config';
import { prisma, hashPassword } from './lib/prisma';

const tenantId = 'pkbm-pena-hikmah';

async function seedTutors() {
  console.log('Seeding 5 Tutors...');

  const tutors = [
    { 
      name: 'Ahmad Dahlan', 
      email: 'ahmad.dahlan@example.com', 
      specialization: 'Matematika', 
      nuptk: '1234567890123456',
      address: 'Jl. Ahmad Yani No. 123, Jakarta Pusat',
      birthPlace: 'Yogyakarta',
      birthDate: '1985-05-20',
      phoneNumber: '081234567890',
      educationHistory: JSON.stringify([
        { no: 1, institution: 'Universitas Negeri Yogyakarta', major: 'Pendidikan Matematika', year: '2007', degree: 'S.Pd' },
        { no: 2, institution: 'Universitas Gadjah Mada', major: 'Matematika Murni', year: '2010', degree: 'M.Si' }
      ])
    },
    { 
      name: 'Siti Aminah', 
      email: 'siti.aminah@example.com', 
      specialization: 'Bahasa Indonesia', 
      nuptk: '2234567890123456',
      address: 'Jl. Merdeka No. 45, Bandung',
      birthPlace: 'Bandung',
      birthDate: '1990-08-17',
      phoneNumber: '081298765432',
      educationHistory: JSON.stringify([
        { no: 1, institution: 'Universitas Pendidikan Indonesia', major: 'Pendidikan Bahasa Indonesia', year: '2012', degree: 'S.Pd' }
      ])
    },
    { 
      name: 'Budi Santoso', 
      email: 'budi.santoso@example.com', 
      specialization: 'IPA', 
      nuptk: '3234567890123456',
      address: 'Jl. Diponegoro No. 10, Semarang',
      birthPlace: 'Semarang',
      birthDate: '1988-12-10',
      phoneNumber: '081345678901',
      educationHistory: JSON.stringify([
        { no: 1, institution: 'Universitas Negeri Semarang', major: 'Pendidikan Fisika', year: '2010', degree: 'S.Pd' }
      ])
    },
    { 
      name: 'Dewi Sartika', 
      email: 'dewi.sartika@example.com', 
      specialization: 'IPS', 
      nuptk: '4234567890123456',
      address: 'Jl. Sudirman No. 88, Surabaya',
      birthPlace: 'Surabaya',
      birthDate: '1992-03-25',
      phoneNumber: '081456789012',
      educationHistory: JSON.stringify([
        { no: 1, institution: 'Universitas Negeri Surabaya', major: 'Pendidikan Sejarah', year: '2014', degree: 'S.Pd' }
      ])
    },
    { 
      name: 'Ki Hajar', 
      email: 'ki.hajar@example.com', 
      specialization: 'PKn', 
      nuptk: '5234567890123456',
      address: 'Jl. Malioboro No. 1, Yogyakarta',
      birthPlace: 'Yogyakarta',
      birthDate: '1980-05-02',
      phoneNumber: '081567890123',
      educationHistory: JSON.stringify([
        { no: 1, institution: 'Universitas Negeri Yogyakarta', major: 'Pendidikan Kewarganegaraan', year: '2003', degree: 'S.Pd' },
        { no: 2, institution: 'Universitas Negeri Yogyakarta', major: 'Pendidikan Kewarganegaraan', year: '2006', degree: 'M.Pd' }
      ])
    },
  ];

  for (const t of tutors) {
    try {
      // 1. Create User
      const userId = `user_${Math.random().toString(36).substr(2, 9)}`;
      const hashedPassword = await hashPassword('password123');
      
      await prisma.query(`
        INSERT INTO "User" (id, email, role, "tenantId", name, password, "createdAt", "updatedAt")
        VALUES ($1, $2, 'TUTOR', $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (email) DO NOTHING
      `, [userId, t.email, tenantId, t.name, hashedPassword]);

      // Get the user id (in case it already existed)
      const userRes = await prisma.query(`SELECT id FROM "User" WHERE email = $1`, [t.email]);
      const finalUserId = userRes.rows[0].id;

      // 2. Create Tutor
      const tutorId = `tutor_${Math.random().toString(36).substr(2, 9)}`;
      
      // Check if tutor exists for this user OR by NUPTK
      const existingTutor = await prisma.query(`SELECT id, "userId" FROM "Tutor" WHERE "userId" = $1 OR "nuptk" = $2`, [finalUserId, t.nuptk]);
      
      if (existingTutor.rows.length > 0) {
        // Update existing tutor
        const targetUserId = existingTutor.rows[0].userId;
        await prisma.query(`
          UPDATE "Tutor" 
          SET "nuptk" = $1, "fullName" = $2, "specialization" = $3, 
              "address" = $4, "birthPlace" = $5, "birthDate" = $6, 
              "phoneNumber" = $7, "educationHistory" = $8, "updatedAt" = CURRENT_TIMESTAMP
          WHERE "userId" = $9
        `, [t.nuptk, t.name, t.specialization, t.address, t.birthPlace, t.birthDate, t.phoneNumber, t.educationHistory, targetUserId]);
        console.log(`Updated tutor: ${t.name}`);
      } else {
        // Insert new tutor
        await prisma.query(`
          INSERT INTO "Tutor" (id, "userId", nuptk, "fullName", specialization, "createdAt", "updatedAt", status, "address", "birthPlace", "birthDate", "phoneNumber", "educationHistory")
          VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'AKTIF', $6, $7, $8, $9, $10)
        `, [tutorId, finalUserId, t.nuptk, t.name, t.specialization, t.address, t.birthPlace, t.birthDate, t.phoneNumber, t.educationHistory]);
        console.log(`Seeded tutor: ${t.name}`);
      }
    } catch (error) {
      console.error(`Failed to seed ${t.name}:`, error);
    }
  }

  console.log('Seeding complete.');
}

seedTutors();
