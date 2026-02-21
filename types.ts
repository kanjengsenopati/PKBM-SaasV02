
export enum StudentStatus {
  ACTIVE = 'AKTIF',
  INACTIVE = 'NON-AKTIF',
  GRADUATED = 'LULUS'
}

export interface Course {
  id: string;
  name: string;
  code: string;
  category: string;
  studentsCount: number;
}

export interface PKBMStats {
  totalStudents: number;
  activeCourses: number;
  totalTeachers: number;
  completionRate: number;
}
