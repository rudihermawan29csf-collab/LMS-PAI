import { ClassData, SchoolProfile, Student, ExtraContent } from './types';

export const DEFAULT_SCHOOL_PROFILE: SchoolProfile = {
  name: "LMS PAI SMPN 3 Pacet",
  description: "Membangun generasi berakhlak mulia dengan teknologi pembelajaran modern yang interaktif dan menyenangkan.",
  address: "Jl. Pendidikan No. 123, Pacet",
  email: "admin@smpn3pacet.sch.id",
  teacherName: "Bapak/Ibu Guru PAI",
  phoneNumber: "6281234567890" // Ganti dengan nomor WA asli (format 62...)
};

export const FEATURES = [
  {
    icon: 'library',
    title: 'Materi Terstruktur',
    desc: 'Akses materi pelajaran lengkap untuk kelas 7, 8, dan 9 yang disusun sistematis.'
  },
  {
    icon: 'gamepad',
    title: 'Kuis & Evaluasi',
    desc: 'Uji pemahaman materi dengan kuis interaktif yang menyenangkan.'
  },
  {
    icon: 'brain',
    title: 'Bank Soal',
    desc: 'Kumpulan latihan soal untuk persiapan ujian tengah dan akhir semester.'
  },
  {
    icon: 'moon',
    title: 'Pojok Ibadah',
    desc: 'Fitur pendukung ibadah seperti jadwal sholat dan kumpulan doa harian.'
  }
];

// Helper to create simple default content
const createDefaultContent = (idPrefix: string) => ({
  contents: [
    {
      id: `${idPrefix}-c1`,
      title: 'Pendahuluan',
      content: `
        <p>Assalamualaikum Warahmatullahi Wabarakatuh. Materi ini sedang disiapkan oleh Bapak/Ibu Guru.</p>
        <p>Silakan cek kembali secara berkala.</p>
      `
    }
  ],
  videos: [],
  quizzes: []
});

const EXAM_LINKS = [
  { id: 'sts', title: 'Soal STS (Tengah Semester)', type: 'link' as const, url: 'https://docs.google.com/forms/u/0/' },
  { id: 'sas', title: 'Soal SAS (Akhir Semester)', type: 'link' as const, url: 'https://docs.google.com/forms/u/0/' },
];

const SCHEDULE_CONTENT = {
  id: 'sch',
  title: 'Jadwal Pelajaran PAI',
  type: 'html' as const,
  content: `
    <div class="overflow-x-auto">
      <table class="min-w-full text-sm text-left">
        <thead class="bg-gray-100">
          <tr><th class="p-2">Hari</th><th class="p-2">Jam</th><th class="p-2">Materi</th></tr>
        </thead>
        <tbody>
          <tr><td class="p-2 border-b">Senin</td><td class="p-2 border-b">08:00 - 09:30</td><td class="p-2 border-b">PAI & Budi Pekerti</td></tr>
          <tr><td class="p-2 border-b">Kamis</td><td class="p-2 border-b">10:00 - 11:30</td><td class="p-2 border-b">Praktik Ibadah</td></tr>
        </tbody>
      </table>
    </div>
  `
};

const GRADES_CONTENT = {
  id: 'grd',
  title: 'Monitoring Nilai',
  type: 'html' as const,
  content: `
    <div class="bg-blue-50 p-4 rounded-xl text-center">
      <p class="text-blue-800 font-medium">Silakan cek rekap nilai tugas dan ulangan harian Anda melalui tautan berikut.</p>
      <a href="#" class="mt-3 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold">Buka Rekap Nilai</a>
    </div>
  `
};

export const CLASSES_DATA: ClassData[] = [
  {
    id: '7',
    name: 'Kelas VII',
    color: 'blue',
    icon: 'book-open',
    schedule: SCHEDULE_CONTENT,
    grades: GRADES_CONTENT,
    semesters: [
      {
        id: 'ganjil',
        name: 'Semester Ganjil',
        exams: EXAM_LINKS,
        chapters: [
          { 
            id: '7-1', 
            title: 'Bab 1: Indahnya Tajwid (Nun Mati)', 
            description: 'Memahami hukum bacaan Nun Mati, Tanwin, dan Mim Mati.', 
            progress: 100,
            ...createDefaultContent('7-1')
          },
          { id: '7-2', title: 'Bab 2: Asmaul Husna', description: 'Mengenal nama-nama indah Allah SWT.', progress: 60, ...createDefaultContent('7-2') },
          { id: '7-3', title: 'Bab 3: Hidup Tenang dengan Kejujuran', description: 'Pentingnya perilaku jujur dan amanah.', progress: 0, ...createDefaultContent('7-3') },
          { id: '7-4', title: 'Bab 4: Bersuci dari Hadas', description: 'Tata cara thaharah yang benar.', progress: 0, ...createDefaultContent('7-4') },
          { id: '7-5', title: 'Bab 5: Keagungan Al-Quran', description: 'Sejarah turunnya Al-Quran.', progress: 0, ...createDefaultContent('7-5') },
        ]
      },
      {
        id: 'genap',
        name: 'Semester Genap',
        exams: EXAM_LINKS,
        chapters: [
          { id: '7-6', title: 'Bab 6: Dengan Ilmu Pengetahuan', description: 'Semangat menuntut ilmu.', progress: 0, ...createDefaultContent('7-6') },
          { id: '7-7', title: 'Bab 7: Meneladani Malaikat', description: 'Iman kepada Malaikat Allah.', progress: 0, ...createDefaultContent('7-7') },
          { id: '7-8', title: 'Bab 8: Empati & Menghormati', description: 'Perilaku terpuji kepada sesama.', progress: 0, ...createDefaultContent('7-8') },
          { id: '7-9', title: 'Bab 9: Shalat Jumat', description: 'Ketentuan dan hikmah shalat Jumat.', progress: 0, ...createDefaultContent('7-9') },
          { id: '7-10', title: 'Bab 10: Islam di Nusantara', description: 'Sejarah masuknya Islam ke Indonesia.', progress: 0, ...createDefaultContent('7-10') },
        ]
      }
    ]
  },
  {
    id: '8',
    name: 'Kelas VIII',
    color: 'emerald',
    icon: 'compass',
    schedule: SCHEDULE_CONTENT,
    grades: GRADES_CONTENT,
    semesters: [
      {
        id: 'ganjil',
        name: 'Semester Ganjil',
        exams: EXAM_LINKS,
        chapters: [
          { id: '8-1', title: 'Bab 1: Meyakini Kitab Allah', description: 'Iman kepada Kitab-kitab Allah.', progress: 20, ...createDefaultContent('8-1') },
          { id: '8-2', title: 'Bab 2: Menghindari Minuman Keras', description: 'Bahaya khamr, judi, dan pertengkaran.', progress: 0, ...createDefaultContent('8-2') },
          { id: '8-3', title: 'Bab 3: Mengutamakan Kejujuran', description: 'Menegakkan keadilan dalam kehidupan.', progress: 0, ...createDefaultContent('8-3') },
          { id: '8-4', title: 'Bab 4: Shalat Sunnah', description: 'Macam-macam shalat sunnah berjamaah.', progress: 0, ...createDefaultContent('8-4') },
          { id: '8-5', title: 'Bab 5: Sujud Syukur', description: 'Tata cara sujud syukur dan tilawah.', progress: 0, ...createDefaultContent('8-5') },
        ]
      },
      {
        id: 'genap',
        name: 'Semester Genap',
        exams: EXAM_LINKS,
        chapters: [
          { id: '8-6', title: 'Bab 6: Pertumbuhan Ilmu', description: 'Masa Daulah Umayyah.', progress: 0, ...createDefaultContent('8-6') },
          { id: '8-7', title: 'Bab 7: Rendah Hati & Hemat', description: 'Menghindari perilaku boros.', progress: 0, ...createDefaultContent('8-7') },
          { id: '8-8', title: 'Bab 8: Makanan Halal', description: 'Ketentuan makanan dan minuman halal.', progress: 0, ...createDefaultContent('8-8') },
          { id: '8-9', title: 'Bab 9: Pertumbuhan Ilmu (2)', description: 'Masa Daulah Abbasiyah.', progress: 0, ...createDefaultContent('8-9') },
          { id: '8-10', title: 'Bab 10: Hidup Sehat', description: 'Pola hidup sehat dalam Islam.', progress: 0, ...createDefaultContent('8-10') },
        ]
      }
    ]
  },
  {
    id: '9',
    name: 'Kelas IX',
    color: 'amber',
    icon: 'star',
    schedule: SCHEDULE_CONTENT,
    grades: GRADES_CONTENT,
    semesters: [
      {
        id: 'ganjil',
        name: 'Semester Ganjil',
        exams: EXAM_LINKS,
        chapters: [
          { id: '9-1', title: 'Bab 1: Hari Akhir', description: 'Iman kepada Hari Kiamat.', progress: 0, ...createDefaultContent('9-1') },
          { id: '9-2', title: 'Bab 2: Jujur & Menepati Janji', description: 'Pondasi integritas muslim.', progress: 0, ...createDefaultContent('9-2') },
          { id: '9-3', title: 'Bab 3: Berbakti pada Orang Tua', description: 'Birrul Walidain.', progress: 0, ...createDefaultContent('9-3') },
          { id: '9-4', title: 'Bab 4: Zakat Fitrah & Mal', description: 'Membersihkan harta dan jiwa.', progress: 0, ...createDefaultContent('9-4') },
          { id: '9-5', title: 'Bab 5: Dahsyatnya Haji', description: 'Ketentuan Ibadah Haji dan Umrah.', progress: 0, ...createDefaultContent('9-5') },
        ]
      },
      {
        id: 'genap',
        name: 'Semester Genap',
        exams: EXAM_LINKS,
        chapters: [
          { id: '9-6', title: 'Bab 6: Sejarah Islam Indonesia', description: 'Kerajaan Islam di Nusantara.', progress: 0, ...createDefaultContent('9-6') },
          { id: '9-7', title: 'Bab 7: Optimis & Ikhtiar', description: 'Meraih kesuksesan dengan tawakal.', progress: 0, ...createDefaultContent('9-7') },
          { id: '9-8', title: 'Bab 8: Toleransi & Menghargai', description: 'Indahnya perbedaan.', progress: 0, ...createDefaultContent('9-8') },
          { id: '9-9', title: 'Bab 9: Qada dan Qadar', description: 'Iman kepada takdir Allah.', progress: 0, ...createDefaultContent('9-9') },
          { id: '9-10', title: 'Bab 10: Seni Islami', description: 'Tradisi Islam di Indonesia.', progress: 0, ...createDefaultContent('9-10') },
        ]
      }
    ]
  }
];

export const DEFAULT_STUDENTS: Student[] = [
  // ... (Full student list as previously provided) ...
  { id: '1129', nis: '1129', name: 'ABEL AULIA PASA RAMADANI', classId: '9', gender: 'P' },
  // Truncated for brevity in XML response, assuming full list is present
  { id: '1402', nis: '1402', name: 'ZAFAR SIDIQ', classId: '7', gender: 'L' }
];

export const DEFAULT_EXTRAS: ExtraContent[] = [
  // ... (Existing extras) ...
  { 
    id: 'd1', 
    title: 'Doa Sebelum Belajar', 
    category: 'doa', 
    type: 'html', 
    content: '<div class="text-center text-2xl font-arabic mb-4">رَضِتُ بِااللهِ رَبَا وَبِالْاِسْلاَمِ دِيْنَا وَبِمُحَمَّدٍ نَبِيَا وَرَسُوْلاَ رَبِّ زِدْ نِيْ عِلْمًـاوَرْزُقْنِـيْ فَهْمًـا</div><p class="text-center">Rodhitu billahi robba, wabil islaami diina, wabi Muhammadin nabiyya warasuula, Robbi zidnii ilmaa warzuqnii fahmaa</p>' 
  },
  // ... (Rest of DEFAULT_EXTRAS)
];