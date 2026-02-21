"use server";

import { prisma } from '../lib/prisma';

export async function getDatabaseSchema() {
  try {
    const schemaQuery = `
      SELECT table_name, column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position;
    `;
    const res = await prisma.query(schemaQuery);
    
    const schema: Record<string, any[]> = {};
    res.rows.forEach((row: any) => {
      if (!schema[row.table_name]) {
        schema[row.table_name] = [];
      }
      schema[row.table_name].push({
        column: row.column_name,
        type: row.data_type,
        nullable: row.is_nullable
      });
    });

    return { success: true, data: schema };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
