"use server";

import { prisma } from '../lib/prisma';

export async function getUsers(tenantId: string) {
  try {
    const users = await prisma.user.findMany(tenantId);
    return { success: true, data: users };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createUser(data: { 
  email: string, 
  name: string, 
  fullName?: string, 
  role: string, 
  tenantId: string, 
  password?: string,
  nisn?: string,
  program?: string
}) {
  try {
    const id = `u_${Math.random().toString(36).substr(2, 9)}`;
    const user = await prisma.user.create({ ...data, id });
    
    // Jika role adalah SISWA, buatkan record Student
    if (data.role === 'SISWA') {
      await prisma.student.create({
        userId: id,
        nisn: data.nisn,
        program: data.program
      });
    }

    // Jika role adalah TUTOR, buatkan record Tutor
    if (data.role === 'TUTOR') {
      await prisma.tutor.create({
        userId: id
      });
    }

    return { 
      success: true, 
      message: 'Pengguna berhasil ditambahkan ke sistem.',
      data: user 
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateUser(id: string, tenantId: string, data: { name: string, fullName?: string, role: string, password?: string }) {
  try {
    const user = await prisma.user.update(id, tenantId, data);
    if (!user) {
      return { success: false, error: 'User tidak ditemukan atau Anda tidak memiliki akses.' };
    }
    return { 
      success: true, 
      message: 'Informasi pengguna berhasil diperbarui.',
      data: user 
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteUser(id: string, tenantId: string) {
  try {
    const result = await prisma.user.delete(id, tenantId);
    if (result.rowCount === 0) {
      return { success: false, error: 'Gagal menghapus: User tidak ditemukan atau akses ditolak.' };
    }
    return { 
      success: true,
      message: 'Pengguna berhasil dihapus dari sistem.'
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
