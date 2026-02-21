import { prisma } from '../lib/prisma';
import dbSyncHandler from '../api/install/db-sync';
import { AppRole } from '../services/rbac-service';

/**
 * Interface untuk User Session
 */
export interface UserSession {
  id: string;
  email: string;
  role: AppRole;
  tenantId: string;
  permissions: string[];
}

/**
 * ACTION: Mengambil Statistik Dashboard
 */
export async function getDashboardStats(session: UserSession) {
  if (!session || !session.tenantId) {
    throw new Error("Unauthorized: Missing session or tenant context.");
  }

  try {
    const [userCount, subjectCount, lessonCount] = await Promise.all([
      prisma.user.count(session.tenantId),
      prisma.subject.count(session.tenantId),
      prisma.lesson.count(session.tenantId)
    ]);

    return {
      success: true,
      data: { userCount, subjectCount, lessonCount }
    };
  } catch (error: any) {
    console.error("[Server Action Error]:", error);
    return { success: false, error: error.message };
  }
}

/**
 * ACTION: Inisialisasi Database (Public/Bootstrap)
 * Digunakan untuk pertama kali setup saat tabel belum ada.
 */
export async function initializeDatabasePublic() {
  try {
    const result = await dbSyncHandler();
    return result;
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * ACTION: Sinkronisasi Database (Admin Only)
 */
export async function performDatabaseSync(session: UserSession) {
  if (session.role !== 'ADMIN') {
    throw new Error("Forbidden: Hanya Admin yang dapat memperbarui skema database.");
  }

  try {
    const result = await dbSyncHandler();
    return result;
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
