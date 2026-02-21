"use server";

import { prisma } from '../lib/prisma';

export async function getUsers(tenantId: string) {
  try {
    const res = await prisma.query(`
      SELECT id, email, name, role, "createdAt", "updatedAt"
      FROM "User"
      WHERE "tenantId" = $1
      ORDER BY "createdAt" DESC
    `, [tenantId]);
    return { success: true, data: res.rows };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateUserRole(userId: string, newRole: string) {
  try {
    const res = await prisma.query(`
      UPDATE "User"
      SET role = $1, "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, email, role
    `, [newRole, userId]);
    return { success: true, data: res.rows[0] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteUser(userId: string) {
  try {
    await prisma.query(`DELETE FROM "User" WHERE id = $1`, [userId]);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
