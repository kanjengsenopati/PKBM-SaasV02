"use server";

import { prisma } from '../lib/prisma';

export async function getReports(tenantId: string) {
  try {
    const res = await prisma.query(`
      SELECT r.*, s.name as "studentName"
      FROM "Report" r
      JOIN "Student" s ON r."studentId" = s.id
      WHERE r."tenantId" = $1
      ORDER BY r."createdAt" DESC
    `, [tenantId]);
    return { success: true, data: res.rows };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createReport(data: { studentId: string, tenantId: string, content: any }) {
  try {
    const id = `rpt_${Math.random().toString(36).substr(2, 9)}`;
    const res = await prisma.query(`
      INSERT INTO "Report" ("id", "studentId", "tenantId", "data", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `, [id, data.studentId, data.tenantId, JSON.stringify(data.content)]);
    return { success: true, data: res.rows[0] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
