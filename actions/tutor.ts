"use server";

import { prisma, hashPassword } from '../lib/prisma';

export async function getTutors(tenantId: string) {
  try {
    const tutors = await prisma.tutor.findMany(tenantId);
    return { success: true, data: tutors };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createTutor(data: { 
  name: string, 
  email: string, 
  nuptk: string, 
  specialization: string, 
  tenantId: string 
}) {
  try {
    // 1. Create User
    const userId = `user_${Math.random().toString(36).substr(2, 9)}`;
    const hashedPassword = await hashPassword('password123'); // Default password
    
    await prisma.query(`
      INSERT INTO "User" (id, email, role, "tenantId", name, password, "createdAt", "updatedAt")
      VALUES ($1, $2, 'TUTOR', $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [userId, data.email, data.tenantId, data.name, hashedPassword]);

    // 2. Create Tutor
    const tutorId = `tutor_${Math.random().toString(36).substr(2, 9)}`;
    const tutor = await prisma.query(`
      INSERT INTO "Tutor" (id, "userId", nuptk, "fullName", specialization, "createdAt", "updatedAt", status)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'AKTIF')
      RETURNING *
    `, [tutorId, userId, data.nuptk, data.name, data.specialization]);

    return { success: true, data: tutor.rows[0] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateTutor(id: string, data: any) {
  try {
    // 1. Update Tutor Table
    const tutor = await prisma.tutor.update(id, data);
    
    // 2. If name is provided, update User table as well
    if (data.fullName) {
      // First get the userId from the tutor record
      const currentTutor = await prisma.tutor.findUnique(id);
      if (currentTutor && currentTutor.userId) {
        // We need tenantId to update User, but updateTutor doesn't receive it.
        // However, prisma.user.update requires tenantId for safety.
        // Let's fetch the user to get the tenantId
        // Or we can use a raw query to update User by ID directly since ID is unique globally
        await prisma.query(`UPDATE "User" SET "name" = $1, "fullName" = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = $2`, [data.fullName, currentTutor.userId]);
      }
    }

    return { 
      success: true, 
      message: 'Data tutor berhasil diperbarui.',
      data: tutor 
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteTutor(id: string) {
  try {
    // Get tutor to find userId
    const currentTutor = await prisma.tutor.findUnique(id);
    
    // Delete Tutor
    await prisma.tutor.delete(id);
    
    // Optionally delete User if needed, but for safety maybe just keep it or soft delete?
    // Requirement says "delete action di modul Tutor".
    // If we delete the tutor profile, the user login might still be valid but they have no profile.
    // Let's delete the User as well to be clean, assuming 1-to-1 relationship for Tutor role.
    if (currentTutor && currentTutor.userId) {
       await prisma.query(`DELETE FROM "User" WHERE "id" = $1`, [currentTutor.userId]);
    }

    return { success: true, message: 'Data tutor berhasil dihapus.' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
