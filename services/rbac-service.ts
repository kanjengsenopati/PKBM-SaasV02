/**
 * Definisi Role yang tersedia di sistem
 */
export type AppRole = 'ADMIN' | 'TUTOR' | 'SISWA';

/**
 * Mendapatkan daftar menu yang diizinkan untuk role tertentu
 * Sekarang menggunakan daftar permission yang ada di session user
 */
export function getAuthorizedMenus(permissions: string[], allMenus: any[]) {
  return allMenus.filter(menu => permissions.includes(menu.name));
}

/**
 * Mengecek apakah menu tertentu diizinkan
 */
export function isMenuAuthorized(permissions: string[], menuName: string): boolean {
  return permissions.includes(menuName);
}

/**
 * Helper untuk fitur spesifik
 */
export function hasFeatureAccess(role: AppRole, feature: 'DB_SYNC' | 'MANAGE_RBAC'): boolean {
  if (role === 'ADMIN') return true;
  return false;
}
