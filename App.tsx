import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  ChevronRight, 
  Play, 
  Layout, 
  Brain, 
  Moon, 
  Library, 
  Gamepad, 
  ArrowLeft,
  Settings,
  Save,
  LogOut,
  Edit3,
  ExternalLink,
  Youtube,
  Trash2,
  FileText,
  Link as LinkIcon,
  Code,
  Clock,
  MapPin,
  Calendar,
  Lock,
  Menu,
  X,
  School,
  CheckCircle,
  Users,
  Download,
  Upload,
  Plus,
  BookHeart,
  Sparkles,
  MoreHorizontal,
  ChevronDown,
  Sun,
  Hand,
  MessageCircle,
  Coffee,
  FileQuestion,
  CalendarRange,
  GraduationCap,
  Filter,
  Phone,
  UserCog,
  User,
  Quote
} from 'lucide-react';

// Import Firebase
import { db, doc, setDoc, getDoc, collection, getDocs, deleteDoc } from './firebase';
import { writeBatch } from 'firebase/firestore';

import { CLASSES_DATA, FEATURES, DEFAULT_SCHOOL_PROFILE, DEFAULT_STUDENTS, DEFAULT_EXTRAS } from './constants';
import { ViewState, ClassData, Chapter, SchoolProfile, Student, ExtraContent, ExtraCategory, ResourceItem, ContentSection, Semester } from './types';
import { Button, Card, SectionTitle, Input, TextArea } from './components/UIComponents';

// Declaration for XLSX (SheetJS) loaded via CDN in index.html
declare global {
  interface Window {
    XLSX: any;
  }
}

// --- Helper Functions ---

const getYoutubeId = (url?: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// --- Widgets ---

const PrayerTimesWidget: React.FC = () => {
  const [times, setTimes] = useState<any>(null);
  const [locationName, setLocationName] = useState('Mendeteksi Lokasi...');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [nextPrayer, setNextPrayer] = useState<string>('');

  const fallbackTimes = {
    Fajr: "04:15",
    Dhuhr: "11:40",
    Asr: "15:00",
    Maghrib: "17:50",
    Isha: "19:00"
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const date = new Date();
          const response = await fetch(`https://api.aladhan.com/v1/timings/${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}?latitude=${latitude}&longitude=${longitude}&method=20`); 
          const data = await response.json();
          if (data.code === 200) {
            setTimes(data.data.timings);
            setLocationName('Lokasi Anda');
          } else {
             setTimes(fallbackTimes);
             setLocationName('Waktu Jakarta (Offline)');
          }
        } catch (error) {
          setTimes(fallbackTimes);
          setLocationName("Waktu Jakarta (Offline)");
        }
      }, (error) => {
        setTimes(fallbackTimes);
        setLocationName("Waktu Jakarta (Default)");
      });
    } else {
      setTimes(fallbackTimes);
      setLocationName("Waktu Jakarta (Default)");
    }
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (times) {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const prayerList = [
        { name: 'Subuh', time: times.Fajr },
        { name: 'Dzuhur', time: times.Dhuhr },
        { name: 'Ashar', time: times.Asr },
        { name: 'Maghrib', time: times.Maghrib },
        { name: 'Isya', time: times.Isha },
      ];
      let targetPrayer = null;
      let targetTime = null;
      for (const p of prayerList) {
        const [h, m] = p.time.split(':').map(Number);
        const pMinutes = h * 60 + m;
        if (pMinutes > currentMinutes) {
          targetPrayer = p.name;
          targetTime = p.time;
          break;
        }
      }
      if (!targetPrayer) {
        targetPrayer = 'Subuh';
        targetTime = times.Fajr;
      }
      const [targetH, targetM] = targetTime.split(':').map(Number);
      const targetDate = new Date();
      targetDate.setHours(targetH, targetM, 0);
      if (targetDate < now) {
        targetDate.setDate(targetDate.getDate() + 1);
      }
      const diffMs = targetDate.getTime() - now.getTime();
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      setNextPrayer(`Menuju waktu ${targetPrayer} (${targetTime}) - ${diffHrs} jam ${diffMins} menit lagi`);
    }
  }, [times, currentTime]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date);
  };

  return (
    <div className="flex flex-col items-center justify-center mb-8 gap-4">
      <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl px-6 py-2 shadow-sm flex items-center gap-4 text-sm font-medium text-gray-600">
         <span className="flex items-center gap-1.5"><Calendar size={14} className="text-blue-500"/> {formatDate(currentTime)}</span>
         <span className="w-px h-4 bg-gray-300"></span>
         <span className="flex items-center gap-1.5"><Clock size={14} className="text-blue-500"/> {currentTime.toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}</span>
         <span className="w-px h-4 bg-gray-300"></span>
         <span className="flex items-center gap-1.5"><MapPin size={14} className="text-red-500"/> {locationName}</span>
      </div>
      {times && (
        <div className="flex flex-col items-center gap-3">
          <div className="grid grid-cols-5 gap-2 sm:gap-4">
            {[
              { name: 'Subuh', time: times.Fajr },
              { name: 'Dzuhur', time: times.Dhuhr },
              { name: 'Ashar', time: times.Asr },
              { name: 'Maghrib', time: times.Maghrib },
              { name: 'Isya', time: times.Isha },
            ].map((item) => (
              <div key={item.name} className="flex flex-col items-center bg-white/60 backdrop-blur-md rounded-xl p-2 sm:p-3 border border-white/50 shadow-sm min-w-[70px]">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{item.name}</span>
                <span className="text-sm sm:text-lg font-bold text-gray-800">{item.time}</span>
              </div>
            ))}
          </div>
          <div className="text-sm font-medium text-blue-600 bg-blue-50 px-4 py-1 rounded-full animate-pulse border border-blue-100">
             {nextPrayer}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Components ---

const RobotGreeting: React.FC<{ greetingText: string }> = ({ greetingText }) => (
  <div className="max-w-4xl mx-auto mb-10 flex flex-col md:flex-row items-center gap-6 animate-fade-in-up">
    <div className="relative group cursor-pointer">
       <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-8 bg-gray-900 rounded-t-lg z-20 shadow-md"></div>
       <div className="w-24 h-24 bg-gradient-to-b from-gray-50 to-white rounded-2xl border-2 border-gray-200 shadow-xl flex items-center justify-center relative z-10 animate-bounce-slow">
          <div className="flex gap-4">
             <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
             <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse delay-75"></div>
          </div>
          <div className="absolute bottom-6 w-8 h-1.5 bg-gray-300 rounded-full"></div>
       </div>
    </div>
    <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl rounded-tl-none border border-white/50 shadow-lg flex-1 transform transition-transform hover:scale-[1.01]">
       <p className="text-gray-700 font-medium leading-relaxed italic text-lg whitespace-pre-line">
         "{greetingText || 'Selamat datang di LMS PAI.'}"
       </p>
    </div>
  </div>
);

const TrafficLights = () => (
  <div className="flex items-center gap-1.5 absolute top-4 left-4">
    <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]"></div>
    <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]"></div>
    <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]"></div>
  </div>
);

const Navbar: React.FC<{ 
  goHome: () => void, 
  goAdmin?: () => void,
  schoolName: string
}> = ({ goHome, goAdmin, schoolName }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/70 backdrop-blur-xl border-b border-gray-200/50 py-3 shadow-sm' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer" onClick={goHome}>
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg transform hover:rotate-12 transition-transform duration-300 border border-white/20">
            <Moon size={20} fill="currentColor" />
          </div>
          <div><h1 className="font-bold text-gray-900 text-lg leading-tight tracking-tight">{schoolName}</h1></div>
        </div>
        <button className="md:hidden text-gray-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
           {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden bg-white/95 backdrop-blur-xl border-b border-gray-200 overflow-hidden">
             <div className="px-4 py-4 space-y-3 flex flex-col">
                <button onClick={goHome} className="block w-full text-left py-2 text-gray-600 text-sm font-medium">Beranda</button>
                {goAdmin && (
                   <button onClick={goAdmin} className="block w-full text-left py-2 text-gray-600 text-sm mt-2 border-t border-gray-100 pt-4 flex items-center gap-2"><Settings size={16} /> Login Guru</button>
                )}
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Footer: React.FC<{ onAdminClick: () => void, profile: SchoolProfile }> = ({ onAdminClick, profile }) => (
  <footer className="bg-white/30 backdrop-blur-xl border-t border-white/60 mt-20 pb-10 pt-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
           <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600"><Moon size={16} /></div>
            <span className="font-bold text-gray-800">{profile.name}</span>
           </div>
           <p className="text-sm text-gray-500 leading-relaxed mb-4">{profile.description}</p>
           <div className="text-sm text-gray-500">
              <p className="flex items-center gap-2 mb-1"><MapPin size={14}/> {profile.address}</p>
              <p className="flex items-center gap-2"><Settings size={14}/> {profile.email}</p>
           </div>
        </div>
        <div className="md:text-right">
          <h4 className="font-bold text-gray-900 mb-4">Kontak & Bantuan</h4>
          <div className="inline-block text-left md:text-right">
             <p className="text-sm font-semibold text-gray-800 mb-1">Guru Pengampu:</p>
             <p className="text-lg font-bold text-blue-600 mb-2">{profile.teacherName}</p>
             <p className="text-sm font-semibold text-gray-800 mb-1">Hubungi Via WhatsApp:</p>
             <a href={`https://wa.me/${profile.phoneNumber}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl transition-colors shadow-sm mt-1">
               <Phone size={16}/> Chat Guru ({profile.phoneNumber})
             </a>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-200/50 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400">
        <p>&copy; {new Date().getFullYear()} {profile.name}. All rights reserved.</p>
        <div className="flex items-center gap-4 mt-2 md:mt-0">
          <button onClick={onAdminClick} className="hover:text-blue-500 transition-colors">Admin Login</button>
          <p>Design by erha</p>
        </div>
      </div>
    </div>
  </footer>
);

// --- VIEWS ---

const LandingView: React.FC<{ 
  onSelectClass: (classId: string) => void;
  onAdminLogin: () => void;
  onSelectCategory: (category: ExtraCategory) => void;
  classes: ClassData[];
  extras: ExtraContent[];
  profile: SchoolProfile;
}> = ({ onSelectClass, onAdminLogin, onSelectCategory, classes, profile }) => {
  const [expandedGrade, setExpandedGrade] = useState<string | null>(null);
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Safety check for quotes array
  const activeQuotes = (profile && profile.quotes && profile.quotes.length > 0) 
    ? profile.quotes 
    : DEFAULT_SCHOOL_PROFILE.quotes;

  useEffect(() => {
    if (activeQuotes.length > 0) {
      const interval = setInterval(() => {
        setQuoteIndex((prev) => (prev + 1) % activeQuotes.length);
      }, 7000);
      return () => clearInterval(interval);
    }
  }, [activeQuotes]);

  const groupedClasses = classes.reduce((acc, curr) => {
    const grade = curr.gradeLevel;
    if (!acc[grade]) acc[grade] = [];
    acc[grade].push(curr);
    return acc;
  }, {} as Record<string, ClassData[]>);

  const toggleGrade = (grade: string) => setExpandedGrade(expandedGrade === grade ? null : grade);
  const scrollToIntro = () => document.getElementById('login-section')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-24 pb-12">
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
          <div className="absolute top-20 left-10 w-[500px] h-[500px] bg-blue-300/40 rounded-full mix-blend-multiply filter blur-[80px] animate-blob"></div>
          <div className="absolute top-20 right-10 w-[500px] h-[500px] bg-purple-300/40 rounded-full mix-blend-multiply filter blur-[80px] animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-[500px] h-[500px] bg-pink-200/40 rounded-full mix-blend-multiply filter blur-[80px] animate-blob animation-delay-4000"></div>
        </div>
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }}>
            <RobotGreeting greetingText={profile.greetingText}/><PrayerTimesWidget />
            <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter mb-8 leading-[1.1] text-gray-900 relative z-10 drop-shadow-sm">
              PAI Digital: <br className="hidden md:block" />
              <span className="relative inline-block mt-2 md:mt-0">
                <span className="absolute -inset-2 bg-blue-400/20 blur-2xl rounded-full"></span>
                <span className="text-shimmer relative z-10">Belajar Lebih Bermakna</span>
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
              Portal pembelajaran interaktif untuk siswa dan guru SMPN 3 Pacet. Silakan pilih jenis login di bawah ini.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
              <Button onClick={scrollToIntro} className="w-full sm:w-auto text-lg px-8 py-4 shadow-blue-500/25 shadow-2xl hover:scale-105 transform transition-all duration-300 rounded-2xl flex items-center gap-3"><User size={20}/> Login Siswa</Button>
              <Button onClick={onAdminLogin} variant="secondary" className="w-full sm:w-auto text-lg px-8 py-4 shadow-2xl hover:scale-105 transform transition-all duration-300 rounded-2xl flex items-center gap-3"><UserCog size={20}/> Login Guru</Button>
            </div>
          </motion.div>
          
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-24 relative p-8 md:p-10 bg-white/40 backdrop-blur-xl rounded-[2rem] border border-white/50 shadow-2xl inline-block w-full max-w-2xl mx-auto overflow-hidden">
            <TrafficLights />
            <div className="mt-4 min-h-[160px] flex flex-col justify-center">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur p-3 rounded-full border border-white shadow-sm"><Moon className="text-blue-500" size={24} fill="currentColor" /></div>
                
                <AnimatePresence mode="wait">
                  <motion.div
                    key={quoteIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.8 }}
                    className="space-y-6"
                  >
                    <Quote className="mx-auto text-blue-200" size={32} />
                    <p className="font-serif italic text-xl md:text-2xl text-gray-700 leading-relaxed">
                      "{activeQuotes[quoteIndex] || 'Bismillah.'}"
                    </p>
                  </motion.div>
                </AnimatePresence>

                <div className="w-16 h-1.5 bg-gradient-to-r from-blue-400 to-green-400 rounded-full mx-auto mb-3 mt-8"></div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Kalam Hikmah Hari Ini</p>
            </div>
          </motion.div>
        </div>
      </section>
      
      <section id="login-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle title="Login Siswa: Pilih Kelasmu" subtitle="Klik pada kelas yang sesuai untuk masuk ke halaman absensi dan materi." center />
        <div className="max-w-3xl mx-auto space-y-4">
          {['7', '8', '9'].map((grade) => (
            <div key={grade} className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
              <button onClick={() => toggleGrade(grade)} className="w-full flex items-center justify-between p-5 bg-white text-left transition-colors hover:bg-gray-50">
                <div className="flex items-center gap-4">
                   <div className={`p-2 rounded-xl ${grade === '7' ? 'bg-blue-100 text-blue-600' : grade === '8' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                     {grade === '7' && <BookOpen size={20}/>}
                     {grade === '8' && <Layout size={20}/>}
                     {grade === '9' && <Brain size={20}/>}
                   </div>
                   <span className="text-lg font-bold text-gray-800">Kelas {grade === '7' ? 'VII (Tujuh)' : grade === '8' ? 'VIII (Delapan)' : 'IX (Sembilan)'}</span>
                </div>
                <ChevronDown size={20} className={`text-gray-400 transition-transform duration-300 ${expandedGrade === grade ? 'rotate-180' : ''}`}/>
              </button>
              <AnimatePresence>
                {expandedGrade === grade && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-gray-50 border-t border-gray-100">
                     <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {groupedClasses[grade]?.map(cls => (
                           <button key={cls.id} onClick={() => onSelectClass(cls.id)} className={`py-3 px-4 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 transition-all shadow-sm hover:text-white ${grade === '7' ? 'hover:bg-blue-600 hover:border-blue-600' : grade === '8' ? 'hover:bg-emerald-600 hover:border-emerald-600' : 'hover:bg-amber-500 hover:border-amber-500'}`}>{cls.name.replace('Kelas ', '')}</button>
                        ))}
                     </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <SectionTitle title="Pojok Literasi & Ibadah" subtitle="Perkaya hati dan pikiran dengan doa dan kisah inspiratif." center />
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { id: 'doa', label: 'Kumpulan Do\'a', icon: <BookHeart className="text-green-600"/>, color: 'green' },
              { id: 'cerita', label: 'Kisah Islami', icon: <Sparkles className="text-purple-600"/>, color: 'purple' },
              { id: 'sholat', label: 'Materi Sholat', icon: <Sun className="text-orange-600"/>, color: 'orange' },
              { id: 'fiqih', label: 'Fiqih Dasar', icon: <Hand className="text-blue-600"/>, color: 'blue' },
              { id: 'hadist', label: 'Hadist Pilihan', icon: <MessageCircle className="text-teal-600"/>, color: 'teal' },
              { id: 'ramadhan', label: 'Special Ramadhan', icon: <Coffee className="text-amber-600"/>, color: 'amber' },
              { id: 'lainnya', label: 'Lain-Lain', icon: <MoreHorizontal className="text-gray-600"/>, color: 'gray' },
            ].map((cat) => (
              <Card key={cat.id} onClick={() => onSelectCategory(cat.id as ExtraCategory)} className={`bg-gradient-to-br from-${cat.color}-50 to-white border-${cat.color}-100 cursor-pointer hover:shadow-lg transition-all group`}>
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className={`w-10 h-10 rounded-xl bg-${cat.color}-100 flex items-center justify-center`}>{cat.icon}</div>
                       <h3 className={`text-lg font-bold text-${cat.color}-800`}>{cat.label}</h3>
                    </div>
                    <div className={`w-8 h-8 rounded-full bg-white border border-${cat.color}-100 flex items-center justify-center group-hover:bg-${cat.color}-500 group-hover:text-white transition-all`}><ChevronRight size={16}/></div>
                 </div>
              </Card>
            ))}
         </div>
      </section>
    </motion.div>
  );
};

const StudentLoginView: React.FC<{
  initialClassId?: string | null;
  classes: ClassData[];
  students: Student[];
  onLoginSuccess: (student: Student, classId: string) => void;
  onBack: () => void;
}> = ({ initialClassId, classes, students, onLoginSuccess, onBack }) => {
  const [selectedClassId, setSelectedClassId] = useState<string | null>(initialClassId || null);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  useEffect(() => { if (initialClassId) setSelectedClassId(initialClassId); }, [initialClassId]);
  const classStudents = selectedClassId ? students.filter(s => s.classId === selectedClassId) : [];
  const selectedClassName = classes.find(c => c.id === selectedClassId)?.name || 'Kelas';
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-4xl mx-auto px-4 py-12">
      <Button variant="secondary" onClick={onBack} className="mb-8"><ArrowLeft size={18}/> Kembali ke Menu Utama</Button>
      <Card className="p-8 md:p-12">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4"><Users size={32} /></div>
          <h2 className="text-3xl font-bold text-gray-900">Login {selectedClassName}</h2>
          <p className="text-gray-500 mt-2">Silakan pilih namamu dari daftar di bawah ini.</p>
        </div>
        <AnimatePresence>
            {selectedClassId ? (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="border-t pt-8">
                    <div className="w-full max-w-md mx-auto space-y-6">
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                            <select className="w-full pl-12 pr-10 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-medium focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer text-lg" value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)}>
                                <option value="">Pilih Nama Siswa...</option>
                                {classStudents.map(s => <option key={s.id} value={s.id}>{s.name} ({s.nis})</option>)}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20}/>
                        </div>
                        <Button className="w-full py-4 text-lg shadow-blue-500/20" disabled={!selectedStudentId} onClick={() => {
                            const s = classStudents.find(st => st.id === selectedStudentId);
                            if(s) onLoginSuccess(s, selectedClassId);
                        }}>Masuk Kelas <ChevronRight size={20}/></Button>
                    </div>
                </motion.div>
            ) : <div className="text-center text-red-500">Error: Kelas belum dipilih.</div>}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};

const ClassDetailView: React.FC<{
  classData: ClassData;
  student: Student | null;
  onBack: () => void;
  onSelectChapter: (id: string) => void;
}> = ({ classData, student, onBack, onSelectChapter }) => {
  const [activeSem, setActiveSem] = useState<'ganjil' | 'genap'>('ganjil');
  const currentSemester = classData.semesters.find(s => s.id === activeSem);
  const gradeResource = currentSemester?.grades;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
         <div>
            <Button variant="secondary" onClick={onBack} className="mb-4 text-sm py-2 px-4"><ArrowLeft size={16}/> Ganti Akun / Kelas</Button>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3"><span className={`w-3 h-8 bg-${classData.color}-500 rounded-full`}></span>Materi {classData.name}</h1>
            <p className="text-gray-500 mt-1 ml-6">Selamat datang, <span className="font-bold text-gray-800">{student?.name}</span>!</p>
         </div>
      </div>
      <div className="flex gap-2 mb-8 bg-gray-100 p-1 rounded-xl w-fit">
         {['ganjil', 'genap'].map((sem) => (
            <button key={sem} onClick={() => setActiveSem(sem as any)} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeSem === sem ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Semester {sem === 'ganjil' ? 'Ganjil' : 'Genap'}</button>
         ))}
      </div>
      {classData.schedule && (
         <Card className="mb-8 border-l-4 border-l-blue-500 bg-blue-50/50">
            <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2"><CalendarRange size={18}/> Jadwal Pelajaran {classData.name}</h3>
            {classData.schedule.type === 'html' ? <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: classData.schedule.content || '' }} /> : <a href={classData.schedule.url} target="_blank" className="text-blue-600 hover:underline">Lihat Jadwal</a>}
         </Card>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
         {currentSemester?.chapters.map((chapter) => (
            <Card key={chapter.id} onClick={() => onSelectChapter(chapter.id)} className="h-full flex flex-col cursor-pointer group hover:border-blue-300">
               <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 bg-${classData.color}-50 text-${classData.color}-700 text-[10px] font-extrabold rounded-full uppercase tracking-widest`}>BAB {chapter.id.split('-')[2] || chapter.id.split('-').pop()}</span>
                  {chapter.progress === 100 && <CheckCircle size={20} className="text-green-500"/>}
               </div>
               <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">{chapter.title.includes(': ') ? chapter.title.split(': ').slice(1).join(': ') : chapter.title}</h3>
               <p className="text-gray-500 text-sm mb-6 flex-grow line-clamp-3">{chapter.description}</p>
               <div className="mt-auto">
                 <div className="w-full bg-gray-100 h-1.5 rounded-full mb-2 overflow-hidden"><div className="bg-green-500 h-full rounded-full" style={{ width: `${chapter.progress}%` }}></div></div>
                 <div className="flex justify-between text-xs text-gray-400 font-medium"><span>Progress</span><span>{chapter.progress}%</span></div>
               </div>
            </Card>
         ))}
      </div>
      {gradeResource && (
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100 mb-6">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-3 text-xl border-b border-green-200/50 pb-4">
               <div className="p-2 bg-green-100 rounded-lg text-green-600"><GraduationCap size={24}/></div>
               Rekapitulasi Nilai Semester {activeSem === 'ganjil' ? 'Ganjil' : 'Genap'}
            </h3>
            {gradeResource.type === 'html' ? <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: gradeResource.content || '' }} /> : <a href={gradeResource.url} target="_blank" className="text-green-600 hover:underline flex items-center gap-2"><ExternalLink size={16}/> Lihat Rekap Nilai</a>}
        </Card>
      )}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
        <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-3 text-xl border-b border-green-200/50 pb-4"><div className="p-2 bg-blue-100 rounded-lg text-blue-600"><FileQuestion size={24}/></div>Bank Soal (STS & SAS)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentSemester?.exams?.map((exam) => (
                <a key={exam.id} href={exam.url || '#'} target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 bg-white border border-blue-100/50 rounded-xl hover:shadow-md hover:border-blue-400 transition-all group">
                    <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors"><FileText size={20} /></div>
                    <div><h4 className="font-bold text-gray-900">{exam.title}</h4><p className="text-xs text-gray-500">Google Form / Quiz</p></div>
                    <ExternalLink size={16} className="ml-auto text-gray-400"/>
                </a>
            ))}
            {(!currentSemester?.exams || currentSemester.exams.length === 0) && <div className="col-span-full text-gray-400 italic text-sm text-center py-4">Belum ada soal evaluasi untuk semester ini.</div>}
        </div>
      </Card>
    </motion.div>
  );
};

const ChapterContentView: React.FC<{ chapter: Chapter; onBack: () => void }> = ({ chapter, onBack }) => {
  const [activeTab, setActiveTab] = useState<'materi' | 'video' | 'kuis'>('materi');
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-5xl mx-auto px-4 py-8">
      <Button variant="secondary" onClick={onBack} className="mb-6"><ArrowLeft size={16}/> Kembali ke Bab</Button>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/4">
           <Card className="p-4 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4">Daftar Isi</h3>
              <div className="space-y-2">
                 <button onClick={() => setActiveTab('materi')} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'materi' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-gray-50 text-gray-600'}`}><BookOpen size={18}/> Materi</button>
                 <button onClick={() => setActiveTab('video')} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'video' ? 'bg-red-50 text-red-700 font-bold' : 'hover:bg-gray-50 text-gray-600'}`}><Youtube size={18}/> Video</button>
                 <button onClick={() => setActiveTab('kuis')} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'kuis' ? 'bg-green-50 text-green-700 font-bold' : 'hover:bg-gray-50 text-gray-600'}`}><Gamepad size={18}/> Kuis</button>
              </div>
           </Card>
        </div>
        <div className="w-full md:w-3/4">
           <Card className="min-h-[500px] p-6 md:p-10">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 border-b pb-4">{chapter.title}</h1>
              {activeTab === 'materi' && (
                <div className="prose prose-lg max-w-none prose-blue">
                   {chapter.contents && chapter.contents.length > 0 ? chapter.contents.map(section => (
                     <div key={section.id} className="mb-8">
                        {section.title && <h3 className="text-xl font-bold mb-3 text-gray-800">{section.title}</h3>}
                        {section.type === 'link' ? <a href={section.url} target="_blank" className="text-blue-600 hover:underline flex items-center gap-2 font-medium"><LinkIcon size={18}/> Buka Materi: {section.title}</a> : <div dangerouslySetInnerHTML={{ __html: section.content }} />}
                     </div>
                   )) : <p className="text-gray-500 italic">Materi belum tersedia.</p>}
                </div>
              )}
              {activeTab === 'video' && (
                 <div className="space-y-8">
                    {chapter.videos && chapter.videos.length > 0 ? chapter.videos.map(video => (
                      <div key={video.id}>
                         <h3 className="font-bold text-lg mb-2">{video.title}</h3>
                         {video.type === 'link' && video.url ? (
                           <div className="aspect-w-16 aspect-h-9 rounded-xl overflow-hidden shadow-lg"><iframe src={`https://www.youtube.com/embed/${getYoutubeId(video.url)}`} title={video.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-[300px] md:h-[400px]"></iframe></div>
                         ) : <div dangerouslySetInnerHTML={{ __html: video.content || '' }} />}
                      </div>
                    )) : <p className="text-gray-500 italic">Video pembelajaran belum tersedia.</p>}
                 </div>
              )}
              {activeTab === 'kuis' && (
                 <div className="space-y-4">
                    {chapter.quizzes && chapter.quizzes.length > 0 ? chapter.quizzes.map(quiz => (
                       <div key={quiz.id} className="p-6 border border-gray-200 rounded-xl bg-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600"><FileQuestion size={24}/></div>
                             <div><h4 className="font-bold text-gray-900">{quiz.title}</h4><p className="text-sm text-gray-500">Kerjakan dengan jujur.</p></div>
                          </div>
                          {quiz.type === 'link' ? <a href={quiz.url} target="_blank" rel="noreferrer" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors">Mulai Kuis</a> : <div dangerouslySetInnerHTML={{ __html: quiz.content || '' }} />}
                       </div>
                    )) : <p className="text-gray-500 italic">Kuis belum tersedia.</p>}
                 </div>
              )}
           </Card>
        </div>
      </div>
    </motion.div>
  );
};

// --- Admin Components ---

const AdminLoginView: React.FC<{ onLogin: () => void; onBack: () => void }> = ({ onLogin, onBack }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      onLogin();
    } else {
      setError('Password salah! Silakan hubungi admin sekolah.');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="max-w-md mx-auto px-4 py-20">
      <Card className="p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-4">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Login Guru PAI</h2>
          <p className="text-gray-500 text-sm mt-1">Akses dashboard manajemen materi & data siswa.</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Kata Sandi</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="Masukkan password admin" 
              />
            </div>
          </div>
          {error && <p className="text-red-500 text-xs text-center">{error}</p>}
          <Button type="submit" className="w-full py-4 shadow-lg shadow-blue-500/25">Masuk Dashboard</Button>
          <button type="button" onClick={onBack} className="w-full text-center text-gray-400 text-sm hover:text-gray-600 transition-colors pt-2">Batal dan Kembali</button>
        </form>
      </Card>
    </motion.div>
  );
};

const AdminContentEditor: React.FC<{ chapter: Chapter; onSave: (updatedChapter: Chapter) => void }> = ({ chapter, onSave }) => {
  const [formData, setFormData] = useState<Chapter>(chapter);
  useEffect(() => { setFormData(chapter); }, [chapter]);
  const handleSave = () => { onSave(formData); alert('Perubahan materi bab berhasil disimpan!'); };
  const addContent = () => {
    const newSection: ContentSection = { id: `section-${Date.now()}`, title: 'Sub Bab Baru', type: 'html', content: '' };
    setFormData({ ...formData, contents: [...formData.contents, newSection] });
  };
  const updateContent = (id: string, updates: Partial<ContentSection>) => {
    setFormData({ ...formData, contents: formData.contents.map(c => c.id === id ? { ...c, ...updates } : c) });
  };
  const deleteContent = (id: string) => {
    setFormData({ ...formData, contents: formData.contents.filter(c => c.id !== id) });
  };
  const addVideo = () => {
    const newItem: ResourceItem = { id: `video-${Date.now()}`, title: 'Video Baru', type: 'link', url: '' };
    setFormData({ ...formData, videos: [...formData.videos, newItem] });
  };
  const updateVideo = (id: string, updates: Partial<ResourceItem>) => {
    setFormData({ ...formData, videos: formData.videos.map(v => v.id === id ? { ...v, ...updates } : v) });
  };
  const deleteVideo = (id: string) => {
    setFormData({ ...formData, videos: formData.videos.filter(v => v.id !== id) });
  };
  const addQuiz = () => {
    const newItem: ResourceItem = { id: `quiz-${Date.now()}`, title: 'Kuis Baru', type: 'link', url: '' };
    setFormData({ ...formData, quizzes: [...formData.quizzes, newItem] });
  };
  const updateQuiz = (id: string, updates: Partial<ResourceItem>) => {
    setFormData({ ...formData, quizzes: formData.quizzes.map(q => q.id === id ? { ...q, ...updates } : q) });
  };
  const deleteQuiz = (id: string) => {
    setFormData({ ...formData, quizzes: formData.quizzes.filter(q => q.id !== id) });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4 border-b pb-4">
        <h2 className="text-xl font-bold">Edit Materi: {formData.title}</h2>
        <Button onClick={handleSave} className="py-2 px-4 text-sm"><Save size={16}/> Simpan Semua</Button>
      </div>
      <div className="space-y-4">
        <Input label="Judul Bab" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
        <TextArea label="Deskripsi Singkat" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-center border-t pt-4">
          <h3 className="font-bold flex items-center gap-2"><BookOpen size={18} /> Bagian Materi (HTML/Tautan)</h3>
          <button onClick={addContent} className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200">+ Tambah</button>
        </div>
        {formData.contents.map(section => (
          <div key={section.id} className="p-4 border rounded-xl bg-gray-50 relative group">
            <button onClick={() => deleteContent(section.id)} className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
              <Input label="Judul Materi" value={section.title} onChange={e => updateContent(section.id, { title: e.target.value })} className="mb-0"/>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipe</label>
                <select className="w-full p-3 rounded-xl border border-gray-300 bg-white" value={section.type || 'html'} onChange={e => updateContent(section.id, { type: e.target.value as any })}>
                  <option value="html">HTML Source</option>
                  <option value="link">Tautan Luar</option>
                </select>
              </div>
            </div>
            {section.type === 'link' ? 
              <Input placeholder="URL Tautan" value={section.url || ''} onChange={e => updateContent(section.id, { url: e.target.value })} /> : 
              <TextArea placeholder="Source Code HTML" value={section.content || ''} onChange={e => updateContent(section.id, { content: e.target.value })} className="font-mono text-sm" />
            }
          </div>
        ))}
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-center border-t pt-4">
          <h3 className="font-bold flex items-center gap-2"><Youtube size={18} /> Video Pembelajaran</h3>
          <button onClick={addVideo} className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200">+ Tambah</button>
        </div>
        {formData.videos.map(v => (
          <div key={v.id} className="p-4 border rounded-xl bg-gray-50 relative group">
            <button onClick={() => deleteVideo(v.id)} className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>
            <Input label="Judul Video" value={v.title} onChange={e => updateVideo(v.id, { title: e.target.value })} />
            <Input label="URL YouTube" value={v.url || ''} onChange={e => updateVideo(v.id, { url: e.target.value })} />
          </div>
        ))}
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-center border-t pt-4">
          <h3 className="font-bold flex items-center gap-2"><Gamepad size={18} /> Kuis Interaktif</h3>
          <button onClick={addQuiz} className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded hover:bg-green-200">+ Tambah</button>
        </div>
        {formData.quizzes.map(q => (
          <div key={q.id} className="p-4 border rounded-xl bg-gray-50 relative group">
            <button onClick={() => deleteQuiz(q.id)} className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>
            <Input label="Judul Kuis" value={q.title} onChange={e => updateQuiz(q.id, { title: e.target.value })} />
            <Input label="URL Kuis (GForm/Quizizz)" value={q.url || ''} onChange={e => updateQuiz(q.id, { url: e.target.value })} />
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminDashboardView: React.FC<{
  classes: ClassData[];
  schoolProfile: SchoolProfile;
  students: Student[];
  extras: ExtraContent[];
  onUpdateChapterByGrade: (gradeLevel: string, semesterId: string, chapterId: string, data: Partial<Chapter>) => void;
  onUpdateClassResourceByGrade: (gradeLevel: string, resourceType: 'exam' | 'grades' | 'schedule', item: ResourceItem, semesterId?: string) => void;
  onUpdateClass: (updatedClass: ClassData) => void;
  onUpdateProfile: (profile: SchoolProfile) => void;
  onSaveStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onSaveExtra: (extra: ExtraContent) => void;
  onDeleteExtra: (id: string) => void;
  onLogout: () => void;
}> = ({ classes, schoolProfile, students, extras, onUpdateChapterByGrade, onUpdateClassResourceByGrade, onUpdateClass, onUpdateProfile, onSaveStudent, onDeleteStudent, onSaveExtra, onDeleteExtra, onLogout }) => {
  const [tab, setTab] = useState<'profile' | 'content' | 'students' | 'extras' | 'schedule' | 'personalization'>('profile');
  const [profileForm, setProfileForm] = useState(schoolProfile);
  const handleProfileSave = () => { onUpdateProfile(profileForm); alert('Konfigurasi diperbarui!'); };
  
  const [studentForm, setStudentForm] = useState<Partial<Student>>({ classId: '7A', gender: 'L' });
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [filterClass, setFilterClass] = useState<string>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleStudentSave = () => {
    if (!studentForm.name || !studentForm.nis) return alert("Nama dan NIS wajib diisi");
    const studentData: Student = { id: editingStudentId || Date.now().toString(), name: studentForm.name!, nis: studentForm.nis!, classId: studentForm.classId || '7A', gender: studentForm.gender || 'L' };
    onSaveStudent(studentData);
    setEditingStudentId(null);
    setStudentForm({ classId: '7A', gender: 'L', name: '', nis: '' });
  };
  
  const handleStudentEdit = (s: Student) => { setEditingStudentId(s.id); setStudentForm(s); };
  const handleStudentDelete = (id: string) => { if (confirm('Hapus siswa ini?')) onDeleteStudent(id); };
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
          const bstr = evt.target?.result;
          const wb = window.XLSX.read(bstr, { type: 'binary' });
          const data = window.XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
          const newStudents: Student[] = data.map((row: any) => {
               const nis = row['NIS'] || row['nis'] || Date.now().toString();
               const name = row['Nama Lengkap'] || row['Nama'] || 'Siswa Baru';
               const clsRaw = row['Kelas'] || 'VII A';
               let classId = '7A';
               const romanMap: {[key: string]: string} = { 'VII': '7', 'VIII': '8', 'IX': '9' };
               const [roman, suffix] = clsRaw.toString().split(' ');
               if (romanMap[roman]) classId = `${romanMap[roman]}${suffix || ''}`;
               return { id: nis.toString(), nis: nis.toString(), name, classId, gender: row['Gender'] === 'L' ? 'L' : 'P' };
          });
          if (confirm(`Ditemukan ${newStudents.length} data siswa dari Excel. Tambahkan ke database?`)) {
              newStudents.forEach(s => onSaveStudent(s));
              alert("Data sedang diimpor...");
          }
          if (fileInputRef.current) fileInputRef.current.value = '';
      };
      reader.readAsBinaryString(file);
  };
  
  const filteredStudents = students.filter(s => filterClass === 'all' || s.classId === filterClass);
  const [extraForm, setExtraForm] = useState<Partial<ExtraContent>>({ category: 'doa', type: 'link' });
  const [editingExtraId, setEditingExtraId] = useState<string | null>(null);
  
  const handleExtraSave = () => {
    if (!extraForm.title) return alert("Judul wajib diisi");
    const newExtra: ExtraContent = { id: editingExtraId || Date.now().toString(), title: extraForm.title!, category: extraForm.category || 'doa', type: extraForm.type || 'link', url: extraForm.url || '', content: extraForm.content || '' };
    onSaveExtra(newExtra);
    setEditingExtraId(null);
    setExtraForm({ category: 'doa', type: 'link', title: '', url: '', content: '' });
  };
  
  const handleExtraEdit = (item: ExtraContent) => { setEditingExtraId(item.id); setExtraForm(item); };
  const handleExtraDelete = (id: string) => { if (confirm('Hapus konten ini?')) onDeleteExtra(id); };

  const [selGrade, setSelGrade] = useState<string>('7');
  const [selClassId, setSelClassId] = useState<string>('7A');
  const [selSemId, setSelSemId] = useState<string>('ganjil');
  const [selChapId, setSelChapId] = useState<string>('7-ganjil-1');
  const [chapForm, setChapForm] = useState<Chapter | null>(null);
  const [resourceEdit, setResourceEdit] = useState<{ type: 'schedule' | 'grades' | 'exam', item: ResourceItem, parentId?: string, semesterId?: 'ganjil'|'genap' } | null>(null);

  useEffect(() => {
     const templateClass = classes.find(c => c.gradeLevel === selGrade);
     if (templateClass) {
         const firstChap = templateClass.semesters.find(s => s.id === selSemId)?.chapters[0];
         if (firstChap) setSelChapId(firstChap.id);
     }
  }, [selGrade, selSemId, classes]);

  useEffect(() => {
    const templateClass = classes.find(c => c.gradeLevel === selGrade);
    const sem = templateClass?.semesters.find(s => s.id === selSemId);
    const chap = sem?.chapters.find(c => c.id === selChapId);
    if (chap) setChapForm(JSON.parse(JSON.stringify(chap)));
  }, [selGrade, selSemId, selChapId, classes]);

  const handleChapterUpdate = (updatedChapter: Chapter) => onUpdateChapterByGrade(selGrade, selSemId, selChapId, updatedChapter);

  const handleResourceSave = () => {
    if (!resourceEdit) return;
    const { type, item, parentId, semesterId } = resourceEdit;
    if (type === 'schedule') {
        const cls = classes.find(c => c.id === parentId);
        if(cls) {
            const updated = {...cls, schedule: item};
            onUpdateClass(updated);
        }
    } else if (type === 'grades') {
        const cls = classes.find(c => c.id === parentId);
        if(cls) {
            const updated = {...cls};
            const semIdx = updated.semesters.findIndex(s => s.id === semesterId);
            if(semIdx > -1) {
                updated.semesters[semIdx] = {...updated.semesters[semIdx], grades: item};
            }
            onUpdateClass(updated);
        }
    } else if (type === 'exam') {
        onUpdateClassResourceByGrade(selGrade, 'exam', item, selSemId);
    }
    setResourceEdit(null);
    alert('Tersimpan!');
  };

  const currentClass = classes.find(c => c.id === selClassId);
  const templateClass = classes.find(c => c.gradeLevel === selGrade);
  const currentSemester = templateClass?.semesters.find(s => s.id === selSemId);

  const adminTabs = [
    { id: 'profile', label: 'Profil Sekolah', icon: <School size={18}/> },
    { id: 'personalization', label: 'Personalisasi', icon: <Quote size={18}/> },
    { id: 'content', label: 'Manajemen Materi', icon: <BookOpen size={18}/> },
    { id: 'schedule', label: 'Jadwal & Nilai', icon: <CalendarRange size={18}/> },
    { id: 'students', label: 'Data Siswa', icon: <Users size={18}/> },
    { id: 'extras', label: 'Pojok Literasi', icon: <Sparkles size={18}/> },
  ];

  const categories: ExtraCategory[] = ['doa', 'cerita', 'sholat', 'fiqih', 'hadist', 'ramadhan', 'lainnya'];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50/50">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-72 bg-white border-b lg:border-b-0 lg:border-r border-gray-200 lg:sticky lg:top-0 lg:h-screen flex flex-col z-50 overflow-hidden">
        <div className="p-6 flex items-center gap-3 border-b border-gray-100 lg:border-none">
           <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-600/20"><Settings size={20} /></div>
           <div>
              <h1 className="font-bold text-gray-800 text-base leading-tight">Admin PAI</h1>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">Dashboard</p>
           </div>
        </div>
        
        {/* Navigation list */}
        <div className="flex-grow p-4 space-y-1 overflow-x-auto lg:overflow-x-visible lg:overflow-y-auto flex lg:flex-col items-center lg:items-stretch scrollbar-hide">
           {adminTabs.map(item => (
             <button 
                key={item.id} 
                onClick={() => setTab(item.id as any)} 
                className={`flex-shrink-0 lg:w-full px-4 py-3 rounded-xl flex items-center gap-3 font-semibold transition-all text-sm lg:text-[15px] whitespace-nowrap ${tab === item.id ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}
             >
                <span className={`${tab === item.id ? 'text-blue-600' : 'text-gray-400'}`}>{item.icon}</span>
                {item.label}
             </button>
           ))}
        </div>

        <div className="p-4 border-t border-gray-100 mt-auto hidden lg:block">
           <button 
              onClick={onLogout} 
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-red-500 hover:bg-red-50 transition-all text-sm"
            >
              <LogOut size={18} /> Keluar Sesi
           </button>
        </div>
        
        {/* Mobile logout */}
        <div className="lg:hidden p-4 border-t border-gray-100 flex justify-end">
           <button onClick={onLogout} className="text-red-500 font-bold flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-xs"><LogOut size={14}/> Keluar</button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow p-4 sm:p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
             <header className="mb-8 lg:mt-2">
                <h2 className="text-2xl font-bold text-gray-800">{adminTabs.find(t => t.id === tab)?.label}</h2>
                <p className="text-gray-500 text-sm">Manajemen sistem {schoolProfile.name}</p>
             </header>

             <div className="animate-fade-in-up">
               {tab === 'profile' && (
                 <Card>
                    <SectionTitle title="Profil Sekolah" />
                    <Input label="Nama Sekolah" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} />
                    <TextArea label="Deskripsi" value={profileForm.description} onChange={e => setProfileForm({...profileForm, description: e.target.value})} />
                    <Input label="Alamat" value={profileForm.address} onChange={e => setProfileForm({...profileForm, address: e.target.value})} />
                    <Input label="Email" value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <Input label="Nama Guru PAI" value={profileForm.teacherName} onChange={e => setProfileForm({...profileForm, teacherName: e.target.value})} />
                       <Input label="No. WhatsApp (Format 62...)" value={profileForm.phoneNumber} onChange={e => setProfileForm({...profileForm, phoneNumber: e.target.value})} />
                    </div>
                    <div className="mt-6 flex justify-end"><Button onClick={handleProfileSave} className="rounded-xl"><Save size={18} /> Simpan Perubahan</Button></div>
                 </Card>
               )}

               {tab === 'personalization' && (
                 <Card>
                    <SectionTitle title="Konten Beranda" subtitle="Atur teks salam robot dan kata motivasi yang tampil secara bergantian." />
                    <div className="space-y-8">
                      <div>
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><MessageCircle size={20} className="text-blue-600"/> Pesan Salam Pembuka</h3>
                        <TextArea 
                          label="Teks Greeting (Robot)" 
                          value={profileForm.greetingText || ''} 
                          onChange={e => setProfileForm({...profileForm, greetingText: e.target.value})} 
                          placeholder="Assalamu’alaikum... Selamat datang di LMS..."
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>

                      <div className="border-t pt-8">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Quote size={20} className="text-blue-600"/> 5 Kata Motivasi Bergantian</h3>
                        <div className="grid grid-cols-1 gap-4">
                          {[0, 1, 2, 3, 4].map((idx) => (
                            <Input 
                              key={idx}
                              label={`Motivasi #${idx + 1}`}
                              value={(profileForm.quotes && profileForm.quotes[idx]) || ''}
                              onChange={e => {
                                const newQuotes = profileForm.quotes ? [...profileForm.quotes] : ['', '', '', '', ''];
                                newQuotes[idx] = e.target.value;
                                setProfileForm({...profileForm, quotes: newQuotes});
                              }}
                              placeholder="Ketik kutipan hadits atau kata bijak..."
                              className="rounded-xl"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-8 pt-6 border-t flex justify-end">
                      <Button onClick={handleProfileSave} className="rounded-xl"><Save size={18} /> Simpan Pengaturan</Button>
                    </div>
                 </Card>
               )}

               {tab === 'students' && (
                 <Card>
                     <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                       <SectionTitle title="Database Siswa" subtitle={`Total: ${students.length} Siswa`} />
                       <div className="flex items-center gap-2 w-full sm:w-auto">
                          <input type="file" accept=".xlsx, .xls" ref={fileInputRef} onChange={handleFileUpload} className="hidden" id="excel-upload" />
                          <label htmlFor="excel-upload" className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl cursor-pointer hover:bg-green-100 transition-colors text-sm font-bold border border-green-200"><Upload size={16}/> Import Excel</label>
                          <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block"></div>
                          <select className="flex-1 sm:flex-none p-2 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500" value={filterClass} onChange={(e) => setFilterClass(e.target.value)}>
                             <option value="all">Semua Kelas</option>
                             {classes.sort((a, b) => a.id.localeCompare(b.id)).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                       </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                       <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider"><Plus size={16}/> {editingStudentId ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}</h3>
                          <Input placeholder="Nama Lengkap Siswa" value={studentForm.name || ''} onChange={e => setStudentForm({...studentForm, name: e.target.value})} className="mb-2 rounded-xl bg-white"/>
                          <div className="flex flex-wrap sm:flex-nowrap gap-2 mb-2">
                             <Input placeholder="NIS" value={studentForm.nis || ''} onChange={e => setStudentForm({...studentForm, nis: e.target.value})} className="flex-1 mb-0 rounded-xl bg-white"/>
                             <select className="p-3 rounded-xl border border-gray-200 bg-white text-sm" value={studentForm.gender || 'L'} onChange={e => setStudentForm({...studentForm, gender: e.target.value as any})}><option value="L">Laki-laki</option><option value="P">Perempuan</option></select>
                             <select className="p-3 rounded-xl border border-gray-200 bg-white text-sm" value={studentForm.classId || '7A'} onChange={e => setStudentForm({...studentForm, classId: e.target.value})}>{classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
                          </div>
                          <Button onClick={handleStudentSave} className="w-full text-sm py-3 rounded-xl shadow-none">{editingStudentId ? 'Simpan Perubahan' : 'Tambahkan ke Daftar'}</Button>
                          {editingStudentId && <button onClick={() => {setEditingStudentId(null); setStudentForm({ classId: '7A', gender: 'L', name: '', nis: '' })}} className="text-xs text-red-500 mt-2 text-center w-full block font-medium">Batalkan Pengeditan</button>}
                       </div>
                    </div>
                    <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white">
                       <table className="min-w-full text-sm text-left">
                          <thead className="bg-gray-50 font-bold text-gray-600 border-b border-gray-100"><tr><th className="px-6 py-4">NIS</th><th className="px-6 py-4">Nama</th><th className="px-6 py-4">Kelas</th><th className="px-6 py-4">JK</th><th className="px-6 py-4 text-right">Aksi</th></tr></thead>
                          <tbody className="divide-y divide-gray-50">{filteredStudents.map(s => (<tr key={s.id} className="hover:bg-gray-50/50 transition-colors"><td className="px-6 py-3 font-mono text-xs">{s.nis}</td><td className="px-6 py-3 font-semibold text-gray-700">{s.name}</td><td className="px-6 py-3">{s.classId}</td><td className="px-6 py-3">{s.gender}</td><td className="px-6 py-3 text-right flex justify-end gap-2"><button onClick={() => handleStudentEdit(s)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors"><Edit3 size={16}/></button><button onClick={() => handleStudentDelete(s.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"><Trash2 size={16}/></button></td></tr>))}</tbody>
                       </table>
                    </div>
                 </Card>
               )}

               {tab === 'schedule' && (
                  <Card>
                      <SectionTitle title="Jadwal & Rekap Nilai" subtitle="Kelola tautan jadwal pelajaran dan rekapitulasi nilai per semester." />
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          <div>
                              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Filter size={18} className="text-blue-500"/> 1. Pilih Kelas Utama</h3>
                              <div className="mb-6">
                                  <select 
                                    className="w-full p-4 rounded-2xl border border-gray-200 bg-white font-bold text-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                                    value={selClassId}
                                    onChange={(e) => { setSelClassId(e.target.value); setResourceEdit(null); }}
                                  >
                                    {classes.sort((a,b)=>a.id.localeCompare(b.id)).map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                  </select>
                              </div>
                              
                              {currentClass && (
                                  <div className="space-y-3">
                                      <h3 className="font-bold text-gray-800 mb-4">2. Pilih Data yang Ingin Diatur</h3>
                                      <button onClick={() => setResourceEdit({ type: 'schedule', item: currentClass.schedule || { id: 'sch', title: 'Jadwal Pelajaran', type: 'link', url: '' }, parentId: currentClass.id })} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${resourceEdit?.type === 'schedule' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white border border-gray-100 hover:border-blue-200 text-gray-700'}`}>
                                          <div className="flex items-center gap-3"><CalendarRange size={20}/><span className="font-bold">Jadwal Pelajaran</span></div>
                                          <ChevronRight size={18} className={resourceEdit?.type === 'schedule' ? 'text-white' : 'text-gray-300'}/>
                                      </button>
                                      <button onClick={() => {
                                          const semGanjil = currentClass.semesters.find(s => s.id === 'ganjil');
                                          setResourceEdit({ type: 'grades', item: semGanjil?.grades || { id: 'grd-ganjil', title: 'Rekap Nilai Ganjil', type: 'link', url: '' }, parentId: currentClass.id, semesterId: 'ganjil' });
                                      }} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${resourceEdit?.type === 'grades' && resourceEdit.semesterId === 'ganjil' ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' : 'bg-white border border-gray-100 hover:border-green-200 text-gray-700'}`}>
                                          <div className="flex items-center gap-3"><GraduationCap size={20}/><span className="font-bold">Nilai Semester Ganjil</span></div>
                                          <ChevronRight size={18} className={resourceEdit?.type === 'grades' && resourceEdit.semesterId === 'ganjil' ? 'text-white' : 'text-gray-300'}/>
                                      </button>
                                      <button onClick={() => {
                                          const semGenap = currentClass.semesters.find(s => s.id === 'genap');
                                          setResourceEdit({ type: 'grades', item: semGenap?.grades || { id: 'grd-genap', title: 'Rekap Nilai Genap', type: 'link', url: '' }, parentId: currentClass.id, semesterId: 'genap' });
                                      }} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${resourceEdit?.type === 'grades' && resourceEdit.semesterId === 'genap' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-white border border-gray-100 hover:border-emerald-200 text-gray-700'}`}>
                                          <div className="flex items-center gap-3"><GraduationCap size={20}/><span className="font-bold">Nilai Semester Genap</span></div>
                                          <ChevronRight size={18} className={resourceEdit?.type === 'grades' && resourceEdit.semesterId === 'genap' ? 'text-white' : 'text-gray-300'}/>
                                      </button>
                                  </div>
                              )}
                          </div>
                          <div className="bg-gray-100/50 p-6 rounded-3xl border border-gray-100 min-h-[400px]">
                              {resourceEdit ? (
                                  <div className="animate-fade-in-up">
                                      <div className="flex justify-between items-center mb-6">
                                          <div><h3 className="font-bold text-gray-800 text-lg">{resourceEdit.item.title}</h3><p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{selClassId} • {resourceEdit.semesterId || 'UMUM'}</p></div>
                                          <Button onClick={handleResourceSave} className="py-2 px-6 rounded-xl shadow-none text-sm"><Save size={16}/> Simpan</Button>
                                      </div>
                                      <div className="flex gap-2 mb-6 bg-white p-1.5 rounded-xl border border-gray-200">
                                          <button onClick={() => setResourceEdit({...resourceEdit, item: {...resourceEdit.item, type: 'link'}})} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-bold text-xs transition-all ${resourceEdit.item.type === 'link' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                                              <LinkIcon size={14}/> Tautan URL
                                          </button>
                                          <button onClick={() => setResourceEdit({...resourceEdit, item: {...resourceEdit.item, type: 'html'}})} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-bold text-xs transition-all ${resourceEdit.item.type === 'html' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                                              <Code size={14}/> Kode HTML
                                          </button>
                                      </div>
                                      {resourceEdit.item.type === 'link' ? (
                                          <Input label="Link Dokumen / Spreadsheet" placeholder="https://docs.google.com/..." value={resourceEdit.item.url || ''} onChange={e => setResourceEdit({...resourceEdit, item: {...resourceEdit.item, url: e.target.value}})} className="rounded-xl bg-white shadow-sm border-gray-100"/>
                                      ) : (
                                          <TextArea label="Input Tabel / Embed HTML" placeholder="<table class='...'>...</table>" value={resourceEdit.item.content || ''} onChange={e => setResourceEdit({...resourceEdit, item: {...resourceEdit.item, content: e.target.value}})} className="h-64 font-mono text-xs rounded-xl bg-white shadow-sm border-gray-100"/>
                                      )}
                                      <div className="mt-4 p-4 bg-amber-50 rounded-2xl text-amber-700 text-[11px] leading-relaxed border border-amber-100 flex gap-3">
                                         <Sparkles size={16} className="flex-shrink-0"/>
                                         <span>Gunakan <b>Tautan URL</b> untuk dokumen eksternal, gunakan <b>HTML</b> jika ingin menampilkan konten langsung di halaman siswa.</span>
                                      </div>
                                  </div>
                              ) : <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center italic space-y-4">
                                    <div className="p-5 bg-white rounded-full shadow-sm"><Edit3 size={40} className="opacity-10"/></div>
                                    <p className="text-sm font-medium">Pilih data di sebelah kiri<br/>untuk memulai pengaturan.</p>
                                  </div>}
                          </div>
                      </div>
                  </Card>
               )}

               {tab === 'content' && (
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-1 h-fit">
                       <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><GraduationCap size={18} className="text-blue-500"/> Tingkatan Materi</h3>
                       <div className="space-y-4">
                          <div className="flex flex-col gap-2">
                             {[{id: '7', label: 'Kelas VII'},{id: '8', label: 'Kelas VIII'},{id: '9', label: 'Kelas IX'}].map(g => (
                               <button key={g.id} onClick={() => setSelGrade(g.id)} className={`w-full p-4 text-left rounded-2xl border-2 transition-all font-bold ${selGrade === g.id ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-50 bg-white text-gray-400 hover:border-gray-200'}`}>{g.label}</button>
                             ))}
                          </div>
                          <select className="w-full p-3 border border-gray-200 rounded-2xl bg-white text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500" value={selSemId} onChange={e => setSelSemId(e.target.value)}><option value="ganjil">Semester Ganjil</option><option value="genap">Semester Genap</option></select>
                          
                          <div className="pt-4 border-t border-gray-100">
                              <div className="flex justify-between items-center px-1 mb-2"><div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bank Soal Terintegrasi</div><button onClick={() => setResourceEdit({ type: 'exam', item: { id: Date.now().toString(), title: 'Soal Baru', type: 'link', url: '' } })} className="text-[10px] bg-blue-600 text-white px-2 py-1 rounded-lg font-bold shadow-sm">+ Tambah</button></div>
                              <div className="space-y-1">
                                {currentSemester?.exams?.map(exam => (<div key={exam.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-xl text-sm group transition-colors"><span className="truncate text-gray-600 font-medium">{exam.title}</span><div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => setResourceEdit({ type: 'exam', item: exam })} className="p-1.5 text-blue-500 hover:bg-blue-100 rounded-lg"><Edit3 size={12}/></button><button onClick={() => { if(confirm('Hapus soal ini?')) onUpdateClassResourceByGrade(selGrade, 'exam', { id: 'DUMMY', title: 'REFRESH', type: 'html' }, selSemId); }} className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg"><Trash2 size={12}/></button></div></div>))}
                              </div>
                          </div>

                          <div className="pt-4 border-t border-gray-100 max-h-[300px] overflow-y-auto pr-1">
                             <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Daftar Materi Bab</div>
                             <div className="space-y-1">
                                {currentSemester?.chapters.map(chap => (<div key={chap.id} onClick={() => { setSelChapId(chap.id); setResourceEdit(null); }} className={`p-3 rounded-xl cursor-pointer text-sm transition-all ${selChapId === chap.id && !resourceEdit ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/20' : 'hover:bg-gray-100 text-gray-600 font-medium'}`}>{chap.title}</div>))}
                             </div>
                          </div>
                       </div>
                    </Card>
                    <Card className="lg:col-span-2">
                       {resourceEdit && resourceEdit.type === 'exam' ? (
                          <div className="animate-fade-in-up">
                              <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4"><h2 className="text-xl font-bold">Edit Soal Evaluasi</h2><div className="flex gap-2"><Button variant="secondary" onClick={() => setResourceEdit(null)} className="py-2 px-4 text-xs rounded-xl">Batal</Button><Button onClick={handleResourceSave} className="py-2 px-4 text-xs rounded-xl"><Save size={14}/> Simpan Ke Semua Kelas</Button></div></div>
                              <div className="space-y-4">
                                  <Input label="Judul Soal" value={resourceEdit.item.title} onChange={e => setResourceEdit({...resourceEdit, item: {...resourceEdit.item, title: e.target.value}})} className="rounded-xl"/>
                                  <div className="flex gap-4"><label className="flex items-center gap-2 cursor-pointer font-bold text-xs"><input type="radio" checked={resourceEdit.item.type === 'html'} onChange={() => setResourceEdit({...resourceEdit, item: {...resourceEdit.item, type: 'html'}})}/>HTML</label><label className="flex items-center gap-2 cursor-pointer font-bold text-xs"><input type="radio" checked={resourceEdit.item.type === 'link'} onChange={() => setResourceEdit({...resourceEdit, item: {...resourceEdit.item, type: 'link'}})}/>URL Link</label></div>
                                  {resourceEdit.item.type === 'html' ? <TextArea label="Konten HTML / Embed" value={resourceEdit.item.content || ''} onChange={e => setResourceEdit({...resourceEdit, item: {...resourceEdit.item, content: e.target.value}})} className="rounded-xl font-mono text-xs"/> : <Input label="URL Google Form / Quizizz" value={resourceEdit.item.url || ''} onChange={e => setResourceEdit({...resourceEdit, item: {...resourceEdit.item, url: e.target.value}})} className="rounded-xl"/>}
                              </div>
                          </div>
                       ) : chapForm ? (
                          <div className="relative animate-fade-in-up">
                             <div className="absolute -top-1 right-0 bg-blue-600 text-white text-[9px] font-extrabold px-2 py-1 rounded-full shadow-lg">SYNC MODE</div>
                             <AdminContentEditor chapter={chapForm} onSave={handleChapterUpdate} />
                          </div>
                       ) : <div className="flex flex-col items-center justify-center h-[400px] text-gray-300 space-y-4"><div className="p-6 bg-gray-50 rounded-full"><BookOpen size={48} className="opacity-10"/></div><p className="text-sm font-medium">Pilih bab materi untuk mulai mengedit konten.</p></div>}
                    </Card>
                 </div>
               )}

               {tab === 'extras' && (
                 <Card>
                   <SectionTitle title="Pojok Literasi Digital" subtitle="Kelola konten tambahan seperti kumpulan doa, kisah islami, dan materi ibadah." />
                   <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 mb-10">
                      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">{editingExtraId ? 'Edit Konten Literasi' : 'Tambah Konten Literasi Baru'}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                         <Input label="Judul Konten" value={extraForm.title || ''} onChange={e => setExtraForm({...extraForm, title: e.target.value})} className="mb-0 rounded-xl bg-white"/>
                         <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Kategori Literasi</label><select className="w-full p-3 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500 font-medium" value={extraForm.category} onChange={e => setExtraForm({...extraForm, category: e.target.value as ExtraCategory})}>
                            {categories.map(cat => <option key={cat} value={cat}>{cat.toUpperCase()}</option>)}
                         </select></div>
                      </div>
                      <div className="flex gap-4 mb-4"><label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-gray-600"><input type="radio" checked={extraForm.type === 'link'} onChange={() => setExtraForm({...extraForm, type: 'link'})}/>Tautan Luar</label><label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-gray-600"><input type="radio" checked={extraForm.type === 'html'} onChange={() => setExtraForm({...extraForm, type: 'html'})}/>Isi HTML</label></div>
                      {extraForm.type === 'link' ? <Input placeholder="Contoh: https://www.youtube.com/..." value={extraForm.url || ''} onChange={e => setExtraForm({...extraForm, url: e.target.value})} className="rounded-xl bg-white shadow-sm border-gray-100"/> : <TextArea placeholder="Tuliskan teks atau masukkan kode HTML..." value={extraForm.content || ''} onChange={e => setExtraForm({...extraForm, content: e.target.value})} className="rounded-xl bg-white shadow-sm border-gray-100 font-mono text-xs"/>}
                      <div className="flex gap-2 mt-2"><Button onClick={handleExtraSave} className="px-8 rounded-xl shadow-none">{editingExtraId ? 'Simpan Konten' : 'Tambahkan Konten'}</Button></div>
                   </div>
                   
                   <div className="space-y-8">
                      {categories.map(cat => {
                        const items = extras.filter(e => e.category === cat);
                        if (items.length === 0) return null;
                        return (
                          <div key={cat} className="animate-fade-in-up">
                             <h3 className="font-extrabold text-gray-400 text-[10px] uppercase tracking-[0.2em] mb-4 border-b border-gray-100 pb-3 flex items-center gap-3">
                                <span className={`p-1.5 rounded-lg bg-gray-100 text-gray-600`}>
                                  {cat === 'doa' && <BookHeart size={12} />}
                                  {cat === 'sholat' && <Sun size={12} />}
                                  {cat === 'cerita' && <Sparkles size={12} />}
                                  {cat === 'hadist' && <MessageCircle size={12} />}
                                  {cat === 'fiqih' && <Hand size={12} />}
                                  {cat === 'ramadhan' && <Coffee size={12} />}
                                  {cat === 'lainnya' && <MoreHorizontal size={12} />}
                                </span>
                                {cat} <span className="text-gray-300 font-normal">({items.length} konten)</span>
                             </h3>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {items.map(item => (
                                  <div key={item.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:shadow-md transition-all group">
                                     <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${item.type === 'link' ? 'bg-blue-400' : 'bg-green-400'}`}></div>
                                        <span className="font-semibold text-gray-700 text-sm group-hover:text-blue-600 transition-colors">{item.title}</span>
                                     </div>
                                     <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleExtraEdit(item)} className="text-blue-500 p-2 hover:bg-blue-50 rounded-xl transition-colors"><Edit3 size={14}/></button>
                                        <button onClick={() => handleExtraDelete(item.id)} className="text-red-500 p-2 hover:bg-red-50 rounded-xl transition-colors"><Trash2 size={14}/></button>
                                     </div>
                                  </div>
                                ))}
                             </div>
                          </div>
                        );
                      })}
                   </div>
                 </Card>
               )}
             </div>
          </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.LANDING);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ExtraCategory>('doa');
  const [classesData, setClassesData] = useState<ClassData[]>(CLASSES_DATA);
  const [studentsData, setStudentsData] = useState<Student[]>(DEFAULT_STUDENTS);
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(DEFAULT_SCHOOL_PROFILE);
  const [extrasData, setExtrasData] = useState<ExtraContent[]>(DEFAULT_EXTRAS);
  const [currentUser, setCurrentUser] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const seedDatabase = async () => {
     try {
        const batch = writeBatch(db);
        batch.set(doc(db, 'settings', 'schoolProfile'), DEFAULT_SCHOOL_PROFILE);
        CLASSES_DATA.forEach(cls => { batch.set(doc(db, 'classes', cls.id), cls); });
        DEFAULT_STUDENTS.slice(0, 10).forEach(s => { batch.set(doc(db, 'students', s.id), s); });
        DEFAULT_EXTRAS.forEach(ex => { batch.set(doc(db, 'extras', ex.id), ex); });
        await batch.commit();
        window.location.reload();
     } catch (e) { console.error("Error seeding DB:", e); }
  };

  useEffect(() => {
     const fetchData = async () => {
        if (!db) { setIsLoading(false); return; }
        try {
            const profileSnap = await getDoc(doc(db, 'settings', 'schoolProfile'));
            if (profileSnap.exists()) {
              // Merge default profile with stored data to ensure new fields exist
              setSchoolProfile({
                ...DEFAULT_SCHOOL_PROFILE,
                ...profileSnap.data()
              } as SchoolProfile);
            }
            const classesSnap = await getDocs(collection(db, 'classes'));
            const fetchedClasses: ClassData[] = [];
            classesSnap.forEach(d => fetchedClasses.push(d.data() as ClassData));
            const studentsSnap = await getDocs(collection(db, 'students'));
            const fetchedStudents: Student[] = [];
            studentsSnap.forEach(d => fetchedStudents.push(d.data() as Student));
            const extrasSnap = await getDocs(collection(db, 'extras'));
            const fetchedExtras: ExtraContent[] = [];
            extrasSnap.forEach(d => fetchedExtras.push(d.data() as ExtraContent));
            if (fetchedClasses.length === 0) await seedDatabase();
            else {
               setClassesData(fetchedClasses);
               if (fetchedStudents.length > 0) setStudentsData(fetchedStudents);
               if (fetchedExtras.length > 0) setExtrasData(fetchedExtras);
            }
        } catch (e) { console.error("Fetch Error:", e); } finally { setIsLoading(false); }
     };
     fetchData();
  }, []);

  const handleUpdateProfile = async (newProfile: SchoolProfile) => {
      setSchoolProfile(newProfile);
      if(db) await setDoc(doc(db, 'settings', 'schoolProfile'), newProfile);
  };
  const handleUpdateClass = async (updatedClass: ClassData) => {
      setClassesData(prev => prev.map(c => c.id === updatedClass.id ? updatedClass : c));
      if(db) await setDoc(doc(db, 'classes', updatedClass.id), updatedClass);
  };
  const handleUpdateChapterByGrade = async (gradeLevel: string, semId: string, chapId: string, data: Partial<Chapter>) => {
      const targetClasses = classesData.filter(c => c.gradeLevel === gradeLevel);
      const newClassesData = classesData.map(cls => {
          if (cls.gradeLevel !== gradeLevel) return cls;
          return { ...cls, semesters: cls.semesters.map(sem => {
              if (sem.id !== semId) return sem;
              return { ...sem, chapters: sem.chapters.map(chap => {
                  if (chap.id !== chapId) return chap;
                  return { ...chap, ...data };
              }) };
          }) };
      });
      setClassesData(newClassesData);
      if (db) {
          const batch = writeBatch(db);
          targetClasses.forEach(cls => {
              const updatedCls = newClassesData.find(nc => nc.id === cls.id);
              if (updatedCls) batch.set(doc(db, 'classes', cls.id), updatedCls);
          });
          await batch.commit();
      }
  };
  const handleUpdateClassResourceByGrade = async (gradeLevel: string, resourceType: 'exam' | 'grades' | 'schedule', item: ResourceItem, semesterId?: string) => {
      const newClassesData = classesData.map(cls => {
          if (cls.gradeLevel !== gradeLevel) return cls;
          const updatedCls = { ...cls };
          if (resourceType === 'schedule') updatedCls.schedule = item;
          if (resourceType === 'grades' && semesterId) {
              updatedCls.semesters = updatedCls.semesters.map(sem => sem.id === semesterId ? { ...sem, grades: item } : sem);
          }
          if (resourceType === 'exam' && semesterId) {
              updatedCls.semesters = updatedCls.semesters.map(sem => {
                  if (sem.id !== semesterId) return sem;
                  const exams = sem.exams ? [...sem.exams] : [];
                  const idx = exams.findIndex(e => e.id === item.id);
                  if (idx > -1) exams[idx] = item;
                  else exams.push(item);
                  return { ...sem, exams };
              });
          }
          return updatedCls;
      });
      setClassesData(newClassesData);
      if (db) {
          const batch = writeBatch(db);
          classesData.filter(c => c.gradeLevel === gradeLevel).forEach(cls => {
              const updated = newClassesData.find(nc => nc.id === cls.id);
              if(updated) batch.set(doc(db, 'classes', cls.id), updated);
          });
          await batch.commit();
      }
  };
  const handleSaveStudent = async (student: Student) => {
      setStudentsData(prev => {
          const exists = prev.find(s => s.id === student.id);
          if (exists) return prev.map(s => s.id === student.id ? student : s);
          return [...prev, student];
      });
      if(db) await setDoc(doc(db, 'students', student.id), student);
  };
  const handleDeleteStudent = async (id: string) => { setStudentsData(prev => prev.filter(s => s.id !== id)); if(db) await deleteDoc(doc(db, 'students', id)); };
  const handleSaveExtra = async (extra: ExtraContent) => {
      setExtrasData(prev => {
          const exists = prev.find(e => e.id === extra.id);
          if (exists) return prev.map(e => e.id === extra.id ? extra : e);
          return [...prev, extra];
      });
      if(db) await setDoc(doc(db, 'extras', extra.id), extra);
  };
  const handleDeleteExtra = async (id: string) => { setExtrasData(prev => prev.filter(e => e.id !== id)); if(db) await deleteDoc(doc(db, 'extras', id)); };
  const navigate = (newView: ViewState, classId?: string | null, chapterId?: string | null) => {
      setView(newView);
      if (classId !== undefined) setSelectedClassId(classId);
      if (chapterId !== undefined) setSelectedChapterId(chapterId);
      window.scrollTo(0, 0);
  };
  const handleLoginSuccess = (student: Student, classId: string) => { setCurrentUser(student); navigate(ViewState.CLASS_DETAIL, classId); };
  const activeChapter = selectedClassId && selectedChapterId ? classesData.find(c => c.id === selectedClassId)?.semesters.flatMap(s => s.chapters).find(ch => ch.id === selectedChapterId) : null;
  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-center"><div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div><p className="text-gray-500 font-medium">Memuat Data...</p></div></div>;
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 font-sans text-gray-800">
      {view !== ViewState.ADMIN_DASHBOARD && <Navbar goHome={() => navigate(ViewState.LANDING)} goAdmin={() => navigate(ViewState.ADMIN_LOGIN)} schoolName={schoolProfile.name}/>}
      <div className={view !== ViewState.ADMIN_DASHBOARD ? "pt-20" : ""}>
        <AnimatePresence mode="wait">
           {view === ViewState.LANDING && <LandingView key="landing" onSelectClass={(clsId) => navigate(ViewState.STUDENT_LOGIN, clsId)} onAdminLogin={() => navigate(ViewState.ADMIN_LOGIN)} onSelectCategory={(c) => { setSelectedCategory(c); navigate(ViewState.EXTRA_CATEGORY_LIST); }} classes={classesData} extras={extrasData} profile={schoolProfile}/>}
           {view === ViewState.STUDENT_LOGIN && <StudentLoginView key="login" initialClassId={selectedClassId} classes={classesData} students={studentsData} onLoginSuccess={handleLoginSuccess} onBack={() => navigate(ViewState.LANDING)}/>}
           {view === ViewState.CLASS_DETAIL && selectedClassId && <ClassDetailView key="class-detail" classData={classesData.find(c => c.id === selectedClassId)!} student={currentUser} onBack={() => navigate(ViewState.LANDING)} onSelectChapter={(cid) => navigate(ViewState.CHAPTER_CONTENT, selectedClassId, cid)}/>}
           {view === ViewState.CHAPTER_CONTENT && activeChapter && <ChapterContentView key="chapter-content" chapter={activeChapter} onBack={() => navigate(ViewState.CLASS_DETAIL)}/>}
           {view === ViewState.EXTRA_CATEGORY_LIST && (
              <motion.div key="extra-list" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="max-w-6xl mx-auto px-4 py-8">
                  <Button variant="secondary" onClick={() => navigate(ViewState.LANDING)} className="mb-8"><ArrowLeft size={16}/> Kembali</Button>
                  <SectionTitle title={`Kategori: ${selectedCategory.toUpperCase()}`} />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {extrasData.filter(e => e.category === selectedCategory).map(item => (
                          <Card key={item.id}>
                              <div className="flex items-center gap-3 mb-3">
                                  <div className={`p-2 rounded-lg bg-gray-100`}>{item.category === 'doa' && <BookHeart size={20} className="text-green-600"/>}{item.category === 'sholat' && <Sun size={20} className="text-orange-600"/>}{item.category !== 'doa' && item.category !== 'sholat' && <Sparkles size={20} className="text-blue-600"/>}</div>
                                  <h3 className="font-bold text-gray-800">{item.title}</h3>
                              </div>
                              {item.type === 'link' ? <a href={item.url} target="_blank" className="text-blue-600 hover:underline flex items-center gap-2 text-sm font-medium"><LinkIcon size={14}/> Buka Konten</a> : <div className="prose prose-sm max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: item.content || '' }} />}
                          </Card>
                      ))}
                      {extrasData.filter(e => e.category === selectedCategory).length === 0 && <div className="col-span-full text-center py-12 text-gray-400 italic">Belum ada konten untuk kategori ini.</div>}
                  </div>
              </motion.div>
           )}
           {view === ViewState.ADMIN_LOGIN && <AdminLoginView key="admin-login" onLogin={() => navigate(ViewState.ADMIN_DASHBOARD)} onBack={() => navigate(ViewState.LANDING)}/>}
           {view === ViewState.ADMIN_DASHBOARD && <AdminDashboardView key="admin-dash" classes={classesData} schoolProfile={schoolProfile} students={studentsData} extras={extrasData} onUpdateChapterByGrade={handleUpdateChapterByGrade} onUpdateClassResourceByGrade={handleUpdateClassResourceByGrade} onUpdateClass={handleUpdateClass} onUpdateProfile={handleUpdateProfile} onSaveStudent={handleSaveStudent} onDeleteStudent={handleDeleteStudent} onSaveExtra={handleSaveExtra} onDeleteExtra={handleDeleteExtra} onLogout={() => navigate(ViewState.LANDING)}/>}
        </AnimatePresence>
      </div>
      {view !== ViewState.ADMIN_DASHBOARD && view !== ViewState.CHAPTER_CONTENT && <Footer onAdminClick={() => navigate(ViewState.ADMIN_LOGIN)} profile={schoolProfile} />}
    </div>
  );
};

export default App;