"use server";

import { prisma } from '../lib/prisma';

export async function getPayments(tenantId: string) {
  try {
    // Note: Prisma wrapper might need update to support Payment queries directly if not generic enough
    // But assuming we can use raw query or extend the wrapper.
    // Let's use raw query for now as wrapper might be limited.
    const res = await prisma.query(`
      SELECT p.*, s.name as "studentName", s.nisn
      FROM "Payment" p
      JOIN "Student" s ON p."studentId" = s.id
      WHERE p."tenantId" = $1
      ORDER BY p."createdAt" DESC
    `, [tenantId]);
    return { success: true, data: res.rows };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createPayment(data: { studentId: string, amount: number, type: string, tenantId: string }) {
  try {
    const id = `pay_${Math.random().toString(36).substr(2, 9)}`;
    const res = await prisma.query(`
      INSERT INTO "Payment" ("id", "studentId", "amount", "type", "status", "tenantId", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, 'PENDING', $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `, [id, data.studentId, data.amount, data.type, data.tenantId]);
    return { success: true, data: res.rows[0] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updatePaymentStatus(id: string, status: 'PAID' | 'FAILED') {
  try {
    const res = await prisma.query(`
      UPDATE "Payment" SET "status" = $1, "paymentDate" = CURRENT_TIMESTAMP, "updatedAt" = CURRENT_TIMESTAMP
      WHERE "id" = $2
      RETURNING *
    `, [status, id]);
    return { success: true, data: res.rows[0] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
