import { prisma } from '../lib/prisma';

export type AppRole = 'ADMIN' | 'TUTOR' | 'SISWA';

export async function getPermissionMatrix() {
  try {
    const permissions = await prisma.permission.findMany();
    const rolePermissions = await prisma.rolePermission.findMany();
    
    return {
      success: true,
      permissions,
      rolePermissions
    };
  } catch (err: any) {
    console.error("Error in getPermissionMatrix:", err.message);
    return { success: false, error: err.message };
  }
}

export async function togglePermission(role: AppRole, permissionId: string, enabled: boolean) {
  try {
    if (enabled) {
      await prisma.rolePermission.create(role, permissionId);
    } else {
      await prisma.rolePermission.delete(role, permissionId);
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getPermissionsForRole(role: AppRole) {
  try {
    const perms = await prisma.rolePermission.findByRole(role);
    if (perms && perms.length > 0) return perms;
    
    // Fallback default jika tabel kosong
    if (role === 'ADMIN') {
      return ['Dashboard', 'Data Siswa', 'Data Tutor', 'Mata Pelajaran', 'Ujian & Tugas', 'Laporan', 'Profil PKBM', 'User Management'];
    }
    if (role === 'TUTOR') {
      return ['Dashboard', 'Data Siswa', 'Data Tutor', 'Mata Pelajaran', 'Ujian & Tugas'];
    }
    return ['Dashboard'];
  } catch (err: any) {
    console.warn(`Fallback permissions used for ${role}`);
    if (role === 'ADMIN') return ['Dashboard', 'Data Siswa', 'Data Tutor', 'Mata Pelajaran', 'Ujian & Tugas', 'Laporan', 'Profil PKBM', 'User Management'];
    if (role === 'TUTOR') return ['Dashboard', 'Data Siswa', 'Data Tutor', 'Mata Pelajaran', 'Ujian & Tugas'];
    return ['Dashboard'];
  }
}
