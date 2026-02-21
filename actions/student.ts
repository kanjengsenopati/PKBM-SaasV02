"use server";

import { prisma } from '../lib/prisma';

export async function getStudents(tenantId: string) {
  try {
    const students = await prisma.student.findMany(tenantId);
    return { success: true, data: students };
  } catch (error: any) {
    console.error("[getStudents Error]:", error);
    return { success: false, error: error.message };
  }
}

export async function getStudentById(id: string) {
  try {
    const student = await prisma.student.findUnique(id);
    if (!student) return { success: false, error: "Siswa tidak ditemukan." };
    return { success: true, data: student };
  } catch (error: any) {
    console.error("[getStudentById Error]:", error);
    return { success: false, error: error.message };
  }
}

export async function updateStudent(id: string, data: { 
  nisn?: string, 
  fullName?: string,
  birthPlace?: string,
  birthDate?: string | Date,
  program?: string, 
  grade?: string, 
  major?: string, 
  address?: string, 
  phoneNumber?: string, 
  status?: string,
  fatherName?: string,
  motherName?: string,
  parentJob?: string,
  parentPhone?: string,
  parentAddress?: string
}) {
  try {
    // 1. Jika ada fullName, update User record terlebih dahulu
    if (data.fullName !== undefined) {
      const student = await prisma.student.findUnique(id);
      if (student) {
        // Kita butuh tenantId untuk update user lewat prisma accessor kita
        // Tapi prisma accessor user.update butuh tenantId.
        // Mari kita cari user-nya dulu untuk dapat tenantId
        const userRes = await prisma.query('SELECT "tenantId" FROM "User" WHERE "id" = $1', [student.userId]);
        if (userRes.rows.length > 0) {
          const tenantId = userRes.rows[0].tenantId;
          await prisma.user.update(student.userId, tenantId, { fullName: data.fullName, name: data.fullName });
        }
      }
    }

    // 2. Update data akademik di Student record
    const { fullName, ...academicData } = data;
    const student = await prisma.student.update(id, academicData);
    return { 
      success: true, 
      message: 'Data siswa berhasil diperbarui.',
      data: student 
    };
  } catch (error: any) {
    console.error("[updateStudent Error]:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteStudent(id: string) {
  try {
    await prisma.student.delete(id);
    return { success: true, message: 'Data siswa berhasil dihapus.' };
  } catch (error: any) {
    console.error("[deleteStudent Error]:", error);
    return { success: false, error: error.message };
  }
}
