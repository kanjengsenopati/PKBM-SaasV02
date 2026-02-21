import { Pool } from '@neondatabase/serverless';

// Deteksi lingkungan
const isBrowser = typeof window !== 'undefined';
const DATABASE_URL = (typeof process !== 'undefined' && process.env?.DATABASE_URL) || "";

const AUTH_SALT = (typeof process !== 'undefined' && process.env?.AUTH_SECRET) || "pkbm_default_secure_salt_2025_prod";

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + AUTH_SALT);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

class ServerPrismaClient {
  private pool: Pool | null = null;

  constructor() {
    // PROTEKSI: Jangan inisialisasi Pool jika di browser
    if (!isBrowser && DATABASE_URL) {
      this.pool = new Pool({ connectionString: DATABASE_URL });
    }
  }

  async query(sql: string, params: any[] = []) {
    if (isBrowser) {
      throw new Error("Security Violation: Database queries cannot be executed from the browser.");
    }

    if (!this.pool) {
      throw new Error("Database connection string (DATABASE_URL) is missing in server environment.");
    }

    try {
      return await this.pool.query(sql, params);
    } catch (err: any) {
      console.error(`[DB Error] SQL: ${sql} | Error: ${err.message}`);
      throw err;
    }
  }

  async $executeRawUnsafe(sql: string, ...params: any[]) {
    return await this.query(sql, params);
  }

  // Database accessors (Tenant, User, etc.) tetap sama seperti sebelumnya
  get tenant() {
    return {
      findUnique: async (id: string) => {
        try {
          const res = await this.query('SELECT * FROM "Tenant" WHERE "id" = $1 LIMIT 1', [id]);
          return res.rows.length > 0 ? res.rows[0] : null;
        } catch (e) { return null; }
      },
      update: async (id: string, data: any) => {
        const fields: string[] = [];
        const values: any[] = [];
        let idx = 1;
        const allowedFields = ['name', 'npsn', 'address', 'foundationName', 'principalName', 'logoUrl'];
        for (const field of allowedFields) {
          if (data[field] !== undefined) {
            fields.push(`"${field}" = $${idx++}`);
            values.push(data[field]);
          }
        }
        if (fields.length === 0) return null;
        values.push(id);
        const res = await this.query(`UPDATE "Tenant" SET ${fields.join(', ')}, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING *`, values);
        return res.rows[0];
      }
    };
  }

  get user() {
    return {
      count: async (tenantId: string) => {
        const res = await this.query('SELECT COUNT(*)::int as count FROM "User" WHERE "tenantId" = $1', [tenantId]);
        return res.rows[0].count;
      },
      findMany: async (tenantId: string) => {
        const res = await this.query('SELECT * FROM "User" WHERE "tenantId" = $1 ORDER BY "id" DESC', [tenantId]);
        return res.rows;
      },
      findUnique: async (email: string, tenantId: string) => {
        const res = await this.query('SELECT * FROM "User" WHERE "email" = $1 AND "tenantId" = $2 LIMIT 1', [email, tenantId]);
        return res.rows.length > 0 ? res.rows[0] : null;
      },
      create: async (data: any) => {
        const hashed = await hashPassword(data.password || 'password123');
        const res = await this.query(
          'INSERT INTO "User" ("id", "email", "name", "fullName", "role", "tenantId", "password") VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
          [data.id, data.email, data.name || '', data.fullName || '', data.role, data.tenantId, hashed]
        );
        return res.rows[0];
      },
      update: async (id: string, tenantId: string, data: any) => {
        const fields: string[] = [];
        const values: any[] = [];
        let idx = 1;
        if (data.name !== undefined) { fields.push(`"name" = $${idx++}`); values.push(data.name); }
        if (data.fullName !== undefined) { fields.push(`"fullName" = $${idx++}`); values.push(data.fullName); }
        if (data.role) { fields.push(`"role" = $${idx++}`); values.push(data.role); }
        if (data.password) { fields.push(`"password" = $${idx++}`); values.push(await hashPassword(data.password)); }
        if (fields.length === 0) return null;
        values.push(id); const idIdx = idx++;
        values.push(tenantId); const tenantIdx = idx++;
        const res = await this.query(`UPDATE "User" SET ${fields.join(', ')}, "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = $${idIdx} AND "tenantId" = $${tenantIdx} RETURNING *`, values);
        return res.rows[0];
      },
      delete: async (id: string, tenantId: string) => {
        return await this.query('DELETE FROM "User" WHERE "id" = $1 AND "tenantId" = $2', [id, tenantId]);
      }
    };
  }

  get permission() {
    return { findMany: async () => (await this.query('SELECT * FROM "Permission" ORDER BY "id" ASC')).rows };
  }

  get rolePermission() {
    return {
      findMany: async () => (await this.query('SELECT * FROM "RolePermission"')).rows,
      findByRole: async (role: string) => (await this.query('SELECT "permissionId" FROM "RolePermission" WHERE "role" = $1', [role])).rows.map(r => r.permissionId),
      delete: async (role: string, pid: string) => await this.query('DELETE FROM "RolePermission" WHERE "role" = $1 AND "permissionId" = $2', [role, pid]),
      create: async (role: string, pid: string) => await this.query('INSERT INTO "RolePermission" ("role", \"permissionId\") VALUES ($1, $2)', [role, pid])
    };
  }

  get subject() {
    return { 
      count: async (tid: string) => (await this.query('SELECT COUNT(*)::int as count FROM "Subject" WHERE "tenantId" = $1', [tid])).rows[0].count,
      findMany: async (tid: string) => (await this.query('SELECT * FROM "Subject" WHERE "tenantId" = $1 ORDER BY "name" ASC', [tid])).rows,
      create: async (data: any) => {
        const res = await this.query('INSERT INTO "Subject" ("id", "name", "tenantId") VALUES ($1, $2, $3) RETURNING *', [data.id, data.name, data.tenantId]);
        return res.rows[0];
      }
    };
  }

  get lesson() {
    return { 
      count: async (tid: string) => (await this.query('SELECT COUNT(*)::int as count FROM "Lesson" WHERE "tenantId" = $1', [tid])).rows[0].count,
      findMany: async (tid: string) => (await this.query('SELECT * FROM "Lesson" WHERE "tenantId" = $1 ORDER BY "title" ASC', [tid])).rows,
      create: async (data: any) => {
        const res = await this.query('INSERT INTO "Lesson" ("id", "title", "content", "subjectId", "tenantId") VALUES ($1, $2, $3, $4, $5) RETURNING *', [data.id, data.title, data.content, data.subjectId, data.tenantId]);
        return res.rows[0];
      }
    };
  }

  get exam() {
    return {
      findMany: async (tid: string) => (await this.query('SELECT * FROM "Exam" WHERE "tenantId" = $1 ORDER BY "title" ASC', [tid])).rows,
    };
  }

  get student() {
    return {
      findMany: async (tenantId: string) => {
        const res = await this.query(`
          SELECT s.*, u.name as "userName", u.email as "userEmail", u."fullName" as "fullName"
          FROM "Student" s
          JOIN "User" u ON s."userId" = u.id
          WHERE u."tenantId" = $1
          ORDER BY s."createdAt" DESC
        `, [tenantId]);
        return res.rows;
      },
      findUnique: async (id: string) => {
        const res = await this.query(`
          SELECT s.*, u.name as "userName", u.email as "userEmail", u."fullName" as "fullName"
          FROM "Student" s
          JOIN "User" u ON s."userId" = u.id
          WHERE s.id = $1
          LIMIT 1
        `, [id]);
        return res.rows.length > 0 ? res.rows[0] : null;
      },
      update: async (id: string, data: any) => {
        const fields: string[] = [];
        const values: any[] = [];
        let idx = 1;
        const allowedFields = [
          'nisn', 'birthPlace', 'birthDate', 'program', 'grade', 'major', 
          'address', 'phoneNumber', 'status', 'fatherName', 'motherName', 
          'parentJob', 'parentPhone', 'parentAddress'
        ];
        for (const field of allowedFields) {
          if (data[field] !== undefined) {
            fields.push(`"${field}" = $${idx++}`);
            values.push(data[field]);
          }
        }
        if (fields.length === 0) return null;
        values.push(id);
        const res = await this.query(`UPDATE "Student" SET ${fields.join(', ')}, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING *`, values);
        return res.rows[0];
      },
      delete: async (id: string) => {
        return await this.query('DELETE FROM "Student" WHERE id = $1', [id]);
      },
      create: async (data: any) => {
        const id = `s_${Math.random().toString(36).substr(2, 9)}`;
        const res = await this.query(
          'INSERT INTO "Student" ("id", "userId", "nisn", "program", "status") VALUES ($1, $2, $3, $4, $5) RETURNING *',
          [id, data.userId, data.nisn || null, data.program || null, 'AKTIF']
        );
        return res.rows[0];
      }
    };
  }

  get tutor() {
    return {
      findMany: async (tenantId: string) => {
        const res = await this.query(`
          SELECT t.*, u.name as "userName", u.email as "userEmail", u."fullName" as "fullName"
          FROM "Tutor" t
          JOIN "User" u ON t."userId" = u.id
          WHERE u."tenantId" = $1
          ORDER BY t."createdAt" DESC
        `, [tenantId]);
        return res.rows;
      },
      findUnique: async (id: string) => {
        const res = await this.query(`
          SELECT t.*, u.name as "userName", u.email as "userEmail", u."fullName" as "fullName"
          FROM "Tutor" t
          JOIN "User" u ON t."userId" = u.id
          WHERE t.id = $1
          LIMIT 1
        `, [id]);
        return res.rows.length > 0 ? res.rows[0] : null;
      },
      update: async (id: string, data: any) => {
        const fields: string[] = [];
        const values: any[] = [];
        let idx = 1;
        const allowedFields = [
          'nuptk', 'specialization', 'birthPlace', 'birthDate', 
          'address', 'phoneNumber', 'status', 'fullName', 'educationHistory'
        ];
        for (const field of allowedFields) {
          if (data[field] !== undefined) {
            fields.push(`"${field}" = $${idx++}`);
            values.push(data[field]);
          }
        }
        if (fields.length === 0) return null;
        values.push(id);
        const res = await this.query(`UPDATE "Tutor" SET ${fields.join(', ')}, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING *`, values);
        return res.rows[0];
      },
      delete: async (id: string) => {
        return await this.query('DELETE FROM "Tutor" WHERE id = $1', [id]);
      },
      create: async (data: any) => {
        const id = `t_${Math.random().toString(36).substr(2, 9)}`;
        const res = await this.query(
          'INSERT INTO "Tutor" ("id", "userId", "nuptk", "specialization", "status") VALUES ($1, $2, $3, $4, $5) RETURNING *',
          [id, data.userId, data.nuptk || null, data.specialization || null, 'AKTIF']
        );
        return res.rows[0];
      }
    };
  }
}

export const prisma = new ServerPrismaClient();
