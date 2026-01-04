export enum ViewState {
  LANDING = 'LANDING',
  STUDENT_LOGIN = 'STUDENT_LOGIN',
  CLASS_DETAIL = 'CLASS_DETAIL',
  CHAPTER_CONTENT = 'CHAPTER_CONTENT',
  ADMIN_LOGIN = 'ADMIN_LOGIN',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
  EXTRA_CATEGORY_LIST = 'EXTRA_CATEGORY_LIST',
  EXTRA_DETAIL = 'EXTRA_DETAIL',
}

export interface ContentSection {
  id: string;
  title: string; // Judul sub-bab / materi
  content: string; // HTML Source Code
}

export interface ResourceItem {
  id: string;
  title: string; // Judul Video atau Kuis
  type: 'link' | 'html'; // Tipe resource
  url?: string;   // Link URL (jika type = link)
  content?: string; // HTML Code (jika type = html)
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  progress: number; // 0 to 100
  
  // New Array Structures
  contents: ContentSection[];
  videos: ResourceItem[];
  quizzes: ResourceItem[];
}

export interface Semester {
  id: 'ganjil' | 'genap';
  name: string;
  exams?: ResourceItem[]; // Bank Soal STS / SAS
  chapters: Chapter[];
}

export interface ClassData {
  id: string; // '7', '8', '9'
  name: string;
  color: string; // Tailwind color class base
  icon: string;
  schedule?: ResourceItem; // Jadwal Pelajaran (Class Level)
  grades?: ResourceItem;   // Monitoring Nilai (Class Level)
  semesters: Semester[];
}

export interface SchoolProfile {
  name: string;
  description: string;
  address: string;
  email: string;
  teacherName: string;
  phoneNumber: string; // Format: 628...
}

export interface Student {
  id: string;
  name: string;
  nis: string;
  gender: 'L' | 'P';
  classId: string; // '7', '8', '9'
}

export type ExtraCategory = 'doa' | 'cerita' | 'sholat' | 'fiqih' | 'hadist' | 'ramadhan' | 'lainnya';

export interface ExtraContent {
  id: string;
  title: string;
  category: ExtraCategory;
  type: 'link' | 'html';
  url?: string;
  content?: string;
}

export interface NavContext {
  view: ViewState;
  selectedClassId: string | null;
  selectedChapterId: string | null;
  navigate: (view: ViewState, classId?: string | null, chapterId?: string | null) => void;
}