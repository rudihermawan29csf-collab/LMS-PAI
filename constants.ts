import { ClassData, SchoolProfile, Student, ExtraContent, Chapter, Semester } from './types';

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

// Data Kurikulum PAI Realistis
const PAI_CURRICULUM: any = {
  '7': {
    'ganjil': [
      "Al-Qur'an dan Hadis (Asmaul Husna)",
      "Hidup Tenang dengan Kejujuran, Amanah, dan Istiqamah",
      "Semua Bersih Hidup Jadi Nyaman (Thaharah)",
      "Indahnya Kebersamaan dengan Shalat Berjamaah",
      "Selamat Datang Nabi Kekasihku (Sejarah Nabi di Mekkah)"
    ],
    'genap': [
      "Penerapan Hukum Bacaan Alif Lam",
      "Ingin Meneladani Ketaatan Malaikat-Malaikat Allah",
      "Berempati itu Mudah, Menghormati itu Indah",
      "Memupuk Rasa Persatuan pada Hari yang Dinanti (Shalat Jumat)",
      "Islam Memberikan Kemudahan melalui Shalat Jamak dan Qashar"
    ]
  },
  '8': {
    'ganjil': [
      "Meghindari Minuman Keras, Judi, dan Pertengkaran",
      "Meneladani Kitab-Kitab Allah SWT",
      "Berjiwa Rendah Hati, Hemat, dan Sederhana",
      "Ibadah Shalat Sunnah Berjamaah dan Munfarid",
      "Jiwa Lebih Tenang dengan Banyak Sujud"
    ],
    'genap': [
      "Menghindari Perilaku Tercela (Miras, Judi, Pertengkaran)",
      "Mengenal Rasul-Rasul Allah",
      "Penerapan Ilmu Tajwid dalam Membaca Al-Qur'an",
      "Ketentuan Makanan dan Minuman yang Halal dan Haram",
      "Sejarah Pertumbuhan Ilmu Pengetahuan pada Masa Bani Umayyah"
    ]
  },
  '9': {
    'ganjil': [
      "Meyakini Hari Akhir, Mengakhiri Kebiasaan Buruk",
      "Menatap Masa Depan dengan Optimis, Ikhtiar, dan Tawakal",
      "Mengasah Pribadi Unggul dengan Jujur, Santun, dan Malu",
      "Zakat Fitrah dan Zakat Mal",
      "Dahsyatnya Persatuan dalam Ibadah Haji dan Umrah"
    ],
    'genap': [
      "Iman kepada Qada dan Qadar",
      "Penyembelihan Hewan dalam Islam",
      "Ibadah Qurban dan Aqiqah",
      "Sejarah Perkembangan Islam di Nusantara",
      "Adab dan Tradisi Islam di Nusantara"
    ]
  }
};

// Helper to create simple default content
const createDefaultContent = (idPrefix: string) => ({
  contents: [
    {
      id: `${idPrefix}-c1`,
      title: 'Pendahuluan',
      type: 'html' as const,
      content: `
        <p>Assalamualaikum Warahmatullahi Wabarakatuh. Materi ini sedang disiapkan oleh Bapak/Ibu Guru.</p>
        <p>Silakan cek kembali secara berkala untuk mendapatkan update materi terbaru di bab ini.</p>
      `
    }
  ],
  videos: [],
  quizzes: []
});

const createChapters = (grade: string, sem: string): Chapter[] => {
  const titles = PAI_CURRICULUM[grade][sem] || [];
  return titles.map((title: string, i: number) => ({
    id: `${grade}-${sem}-${i + 1}`,
    title: `Bab ${i + 1}: ${title}`,
    description: `Pembahasan materi PAI Kelas ${grade} tentang ${title}.`,
    progress: 0,
    ...createDefaultContent(`${grade}-${sem}-${i + 1}`)
  }));
};

const createSemester = (grade: string, id: 'ganjil' | 'genap', name: string): Semester => ({
  id,
  name,
  chapters: createChapters(grade, id),
  exams: [] // Bank Soal starts empty
});

const createClass = (id: string, name: string, gradeLevel: '7' | '8' | '9', color: string): ClassData => ({
  id,
  name,
  gradeLevel,
  color,
  icon: gradeLevel === '7' ? 'book-open' : gradeLevel === '8' ? 'compass' : 'star',
  schedule: {
    id: `sch-${id}`,
    title: `Jadwal Pelajaran ${name}`,
    type: 'html',
    content: '<p class="text-gray-500 italic">Jadwal belum diatur.</p>'
  },
  grades: {
    id: `grd-${id}`,
    title: `Rekap Nilai ${name}`,
    type: 'html',
    content: '<p class="text-gray-500 italic">Data nilai belum tersedia.</p>'
  },
  semesters: [
    createSemester(gradeLevel, 'ganjil', 'Semester Ganjil'),
    createSemester(gradeLevel, 'genap', 'Semester Genap')
  ]
});

// Generate Classes VII A - IX C
export const CLASSES_DATA: ClassData[] = [
  createClass('7A', 'Kelas VII A', '7', 'blue'),
  createClass('7B', 'Kelas VII B', '7', 'blue'),
  createClass('7C', 'Kelas VII C', '7', 'blue'),
  createClass('8A', 'Kelas VIII A', '8', 'emerald'),
  createClass('8B', 'Kelas VIII B', '8', 'emerald'),
  createClass('8C', 'Kelas VIII C', '8', 'emerald'),
  createClass('9A', 'Kelas IX A', '9', 'amber'),
  createClass('9B', 'Kelas IX B', '9', 'amber'),
  createClass('9C', 'Kelas IX C', '9', 'amber'),
];

// Raw Data processing
const RAW_STUDENTS = `1129	ABEL AULIA PASA RAMADANI	IX A	P
1132	ADITYA FIRMANSYAH	IX A	L
1135	AHMAD NIAM IZZI AFKAR	IX A	L
1150	DAFA RISKI EKA SYAHPUTRA	IX A	L
1151	DEA NAYLATUL AFITA	IX A	P
1153	DHEA ZASKIA OLIVIA PUTRI	IX A	P
1155	ENGGELITA REGINA PUTRI	IX A	P
1158	FAREL ANDRIANSAH	IX A	L
1159	FURI ANGELIKA PUTRI	IX A	P
1163	JESICHA PUTRI RAMADHANI	IX A	P
1164	JIHAN DEA VALQOHI	IX A	P
1169	M. FERDY SANTOSO	IX A	L
1171	MICHELIA ANDARA PUTRI AGUSTINA	IX A	P
1175	MUHAMAD ADITIYA SUGIHARTO	IX A	L
1176	MUHAMAD RIFKI AFANDI	IX A	L
1178	MUHAMMAD AL AMIN	IX A	L
1181	MUHAMMAD BAHRUDIN NICOLAS SAPUTRA	IX A	L
1183	MUHAMMAD HAIKAL DWI APRIANSYAH	IX A	L
1184	MUHAMMAD REHAN MEYLANO	IX A	L
1186	MUHAMMAD RIZQI FATKUR ROZI	IX A	L
1190	NABILA SRI WULANDARI	IX A	P
1197	RIFKI ARDIAN SYAPUTRA	IX A	L
1202	SALSABILLA PUTRI RAMADHANI	IX A	P
1203	SASKIA AISYAH AZZAHRA	IX A	P
1204	SHERLIN HERLA AZZAHRA	IX A	P
1206	SLAMET RIZKI GALI RIMBA ANGKASA	IX A	L
1208	VALENSYA DWI PUTRI WIJAYA	IX A	P
1211	WILDAN DIMAS DWI ANANDA	IX A	L
1217	DEFANO HAIKAL RAMADHAN	IX A	L
1330	SAMSUL NURUL HUDA	IX A	L
1130	ABHEL ECHA TRIOCTAVIA NATASYA	IX B	P
1133	ADITYA SAPUTRA	IX B	L
1136	AKBAR KHAFI AS SHAFFAAT	IX B	L
1139	Alviansyah Radityah Putra	IX B	L
1142	ANINDITA WIDIYA CAHYANI	IX B	P
1146	Bayu Widiat Moko	IX B	L
1148	CANTICA ENGEL AULIA SHAVIRA	IX B	P
1157	FANIA KHOIROTUL UMMAH	IX B	P
1161	HANUM PUSPITA SARI	IX B	P
1166	KEYVIN RAJA DIRHAM	IX B	L
1167	Kinansye Novita Kreyti	IX B	P
1170	M. REVA INDRA RAMADHANI	IX B	L
1173	MOHAMMAD SURYA PUTRA JUANDA	IX B	L
1179	MUHAMMAD AZZAM AUFA RIZKY	IX B	L
1182	MUHAMMAD EDO PRATAMA	IX B	L
1185	MUHAMMAD RIZKI FEBRIAN PRATAMA	IX B	L
1191	NIHAYATUL HIMMAH	IX B	P
1215	Ninis Daniyah Permatasari	IX B	P
1193	PUTUT EKA DWI PRADANA	IX B	L
1195	RENO ARDIKA FEBRIANSYAH	IX B	L
1196	REZKY REVAN'A ADITYA	IX B	L
1199	ROHMATUN NADIYAH	IX B	P
1205	Siwetul Jennah	IX B	P
1207	TONI ADI SETIAWAN	IX B	L
1209	VEHANA RECHA INEZHA	IX B	P
1210	VISCHA AZZAHRA PUTRI	IX B	P
1212	WINDA SRI ASTUTIK	IX B	P
1213	YUSRIL ALFAREL NUGRAHA	IX B	L
1214	ZIDAN RAHMAT ADITYA	IX B	L
1328	YUSUF ADITYA ALIN PRATAMA	IX B	L
1131	ADINDA DWI PRASETYAWAN	IX C	L
1134	AHKMAD IRCHAM ALI AZKIYA JAZULY	IX C	L
1137	AKHMAD EGA JULIANO	IX C	L
1140	AMIRULLOH AKBAR	IX C	L
1141	ANDIEN DINAR FADHILLAH QAIS	IX C	p
1143	AULIA PUTRY RAUDIATUL JANNAH	IX C	P
1144	AURELIA FATIMAH YUNITA	IX C	P
1145	AYU DEVINA EKA PRATIWI	IX C	P
1147	BINTANG PRATAMA	IX C	L
1149	CITRA TRIAN ANDINI	IX C	P
1152	DENIS EKA FEBRIAN	IX C	L
1154	ELISA DINDA SAVIERA	IX C	P
1156	FAJAR ADITYA PUTRA	IX C	L
1160	GRISELDA SANDRA ADELIA	IX C	P
1162	JASTINE DIAN DWI ALEXTIAN	IX C	L
1165	KAFRIDA INDAH DWI PRAMESTI	IX C	P
1168	KRISNA WAHYU ARIYANSYAH	IX C	L
1172	MIFTAKHUL DWIYANTI	IX C	P
1174	MOHKAMAT SLAMET PRASETIO	IX C	L
1177	MUHAMAD THORIQ SHOLIKHUL ULAH	IX C	L
1180	MUHAMMAD BAGUS DWI SETIAWAN	IX C	L
1187	MUHAMMAD SYAHLAN AL FARISI	IX C	L
1188	MUHAMMAD SYAIFUDDIN ZUHRI	IX C	L
1189	MUKHAMMAD NAFIS  ZANWAR	IX C	L
1192	PUTRA FAIZ ABILANSA	IX C	L
1194	RAKA ZA ARKAN AL YAHYA	IX C	L
1198	RIZKY DWI PRASETYA	IX C	L
1200	SAHAZIKA GISTIANO MAISEGALUNG	IX C	P
1201	SALSABILA AMELIA PUTRI	IX C	P
1326	ACHMAD SAIFUL ANWAR	IX C	L
1219	ACHMAD KIESHA RIZQI ANDIKA	VIII A	L
1224	ALANSKY VANI ARIEFKY PUTRA	VIII A	L
1227	ALMIRAH YUNITA	VIII A	P
1229	ANA NAYLA SALSABILLA	VIII A	P
1231	ARIYA FERDIANSA	VIII A	L
1232	ASIFA AMELIA PUTRI	VIII A	P
1233	ASMIAR AFIQOH RACHMADHANI	VIII A	P
1234	AURA MIFVATUL PUTRI	VIII A	P
1235	AVELIYAN AGHIL EDDYANZA	VIII A	L
1251	IMELDA NAJWA AYU KUMALASARI	VIII A	P
1252	INDRA BAGUS SAPUTRA	VIII A	L
1255	JESICA APRILIA AYUNENGTIAS	VIII A	P
1267	MOCH DEVAN SAPUTRA	VIII A	L
1270	MOHAMMAD DAFFA	VIII A	L
1273	MUH. REVAN RIZKI PRATAMA	VIII A	L
1275	MUHAMMAD BAYU SAPUTRO	VIII A	L
1280	MUHAMMAD NASRUL MUJAQQI	VIII A	L
1287	MUKHAMAD ILYAS RIZKY ABDILLAH	VIII A	L
1292	NADZAR PANDU PRAHASTA	VIII A	L
1295	NAURA CECILYA ANGELYCA	VIII A	P
1296	NAURAH SALSABILA	VIII A	L
1298	NAZWA NATASYA PUTRI	VIII A	P
1302	PUPUT KUMALA SARI	VIII A	P
1304	PUTRI EKA NILASARI	VIII A	P
1305	PUTRI JUWITA SARI	VIII A	P
1306	RAFIQ MAULANA	VIII A	L
1308	REVAND DWI AL DIANO	VIII A	L
1309	RIYADHUL BUKHORI	VIII A	L
1259	KYANO RICKY SAPUTRA	VIII A	L
1313	SERLIYAH CAHYA FITRIANI	VIII A	P
1314	SESILLIA ANGELINA PUTRI	VIII A	P
1316	SHEGA RAMADHANI	VIII A	L
1321	VALENCIA SELLA FENDY SAFIRA	VIII A	P
1322	WAHYU NUR AHMAD SETIO BUDI	VIII A	L
1325	YUSRIEL ADI ALFAREZA	VIII A	L
1218	ACHMAD DAFFA KURNIAWAN	VIII B	L
1220	AHMAD RAVA MAULANA	VIII B	L
1221	AHMAD YONGKY ROFIKUL A'LA	VIII B	L
1223	AKHMAD RIFKI SAMSUL ANGGORO	VIII B	L
1225	ALDELIA PUTRI ANNUROH	VIII B	P
1226	ALIVIA AZZAHRA	VIII B	P
1228	AMELIA DWI AMANDA SARI	VIII B	P
1240	BISMA PUTRA RAMADHAN	VIII B	L
1242	CINTIA ZIFA PERMATA KIRANA	VIII B	P
1244	DESYIFA ADELIA EKA FIRNANDA	VIII B	P
1245	DEWI AVIKA PUTRI	VIII B	P
1248	DWI KANAYA PUTRI	VIII B	P
1249	FADILLAH AINI KHOMARI	VIII B	P
1253	IVANDER ZAKI ANGGARA	VIII B	L
1256	JULIANA PUTRI	VIII B	P
1257	KELFIN ANDIKA PRATAMA	VIII B	L
1260	KYANOE LUCKY WIJJAYA	VIII B	L
1261	LOEIS ADITYA PUTRA	VIII B	L
1268	MOCHAMAD VICKY WAHYUPI	VIII B	L
1269	MOCHAMMAD FARREL YUSNI TAUFIQURROHMAN	VIII B	L
1274	MUHAMAD AYUBI ANAS	VIII B	L
1277	MUHAMMAD ILHAM SYAFI'I	VIII B	L
1283	MUHAMMAD RENDI ADITYA	VIII B	L
1284	MUHAMMAD REZZA SETYAWAN	VIII B	L
1286	MUHAMMAD YAFIUL HAMZI	VIII B	L
1289	MUKHAMMAD ARYA MAULANA	VIII B	L
1294	NARITA SILVIA DEWI	VIII B	P
1297	NAYLA HIDAYATUN NUFUS	VIII B	P
1301	OKTAVIAN ERGIANSYAH	VIII B	L
1311	RIZKI VERANIKA ANDINA SOLIKHAH	VIII B	P
1312	ROSYIDAH WULANDARI	VIII B	P
1320	TUNGGUL DIAS ARIANSYAH	VIII B	L
1323	WILDA PRATIWI	VIII B	P
1324	WILDHA CHELSEA META OCTAVIA	VIII B	P
1329	ASTI DWI NATHANIA PUTRI	VIII B	P
1222	AHMAD ZAIYANI WARDANI	VIII C	L
1230	ARIEL SENNA DWI FIRMANSYAH	VIII C	L
1236	AVRILIA EKA RAHMAWATI	VIII C	P
1237	AYU ANDIRA	VIII C	P
1238	AZAM IBI SYEVIK	VIII C	L
1239	AZKA ATALARIC ZACHARI KHALFANI	VIII C	L
1241	CINTA RAHMA ASIYA	VIII C	P
1243	DAUD ATHOURROHMAN KAMAL	VIII C	L
1246	DINI OLIVIA PUTRI	VIII C	P
1247	DIO ARSYAH MAULANA	VIII C	L
1250	FERLIN ELSA HAVIVA	VIII C	P
1254	JANITA KAMILA ZAMAN	VIII C	P
1327	JESLYN SHAILA LEXIA AMORA	VIII C	P
1258	KYANNO RENDRA BUDI PRATAMA	VIII C	L
1262	LUTVI RASYA RAMADHAN	VIII C	L
1263	MAHFIDHO ZAKIYATUS SHAFA	VIII C	P
1264	MARCELLINO MAULANA MAZBULLAH	VIII C	L
1265	MARTHA DWI TARADILA	VIII C	P
1266	MIFTAKHUL JANAH	VIII C	P
1271	MOHAMMAD DAVID ALFIANSYAH	VIII C	L
1276	MUHAMMAD FAIS ILHAM	VIII C	L
1278	MUHAMMAD IQBAL ALIE MUZAKI	VIII C	L
1279	MUHAMMAD KHADID ANWARY	VIII C	L
1281	MUHAMMAD NASYA PRADIPTA OKTAFA	VIII C	L
1285	MUHAMMAD WAHYU RAMDHANI	VIII C	L
1288	MUKHAMAT FAHRUL	VIII C	L
1290	MUKHAMMAD RIZKY WANDIAN SYAH	VIII C	L
1291	NADYA LOVITA PUTRI	VIII C	P
1293	NAFISHATUL MUFIDAH	VIII C	P
1290	NERLITA ADELIA PUTRI	VIII C	P
1300	NOVALUNA ADINDA PUTRI	VIII C	P
1307	RENO AIDHIL ELMAWANTO	VIII C	L
1310	RIYO FAFA ALAMSYAH	VIII C	L
1317	SILVI ADELLYA ANDINI	VIII C	P
1319	TEGAR HENDY RISWANTO	VIII C	L
1332	ACSELIN UKE DWINANTA	VII A	P
1333	AHMAD DWI NAVI SAPUTRA	VII A	L
1336	AKIRA MUMTAZA GHULAM MAHRON	VII A	P
1338	ANGGITAH MAHARANI	VII A	P
1341	ARIMBI AUNI MAYANGSARI	VII A	P
1342	ARSY TIRTASYA PRAYOGI ISBIANTO	VII A	P
1345	DEFIANA NUR RAHMA	VII A	P
1349	DINDA RESTYNING RAHAYU	VII A	P
1362	IRKHAM ARTHUR MAULANA	VII A	L
1364	KADITA NATHANIA	VII A	P
1372	MOHAMMAD ROFIQ ARDIANSYAH	VII A	L
1377	MUHAMMAD AZZAM NUR ALIF	VII A	L
1376	MUHAMMAD ARDITIYO SEBASTIAN	VII A	L
1379	MUHAMMAD EZZAR ALI YUDHA	VII A	L
1380	MUHAMMAD FAIZ QISBIY ROMADHONI	VII A	L
1388	OLIVIA ADELLA NAZAHRA	VII A	P
1389	QOTRUNNADA SALSABILA AKMAL	VII A	P
1390	RAMA SULTHAN AULIYA AHMAD	VII A	L
1391	REFAN AZZAM ANUGRAH	VII A	L
1394	SEPTIA INDAH WULANDARI	VII A	P
1395	SOEGIARTO WIJAYA	VII A	L
1396	STEFANI ANANDA RAHMADHANI	VII A	P
1398	VIRDY PUTRI HARUM KUSUMA	VII A	P
1403	ZAINI ALI MAHMUD	VII A	L
1404	ZAVERIO AMSYAR RAFFASYA	VII A	L
1331	ACHMAD FATAH ADI DARMA	VII B	L
1340	ARGA ARDIANSA	VII B	L
1343	AVYKA VERA JUNYARTHA	VII B	P
1346	DENIS ANGGORO	VII B	L
1350	DIRLY MICHELE FEBRYAN SUSANTO	VII B	L
1351	DWI ANDIKA PUTRA SETIAWAN	VII B	L
1357	FEMILYA QONITA ARINIL HAQ	VII B	P
1360	HIKMATUL MEISYAH ANJANI	VII B	P
1361	IQBAL MAULANA AL AZZAM	VII B	L
1365	KASIH PUTRI SURYA NINGRUM	VII B	P
1366	KIKI FATMAWATI	VII B	P
1368	KRIDHO HERVA NATASYA PUTRI	VII B	P
1373	MOKHAMAD FARA BARIQ SAPUTRA	VII B	L
1374	MUCHAMMAD ILYAS NUR ADINATA	VII B	L
1381	MUHAMMAD FARHAN MAULANA	VII B	L
1383	MUHAMMAD KHOIRUL ANAM	VII B	L
1385	MUHAMMAD SONIUL ULUMI	VII B	L
1386	NIZHAR ADITYA ROHMAN	VII B	L
1387	NUR AINI AGUSTIN	VII B	P
1392	REVALINA DWI RATNASARI	VII B	P
1393	SAKA BUANA IKSAN WIJAYANTO	VII B	L
1397	SYAHRIL FIKRI AMRULLOH	VII B	L
1399	WAHYU ALIFIANSYAH PUTRA MANGKU B.	VII B	L
1400	WENIDA EKA ANADIA PUTRI	VII B	P
1405	DZAKIYYA TALITA ZAHRA	VII B	P
1406	RANIA SYAFA'A PUTRI IMANSYAH	VII B	P
1407	MOH. DAFFA FAUZAN WIFQULKHOIR	VII B	L
1334	AISYAH AYU LESTARI	VII C	P
1335	AISYAH ZANETA SALSABILLA	VII C	P
1337	ALFARO FEBRIANSYAH WAHYUDI	VII C	L
1339	APRILIA DWI LESTARI	VII C	P
1344	CHILYATUZ ZAKIA AINA SALSABILA	VII C	P
1347	DHAFA SATRIAWAN PRATAMA	VII C	L
1348	DINDA AKILA PRATIWI	VII C	P
1353	ELINA ASTRIT YUNEDY	VII C	P`;

// Parse the raw student data
export const DEFAULT_STUDENTS: Student[] = RAW_STUDENTS.trim().split('\n').map((line, index) => {
  const parts = line.split('\t');
  if (parts.length < 3) return null; // Accept minimal validity

  const nis = parts[0]?.trim();
  const name = parts[1]?.trim();
  const classRaw = parts[2]?.trim();
  const genderRaw = parts[3]?.trim();

  // Helper to normalize class names
  let classId = '7A'; // default
  if (classRaw) {
      const romanMap: {[key: string]: string} = { 'VII': '7', 'VIII': '8', 'IX': '9' };
      const [roman, suffix] = classRaw.split(' ');
      if (romanMap[roman]) {
          classId = `${romanMap[roman]}${suffix || ''}`;
      }
  }

  return {
    id: nis || `student-${index}`,
    nis: nis || '0000',
    name: name || 'Siswa',
    gender: (genderRaw === 'L' ? 'L' : 'P') as 'L'|'P',
    classId
  };
}).filter((s): s is Student => s !== null);

export const DEFAULT_EXTRAS: ExtraContent[] = [
  {
    id: 'doa-1',
    title: 'Doa Sebelum Belajar',
    category: 'doa',
    type: 'html',
    content: '<div class="text-center py-6"><p class="text-2xl font-bold mb-4 font-arabic leading-loose" dir="rtl">رَضِتُ بِااللهِ رَبَا وَبِالْاِسْلاَمِ دِيْنَا وَبِمُحَمَّدٍ نَبِيَا وَرَسُوْلاَ رَبِّ زِدْ نِيْ عِلْمًـاوَرْزُقْنِـيْ فَهْمًـا</p><p class="italic text-gray-600">"Kami ridho Allah SWT sebagai Tuhanku, Islam sebagai agamaku, dan Nabi Muhammad sebagai Nabi dan Rasul, Ya Allah, tambahkanlah kepadaku ilmu dan berikanlah aku pengertian yang baik."</p></div>'
  },
  {
    id: 'sholat-1',
    title: 'Niat Sholat Dhuha',
    category: 'sholat',
    type: 'html',
    content: '<div class="text-center py-6"><p class="text-2xl font-bold mb-4 font-arabic leading-loose" dir="rtl">أُصَلِّيْ سُنَّةَ الضُّحَى رَكْعَتَيْنِ لِلَّهِ تَعَالَى</p><p class="italic text-gray-600">"Aku niat sholat sunnah dhuha dua rakaat karena Allah Ta\'ala."</p></div>'
  },
  {
    id: 'kisah-1',
    title: 'Kisah Teladan Nabi Muhammad SAW',
    category: 'cerita',
    type: 'link',
    url: 'https://www.youtube.com/watch?v=SomeVideoID'
  }
];