import 'dotenv/config';
import { prisma } from './lib/prisma';

async function audit() {
  const report: any = {
    connection: false,
    syncStatus: 'Unknown',
    tables: {},
    counts: {},
    schema: {}
  };

  console.log("Starting Database Audit...");

  try {
    // 1. Check Connection & Basic Query
    const tenantCount = await prisma.tenant.findUnique('pkbm-pena-hikmah');
    if (tenantCount) {
      report.connection = true;
      report.syncStatus = 'Synced (Tenant found)';
    } else {
      report.connection = true;
      report.syncStatus = 'Connected but empty (Tenant not found)';
    }

    // 2. Get Table Counts
    const tables = ['User', 'Tenant', 'Student', 'Tutor', 'Subject', 'Lesson', 'RolePermission', 'Permission'];
    
    for (const table of tables) {
      try {
        // Using raw query to count because our prisma wrapper might not have count for all
        const res = await prisma.query(`SELECT COUNT(*)::int as count FROM "${table}"`);
        report.counts[table] = res.rows[0].count;
        report.tables[table] = 'Exists';
      } catch (e: any) {
        report.tables[table] = `Missing or Error: ${e.message}`;
      }
    }

    // 3. Get Schema Details (Columns)
    const schemaQuery = `
      SELECT table_name, column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position;
    `;
    const schemaRes = await prisma.query(schemaQuery);
    
    schemaRes.rows.forEach((row: any) => {
      if (!report.schema[row.table_name]) {
        report.schema[row.table_name] = [];
      }
      report.schema[row.table_name].push({
        column: row.column_name,
        type: row.data_type,
        nullable: row.is_nullable
      });
    });

  } catch (error: any) {
    console.error("Audit Fatal Error:", error);
    report.connection = false;
    report.error = error.message;
  }

  console.log(JSON.stringify(report, null, 2));
}

audit();
