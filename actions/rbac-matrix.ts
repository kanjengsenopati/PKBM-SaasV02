"use server";

import { prisma } from '../lib/prisma';

export async function getRBACData() {
  try {
    // Get all permissions
    const permRes = await prisma.query(`SELECT * FROM "Permission" ORDER BY name ASC`);
    
    // Get all role permissions
    const rolePermRes = await prisma.query(`SELECT * FROM "RolePermission"`);
    
    // Define Roles (Hardcoded for now as they are ENUM in DB usually, or we can fetch distinct if dynamic)
    // Based on previous context, roles are likely: ADMIN, TUTOR, STUDENT
    const roles = ['ADMIN', 'TUTOR', 'STUDENT'];

    return { 
      success: true, 
      data: {
        permissions: permRes.rows,
        rolePermissions: rolePermRes.rows,
        roles: roles
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleRolePermission(role: string, permissionId: string, enabled: boolean) {
  try {
    if (enabled) {
      // Add permission
      // Check if exists first to avoid duplicate error if not handled by DB constraint
      const check = await prisma.query(`SELECT id FROM "RolePermission" WHERE role = $1 AND "permissionId" = $2`, [role, permissionId]);
      if (check.rows.length === 0) {
        await prisma.query(`INSERT INTO "RolePermission" (role, "permissionId") VALUES ($1, $2)`, [role, permissionId]);
      }
    } else {
      // Remove permission
      await prisma.query(`DELETE FROM "RolePermission" WHERE role = $1 AND "permissionId" = $2`, [role, permissionId]);
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
