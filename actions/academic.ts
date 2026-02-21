"use server";

import { prisma } from '../lib/prisma';

// --- Subjects ---
export async function getSubjects(tenantId: string) {
  try {
    const subjects = await prisma.subject.findMany(tenantId);
    return { success: true, data: subjects };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createSubject(data: { name: string, tenantId: string }) {
  try {
    const id = `subj_${Math.random().toString(36).substr(2, 9)}`;
    const subject = await prisma.subject.create({ ...data, id });
    return { success: true, data: subject };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- Lessons ---
export async function getLessons(tenantId: string) {
  try {
    const lessons = await prisma.lesson.findMany(tenantId);
    return { success: true, data: lessons };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createLesson(data: { title: string, content: string, subjectId: string, tenantId: string }) {
  try {
    const id = `lsn_${Math.random().toString(36).substr(2, 9)}`;
    const lesson = await prisma.lesson.create({ ...data, id });
    return { success: true, data: lesson };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- Exams ---
export async function getExams(tenantId: string) {
  try {
    const exams = await prisma.exam.findMany(tenantId);
    return { success: true, data: exams };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
