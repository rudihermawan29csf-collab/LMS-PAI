
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
  type?: 'link' | 'html'; 
  url?: string; 
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
  contents: ContentSection[];
  videos: ResourceItem[];
  quizzes: ResourceItem[];
}

export interface Semester {
  id: 'ganjil' | 'genap';
  name: string;
  grades?: ResourceItem; // Nilai is per semester now
  exams?: ResourceItem[]; // Bank Soal STS / SAS
  chapters: Chapter[];
}

export interface ClassData {
  id: string; // '7A', '7B', etc.
  name: string; // 'Kelas VII A'
  gradeLevel: '7' | '8' | '9'; 
  color: string; 
  icon: string;
  schedule?: ResourceItem; 
  grades?: ResourceItem; 
  semesters: Semester[];
}

export interface SchoolProfile {
  name: string;
  description: string;
  address: string;
  email: string;
  teacherName: string;
  phoneNumber: string; 
  greetingText: string; // Teks salam di robot
  quotes: string[]; // 5 Kata motivasi
}

export interface Student {
  id: string;
  name: string;
  nis: string;
  gender: 'L' | 'P';
  classId: string; 
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
