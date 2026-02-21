"use server";

import { prisma } from '../lib/prisma';

export async function getTenantProfile(id: string) {
  try {
    const tenant = await prisma.tenant.findUnique(id);
    return { success: true, data: tenant };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateTenantProfile(id: string, data: { 
  name: string, 
  npsn: string, 
  address: string, 
  foundationName: string, 
  principalName: string, 
  logoUrl?: string 
}) {
  try {
    const tenant = await prisma.tenant.update(id, data);
    return { 
      success: true, 
      message: 'Profil lembaga berhasil diperbarui dan disimpan.',
      data: tenant 
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
