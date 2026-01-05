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
  Quote,
  List,
  MonitorPlay
} from 'lucide-react';

// Import Firebase
import { db, doc, setDoc, getDoc, collection, getDocs, deleteDoc } from './firebase';
import { writeBatch } from 'firebase/firestore';

import { CLASSES_DATA, FEATURES, DEFAULT_SCHOOL_PROFILE, DEFAULT_STUDENTS, DEFAULT_EXTRAS } from './constants';
import { ViewState, ClassData, Chapter, SchoolProfile, Student, ExtraContent, ExtraCategory, ResourceItem, ContentSection, Semester } from './types';
import { Button, Card, SectionTitle, Input, TextArea, Badge } from './components/UIComponents';

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
  const fallbackTimes = {
    Fajr: "04:15",
    Dhuhr: "11:40",
    Asr: "15:00",
    Maghrib: "17:50",
    Isha: "19:00"
  };

  // Inisialisasi langsung dengan fallbackTimes agar widget langsung muncul
  const [times, setTimes] = useState<any>(fallbackTimes);
  const [locationName, setLocationName] = useState('Waktu Jakarta (Default)');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [nextPrayer, setNextPrayer] = useState<string>('Memuat jadwal...');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    if (navigator.geolocation) {
      // Ubah status loading lokasi tapi jangan hapus times dulu
      setLocationName('Mendeteksi Lokasi...');
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const date = new Date();
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          
          const response = await fetch(`https://api.aladhan.com/v1/timings/${day}-${month}-${year}?latitude=${latitude}&longitude=${longitude}&method=20`); 
          const data = await response.json();
          if (data.code === 200) {
            setTimes(data.data.timings);
            setLocationName('Lokasi Anda');
          } else {
             setLocationName('Waktu Jakarta (Offline)');
          }
        } catch (error) {
          setLocationName("Waktu Jakarta (Offline)");
        }
      }, (error) => {
        setLocationName("Waktu Jakarta (Default)");
      });
    }
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (times) {
      const now = new Date();
      // Helper untuk membersihkan string waktu (misal "04:15 (WIB)" -> "04:15")
      const cleanTime = (t: string) => t ? t.split(' ')[0] : '00:00';

      const prayerList = [
        { name: 'Subuh', time: cleanTime(times.Fajr) },
        { name: 'Dzuhur', time: cleanTime(times.Dhuhr) },
        { name: 'Ashar', time: cleanTime(times.Asr) },
        { name: 'Maghrib', time: cleanTime(times.Maghrib) },
        { name: 'Isya', time: cleanTime(times.Isha) },
      ];

      let targetPrayer = null;
      let targetTime = null;
      let targetDate = null;

      for (const p of prayerList) {
        const [h, m] = p.time.split(':').map(Number);
        const pDate = new Date();
        pDate.setHours(h, m, 0, 0);
        
        if (pDate > now) {
          targetPrayer = p.name;
          targetTime = p.time;
          targetDate = pDate;
          break;
        }
      }

      // Jika tidak ada jadwal tersisa hari ini, ambil Subuh besok
      if (!targetPrayer) {
        const p = prayerList[0]; // Subuh
        const [h, m] = p.time.split(':').map(Number);
        targetPrayer = p.name;
        targetTime = p.time;
        targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 1);
        targetDate.setHours(h, m, 0, 0);
      }

      if (targetDate) {
        const diffMs = targetDate.getTime() - now.getTime();
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000); // Tambahkan detik
        setNextPrayer(`Menuju ${targetPrayer} (${targetTime}) - ${diffHrs}j ${diffMins}m ${diffSecs}d`);
      }
    }
  }, [times, currentTime]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date);
  };

  const formatTimeOnly = (t: string) => t ? t.split(' ')[0] : '-';

  return (
    <div className="flex flex-col items-center justify-center mb-8 gap-4">
      <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl px-6 py-2 shadow-sm flex items-center gap-4 text-sm font-medium text-gray-600 flex-wrap justify-center">
         <span className="flex items-center gap-1.5"><Calendar size={14} className="text-blue-500"/> {formatDate(currentTime)}</span>
         <span className="hidden sm:inline w-px h-4 bg-gray-300"></span>
         <span className="flex items-center gap-1.5"><Clock size={14} className="text-blue-500"/> {currentTime.toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit', second: '2-digit'})}</span>
         <span className="hidden sm:inline w-px h-4 bg-gray-300"></span>
         <span className="flex items-center gap-1.5"><MapPin size={14} className="text-red-500"/> {locationName}</span>
      </div>
      {times && (
        <div className="flex flex-col items-center gap-3 w-full max-w-2xl mx-auto">
          <div className="grid grid-cols-5 gap-2 sm:gap-4 w-full">
            {[
              { name: 'Subuh', time: times.Fajr },
              { name: 'Dzuhur', time: times.Dhuhr },
              { name: 'Ashar', time: times.Asr },
              { name: 'Maghrib', time: times.Maghrib },
              { name: 'Isya', time: times.Isha },
            ].map((item) => (
              <div key={item.name} className="flex flex-col items-center bg-white/60 backdrop-blur-md rounded-xl p-2 sm:p-3 border border-white/50 shadow-sm transition-transform hover:scale-105">
                <span className="text-[10px] sm:text-xs uppercase font-bold text-gray-400 tracking-wider mb-1">{item.name}</span>
                <span className="text-sm sm:text-lg font-bold text-gray-800">{formatTimeOnly(item.time)}</span>
              </div>
            ))}
          </div>
          <div className="text-sm font-medium text-blue-700 bg-blue-100/80 px-6 py-2 rounded-full animate-pulse border border-blue-200 shadow-sm mt-2">
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

// --- New Component: Rich HTML Content Renderer ---
const RichHtmlContent: React.FC<{ content: string; className?: string; iframeHeight?: string }> = ({ content, className = '', iframeHeight = 'h-[800px]' }) => {
  // Gunakan regex untuk deteksi yang lebih robust (case insensitive)
  const isComplexContent = /<script|<style|<iframe/i.test(content);

  if (isComplexContent) {
    return (
      <div className={`w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ${className}`}>
        {/* Menggunakan srcDoc untuk menjalankan script dalam sandbox yang aman */}
        <iframe 
          srcDoc={content} 
          className={`w-full ${iframeHeight} border-none`}
          title="Embedded Content"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />
      </div>
    );
  }

  return (
    <div 
      className={`prose prose-sm max-w-none prose-blue ${className}`} 
      dangerouslySetInnerHTML={{ __html: content }} 
    />
  );
};

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
         <Card className="mb-6 border-l-4 border-l-blue-500 bg-blue-50/50">
            <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2"><CalendarRange size={18}/> Jadwal Pelajaran {classData.name}</h3>
            {classData.schedule.type === 'html' ? <RichHtmlContent content={classData.schedule.content || ''} iframeHeight="h-[500px]" /> : <a href={classData.schedule.url} target="_blank" className="text-blue-600 hover:underline">Lihat Jadwal</a>}
         </Card>
      )}

      {gradeResource && (
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100 mb-8">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-3 text-xl border-b border-green-200/50 pb-4">
               <div className="p-2 bg-green-100 rounded-lg text-green-600"><GraduationCap size={24}/></div>
               Rekapitulasi Nilai Semester {activeSem === 'ganjil' ? 'Ganjil' : 'Genap'}
            </h3>
            {gradeResource.type === 'html' ? <RichHtmlContent content={gradeResource.content || ''} /> : <a href={gradeResource.url} target="_blank" className="text-green-600 hover:underline flex items-center gap-2 font-semibold"><ExternalLink size={16}/> Buka Data Rekap Nilai</a>}
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
         {currentSemester?.chapters.map((chapter) => (
            <Card key={chapter.id} onClick={() => onSelectChapter(chapter.id)} className="h-full flex flex-col cursor-pointer group hover:border-blue-300">
               <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 bg-${classData.color}-50 text-${classData.color}-700 text-[10px] font-extrabold rounded-full uppercase tracking-widest`}>BAB {chapter.title.split(':')[0].replace('Bab ', '')}</span>
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
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);

  // Reset selected content when tab changes
  useEffect(() => {
    if (activeTab === 'materi') {
      if (chapter.contents.length > 0) setSelectedContentId(chapter.contents[0].id);
      else setSelectedContentId(null);
    } else if (activeTab === 'video') {
      if (chapter.videos.length > 0) setSelectedContentId(chapter.videos[0].id);
      else setSelectedContentId(null);
    } else if (activeTab === 'kuis') {
      if (chapter.quizzes.length > 0) setSelectedContentId(chapter.quizzes[0].id);
      else setSelectedContentId(null);
    }
  }, [activeTab, chapter]);

  const renderContent = () => {
    if (activeTab === 'materi') {
      const section = chapter.contents.find(c => c.id === selectedContentId);
      if (!section) return <div className="text-center text-gray-400 py-10">Pilih judul materi di sebelah kiri/atas untuk membaca.</div>;
      
      return (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} key={section.id}>
           <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">{section.title}</h2>
           {section.type === 'link' ? <a href={section.url} target="_blank" className="text-blue-600 hover:underline flex items-center gap-2 font-medium"><LinkIcon size={18}/> Buka Materi: {section.title}</a> : <RichHtmlContent content={section.content} />}
        </motion.div>
      );
    } 
    
    if (activeTab === 'video') {
      const video = chapter.videos.find(v => v.id === selectedContentId);
      if (!video) return <div className="text-center text-gray-400 py-10">Pilih judul video di sebelah kiri/atas untuk menonton.</div>;

      return (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} key={video.id}>
           <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">{video.title}</h2>
           {video.type === 'link' && video.url ? (
             video.url.includes('youtu') ? (
               <div className="aspect-w-16 aspect-h-9 rounded-xl overflow-hidden shadow-lg"><iframe src={`https://www.youtube.com/embed/${getYoutubeId(video.url)}`} title={video.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-[300px] md:h-[400px]"></iframe></div>
             ) : (
                <div className="p-6 bg-blue-50 rounded-xl flex flex-col items-center">
                   <Youtube size={48} className="text-blue-500 mb-4"/>
                   <p className="mb-4 text-gray-600">Video ini adalah tautan eksternal.</p>
                   <a href={video.url} target="_blank" className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700">Buka Video</a>
                </div>
             )
           ) : <RichHtmlContent content={video.content || ''} />}
        </motion.div>
      );
    }

    if (activeTab === 'kuis') {
      const quiz = chapter.quizzes.find(q => q.id === selectedContentId);
      if (!quiz) return <div className="text-center text-gray-400 py-10">Pilih judul kuis di sebelah kiri/atas untuk mengerjakan.</div>;

      return (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} key={quiz.id} className="p-6 border border-gray-200 rounded-xl bg-gray-50 flex flex-col items-center gap-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600"><FileQuestion size={32}/></div>
            <div>
              <h4 className="font-bold text-gray-900 text-xl">{quiz.title}</h4>
              <p className="text-gray-500">Kerjakan dengan jujur dan teliti.</p>
            </div>
            {quiz.type === 'link' ? <a href={quiz.url} target="_blank" rel="noreferrer" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">Mulai Kuis Sekarang</a> : <RichHtmlContent content={quiz.content || ''} />}
        </motion.div>
      );
    }
  };

  const getList = () => {
    if (activeTab === 'materi') return chapter.contents;
    if (activeTab === 'video') return chapter.videos;
    return chapter.quizzes;
  };

  const items = getList();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-7xl mx-auto px-4 py-8">
      <Button variant="secondary" onClick={onBack} className="mb-6"><ArrowLeft size={16}/> Kembali ke Bab</Button>
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar / Top Navigation for Items */}
        <div className="w-full lg:w-1/4 flex-shrink-0">
           <Card className="p-0 overflow-hidden sticky top-24">
              <div className="bg-gray-50 p-4 border-b border-gray-100">
                 <h3 className="font-bold text-gray-900 mb-3 text-lg">Menu Belajar</h3>
                 <div className="flex gap-2">
                    <button onClick={() => setActiveTab('materi')} className={`flex-1 flex flex-col items-center justify-center py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'materi' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}><BookOpen size={18} className="mb-1"/> Materi</button>
                    <button onClick={() => setActiveTab('video')} className={`flex-1 flex flex-col items-center justify-center py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'video' ? 'bg-red-100 text-red-700' : 'text-gray-500 hover:bg-gray-100'}`}><MonitorPlay size={18} className="mb-1"/> Video</button>
                    <button onClick={() => setActiveTab('kuis')} className={`flex-1 flex flex-col items-center justify-center py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'kuis' ? 'bg-green-100 text-green-700' : 'text-gray-500 hover:bg-gray-100'}`}><Gamepad size={18} className="mb-1"/> Kuis</button>
                 </div>
              </div>
              <div className="p-3 space-y-1 max-h-[300px] lg:max-h-[calc(100vh-300px)] overflow-y-auto">
                 {items.length > 0 ? items.map((item: any) => (
                    <button 
                      key={item.id} 
                      onClick={() => setSelectedContentId(item.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3 ${selectedContentId === item.id ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${selectedContentId === item.id ? 'bg-white' : 'bg-gray-300'}`}></div>
                      <span className="line-clamp-2">{item.title}</span>
                    </button>
                 )) : (
                   <div className="text-center py-8 text-xs text-gray-400 italic">Belum ada konten di bagian ini.</div>
                 )}
              </div>
           </Card>
        </div>

        {/* Content Area */}
        <div className="w-full lg:w-3/4">
           <Card className="min-h-[500px] p-6 md:p-10">
              {renderContent()}
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
                <div className="sm:col-span-2">
                    <Input label="Judul Video" value={v.title} onChange={e => updateVideo(v.id, { title: e.target.value })} className="mb-0" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipe</label>
                    <select className="w-full p-3 rounded-xl border border-gray-300 bg-white" value={v.type || 'link'} onChange={e => updateVideo(v.id, { type: e.target.value as any })}>
                        <option value="link">URL Youtube/Link</option>
                        <option value="html">HTML Embed Code</option>
                    </select>
                </div>
            </div>
            {v.type === 'html' ? (
                <TextArea label="Kode Embed HTML" value={v.content || ''} onChange={e => updateVideo(v.id, { content: e.target.value })} className="font-mono text-xs h-24" placeholder="<iframe...>" />
            ) : (
                <Input label="URL Video" value={v.url || ''} onChange={e => updateVideo(v.id, { url: e.target.value })} placeholder="https://youtube.com/..." />
            )}
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
                <div className="sm:col-span-2">
                    <Input label="Judul Kuis" value={q.title} onChange={e => updateQuiz(q.id, { title: e.target.value })} className="mb-0" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipe</label>
                    <select className="w-full p-3 rounded-xl border border-gray-300 bg-white" value={q.type || 'link'} onChange={e => updateQuiz(q.id, { type: e.target.value as any })}>
                        <option value="link">URL Link</option>
                        <option value="html">HTML Embed Code</option>
                    </select>
                </div>
            </div>
            {q.type === 'html' ? (
                <TextArea label="Kode Embed HTML" value={q.content || ''} onChange={e => updateQuiz(q.id, { content: e.target.value })} className="font-mono text-xs h-24" placeholder="<iframe...>" />
            ) : (
                <Input label="URL Kuis" value={q.url || ''} onChange={e => updateQuiz(q.id, { url: e.target.value })} placeholder="https://forms.gle/..." />
            )}
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
  onDeleteClassResource: (grade: string, type: 'exam', itemId: string, semId: string) => void;
  onLogout: () => void;
}> = ({ classes, schoolProfile, students, extras, onUpdateChapterByGrade, onUpdateClassResourceByGrade, onUpdateClass, onUpdateProfile, onSaveStudent, onDeleteStudent, onSaveExtra, onDeleteExtra, onDeleteClassResource, onLogout }) => {
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
        onUpdateClassResourceByGrade(selGrade, 'exam', item, semesterId);
    }
    setResourceEdit(null);
    alert('Tersimpan!');
  };

  const currentClass = classes.find(c => c.id === selClassId);
  const templateClass = classes.find(c => c.gradeLevel === selGrade);
  const currentSemester = templateClass?.semesters.find(s => s.id === selSemId);
  
  // Helpers for Bank Soal UI
  const semGanjil = templateClass?.semesters.find(s => s.id === 'ganjil');
  const semGenap = templateClass?.semesters.find(s => s.id === 'genap');

  const adminTabs = [
    { id: 'profile', label: 'Profil Sekolah', icon: <School size={18}/> },
    { id: 'personalization', label: 'Personalisasi', icon: <Quote size={18}/> },
    { id: 'content', label: 'Manajemen Materi', icon: <BookOpen size={18}/> },
    { id: 'schedule', label: 'Jadwal, Nilai & Soal', icon: <CalendarRange size={18}/> },
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
                      <SectionTitle title="Jadwal, Nilai & Soal" subtitle="Kelola jadwal pelajaran, rekap nilai, dan bank soal per semester." />
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
                                  <div className="space-y-6">
                                      <div>
                                        <h3 className="font-bold text-gray-800 mb-3">2. Jadwal & Nilai</h3>
                                        <div className="space-y-3">
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
                                      </div>

                                      <div className="border-t pt-4">
                                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><FileQuestion size={18} className="text-blue-500"/> Bank Soal (STS & SAS)</h3>
                                        <div className="space-y-4">
                                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                                <div className="flex justify-between items-center mb-3">
                                                    <span className="font-bold text-gray-700 text-sm">Semester Ganjil</span>
                                                    <button onClick={() => setResourceEdit({ type: 'exam', item: { id: `exam-${Date.now()}`, title: 'Soal Baru', type: 'link', url: '' }, parentId: currentClass.id, semesterId: 'ganjil' })} className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200 font-bold border border-blue-200 shadow-sm">+ Tambah</button>
                                                </div>
                                                <div className="space-y-2">
                                                    {semGanjil?.exams?.map(ex => (
                                                        <div key={ex.id} className={`flex justify-between items-center bg-white p-3 rounded-lg border transition-all ${resourceEdit?.item.id === ex.id ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200 hover:border-blue-300'}`}>
                                                            <div className="flex items-center gap-2 overflow-hidden">
                                                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${ex.type === 'link' ? 'bg-orange-400' : 'bg-purple-400'}`}></div>
                                                                <span className="text-sm font-medium text-gray-700 truncate">{ex.title}</span>
                                                            </div>
                                                            <div className="flex gap-1 flex-shrink-0">
                                                                <button onClick={() => setResourceEdit({ type: 'exam', item: ex, parentId: currentClass.id, semesterId: 'ganjil' })} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition-colors"><Edit3 size={14}/></button>
                                                                <button onClick={() => onDeleteClassResource(selGrade, 'exam', ex.id, 'ganjil')} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"><Trash2 size={14}/></button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {(!semGanjil?.exams || semGanjil.exams.length === 0) && <p className="text-xs text-gray-400 italic text-center py-2">Belum ada soal.</p>}
                                                </div>
                                            </div>

                                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                                <div className="flex justify-between items-center mb-3">
                                                    <span className="font-bold text-gray-700 text-sm">Semester Genap</span>
                                                    <button onClick={() => setResourceEdit({ type: 'exam', item: { id: `exam-${Date.now()}`, title: 'Soal Baru', type: 'link', url: '' }, parentId: currentClass.id, semesterId: 'genap' })} className="text-xs bg-emerald-100 text-emerald-600 px-2 py-1 rounded hover:bg-emerald-200 font-bold border border-emerald-200 shadow-sm">+ Tambah</button>
                                                </div>
                                                <div className="space-y-2">
                                                    {semGenap?.exams?.map(ex => (
                                                        <div key={ex.id} className={`flex justify-between items-center bg-white p-3 rounded-lg border transition-all ${resourceEdit?.item.id === ex.id ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-gray-200 hover:border-emerald-300'}`}>
                                                            <div className="flex items-center gap-2 overflow-hidden">
                                                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${ex.type === 'link' ? 'bg-orange-400' : 'bg-purple-400'}`}></div>
                                                                <span className="text-sm font-medium text-gray-700 truncate">{ex.title}</span>
                                                            </div>
                                                            <div className="flex gap-1 flex-shrink-0">
                                                                <button onClick={() => setResourceEdit({ type: 'exam', item: ex, parentId: currentClass.id, semesterId: 'genap' })} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition-colors"><Edit3 size={14}/></button>
                                                                <button onClick={() => onDeleteClassResource(selGrade, 'exam', ex.id, 'genap')} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"><Trash2 size={14}/></button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {(!semGenap?.exams || semGenap.exams.length === 0) && <p className="text-xs text-gray-400 italic text-center py-2">Belum ada soal.</p>}
                                                </div>
                                            </div>
                                        </div>
                                      </div>
                                  </div>
                              )}
                          </div>
                          <div className="bg-gray-100/50 p-6 rounded-3xl border border-gray-100 min-h-[400px]">
                              {resourceEdit ? (
                                  <div className="animate-fade-in-up">
                                      <div className="flex justify-between items-center mb-6">
                                          <div>
                                              <h3 className="font-bold text-gray-800 text-lg">{resourceEdit.item.title}</h3>
                                              <div className="flex gap-2 mt-1">
                                                  <Badge color="blue">{resourceEdit.type.toUpperCase()}</Badge>
                                                  {resourceEdit.semesterId && <Badge color={resourceEdit.semesterId === 'ganjil' ? 'blue' : 'emerald'}>{resourceEdit.semesterId.toUpperCase()}</Badge>}
                                              </div>
                                          </div>
                                          <Button onClick={handleResourceSave} className="py-2 px-6 rounded-xl shadow-none text-sm"><Save size={16}/> Simpan</Button>
                                      </div>
                                      <div className="flex gap-2 mb-6 bg-white p-1.5 rounded-xl border border-gray-200">
                                          <button onClick={() => setResourceEdit({...resourceEdit, item: {...resourceEdit.item, type: 'link'}})} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-bold text-xs transition-all ${resourceEdit.item.type === 'link' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}>
                                              <LinkIcon size={14}/> Tautan
                                          </button>
                                          <button onClick={() => setResourceEdit({...resourceEdit, item: {...resourceEdit.item, type: 'html'}})} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-bold text-xs transition-all ${resourceEdit.item.type === 'html' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}>
                                              <Code size={14}/> HTML
                                          </button>
                                      </div>
                                      <div className="space-y-4">
                                          <Input label="Judul" value={resourceEdit.item.title} onChange={e => setResourceEdit({...resourceEdit, item: {...resourceEdit.item, title: e.target.value}})} className="mb-0"/>
                                          {resourceEdit.item.type === 'link' ? 
                                              <Input label="URL" value={resourceEdit.item.url || ''} onChange={e => setResourceEdit({...resourceEdit, item: {...resourceEdit.item, url: e.target.value}})} placeholder="https://..." className="mb-0"/> : 
                                              <TextArea label="HTML Content" value={resourceEdit.item.content || ''} onChange={e => setResourceEdit({...resourceEdit, item: {...resourceEdit.item, content: e.target.value}})} className="font-mono text-xs h-40"/>
                                          }
                                      </div>
                                  </div>
                              ) : (
                                  <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4 min-h-[300px]">
                                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center"><Edit3 size={32}/></div>
                                      <p className="text-center text-sm max-w-xs">Pilih salah satu item di menu sebelah kiri untuk mulai mengedit.</p>
                                  </div>
                              )}
                          </div>
                      </div>
                  </Card>
               )}
               
               {tab === 'content' && (
                  <Card>
                      <SectionTitle title="Manajemen Materi" subtitle="Edit konten per bab untuk setiap jenjang kelas." />
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                          <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Jenjang</label>
                              <select className="w-full p-3 rounded-xl border border-gray-200 bg-white font-semibold" value={selGrade} onChange={e => setSelGrade(e.target.value)}>
                                  <option value="7">Kelas 7</option>
                                  <option value="8">Kelas 8</option>
                                  <option value="9">Kelas 9</option>
                              </select>
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Semester</label>
                              <select className="w-full p-3 rounded-xl border border-gray-200 bg-white font-semibold" value={selSemId} onChange={e => setSelSemId(e.target.value)}>
                                  <option value="ganjil">Ganjil</option>
                                  <option value="genap">Genap</option>
                              </select>
                          </div>
                          <div className="md:col-span-2">
                              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Pilih Bab</label>
                              <select className="w-full p-3 rounded-xl border border-gray-200 bg-white font-semibold" value={selChapId} onChange={e => setSelChapId(e.target.value)}>
                                  {currentSemester?.chapters.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                              </select>
                          </div>
                      </div>
                      <div className="border-t pt-6">
                          {chapForm ? <AdminContentEditor chapter={chapForm} onSave={handleChapterUpdate} /> : <p className="text-center py-10 text-gray-400">Loading materi...</p>}
                      </div>
                  </Card>
               )}

               {tab === 'extras' && (
                  <Card>
                      <SectionTitle title="Pojok Literasi" subtitle="Kelola konten tambahan seperti doa, kisah islami, dll." />
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                           <div className="bg-purple-50/50 p-6 rounded-2xl border border-purple-100">
                              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider"><Plus size={16}/> {editingExtraId ? 'Edit Konten' : 'Tambah Konten Baru'}</h3>
                              <Input placeholder="Judul Konten" value={extraForm.title || ''} onChange={e => setExtraForm({...extraForm, title: e.target.value})} className="mb-2 rounded-xl bg-white"/>
                              <div className="grid grid-cols-2 gap-2 mb-2">
                                  <select className="p-3 rounded-xl border border-gray-200 bg-white text-sm" value={extraForm.category} onChange={e => setExtraForm({...extraForm, category: e.target.value as any})}>
                                      {categories.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                                  </select>
                                  <select className="p-3 rounded-xl border border-gray-200 bg-white text-sm" value={extraForm.type} onChange={e => setExtraForm({...extraForm, type: e.target.value as any})}>
                                      <option value="link">Tautan / Video</option>
                                      <option value="html">Teks / HTML</option>
                                  </select>
                              </div>
                              {extraForm.type === 'link' ? 
                                  <Input placeholder="URL Link / Youtube" value={extraForm.url || ''} onChange={e => setExtraForm({...extraForm, url: e.target.value})} className="mb-2 rounded-xl bg-white"/> :
                                  <TextArea placeholder="Isi Konten HTML" value={extraForm.content || ''} onChange={e => setExtraForm({...extraForm, content: e.target.value})} className="mb-2 rounded-xl bg-white h-32 font-mono text-xs"/>
                              }
                              <Button onClick={handleExtraSave} className="w-full text-sm py-3 rounded-xl shadow-none bg-purple-600 hover:bg-purple-700 shadow-purple-500/20">{editingExtraId ? 'Simpan Perubahan' : 'Tambahkan Konten'}</Button>
                              {editingExtraId && <button onClick={() => {setEditingExtraId(null); setExtraForm({ category: 'doa', type: 'link', title: '', url: '', content: '' })}} className="text-xs text-red-500 mt-2 text-center w-full block font-medium">Batal</button>}
                           </div>
                           <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                               {extras.map(ex => (
                                   <div key={ex.id} className="p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-all group flex justify-between items-start">
                                       <div>
                                           <div className="flex items-center gap-2 mb-1">
                                               <Badge color="purple">{ex.category}</Badge>
                                               <span className="text-xs text-gray-400 uppercase font-bold">{ex.type}</span>
                                           </div>
                                           <h4 className="font-bold text-gray-800">{ex.title}</h4>
                                           <p className="text-xs text-gray-400 truncate w-48">{ex.type === 'link' ? ex.url : 'HTML Content'}</p>
                                       </div>
                                       <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                           <button onClick={() => handleExtraEdit(ex)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit3 size={16}/></button>
                                           <button onClick={() => handleExtraDelete(ex.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                                       </div>
                                   </div>
                               ))}
                           </div>
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
  
  // Data State
  const [classes, setClasses] = useState<ClassData[]>(CLASSES_DATA);
  const [students, setStudents] = useState<Student[]>(DEFAULT_STUDENTS);
  const [extras, setExtras] = useState<ExtraContent[]>(DEFAULT_EXTRAS);
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(DEFAULT_SCHOOL_PROFILE);

  // Nav State
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ExtraCategory | null>(null);
  const [currentUser, setCurrentUser] = useState<Student | null>(null);
  
  // Extra Item Accordion State
  const [expandedExtraId, setExpandedExtraId] = useState<string | null>(null);

  // Sync with DB (Fetch Data on Load)
  useEffect(() => {
    if (db) {
      const sync = async () => {
         try {
           // 1. Fetch Profile
           const profileSnap = await getDoc(doc(db, 'settings', 'schoolProfile'));
           if (profileSnap.exists()) setSchoolProfile(profileSnap.data() as SchoolProfile);
           
           // 2. Fetch Classes
           const cSnap = await getDocs(collection(db, 'classes'));
           if (!cSnap.empty) {
             const loadedClasses = cSnap.docs.map(d => d.data() as ClassData);
             setClasses(loadedClasses.sort((a,b) => a.id.localeCompare(b.id)));
           }

           // 3. Fetch Students
           const sSnap = await getDocs(collection(db, 'students'));
           if (!sSnap.empty) {
             setStudents(sSnap.docs.map(d => d.data() as Student));
           }

           // 4. Fetch Extras
           const eSnap = await getDocs(collection(db, 'extras'));
           if (!eSnap.empty) {
             setExtras(eSnap.docs.map(d => d.data() as ExtraContent));
           }

         } catch(e) { console.error("Error fetching data:", e); }
      };
      sync();
    }
  }, []);

  // Handlers for Persistence

  const handleUpdateProfile = async (p: SchoolProfile) => {
    setSchoolProfile(p);
    if(db) await setDoc(doc(db, 'settings', 'schoolProfile'), p);
  };

  const handleUpdateClass = async (c: ClassData) => {
    setClasses(prev => prev.map(p => p.id === c.id ? c : p));
    if(db) await setDoc(doc(db, 'classes', c.id), c);
  };

  const handleSaveStudent = async (s: Student) => {
    setStudents(prev => { 
        const idx = prev.findIndex(p => p.id === s.id); 
        if (idx > -1) { const n = [...prev]; n[idx] = s; return n; } 
        return [...prev, s]; 
    });
    if(db) await setDoc(doc(db, 'students', s.id), s);
  };

  const handleDeleteStudent = async (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
    if(db) await deleteDoc(doc(db, 'students', id));
  };

  const handleSaveExtra = async (e: ExtraContent) => {
    setExtras(prev => { 
        const idx = prev.findIndex(p => p.id === e.id); 
        if (idx > -1) { const n = [...prev]; n[idx] = e; return n; } 
        return [...prev, e]; 
    });
    if(db) await setDoc(doc(db, 'extras', e.id), e);
  };

  const handleDeleteExtra = async (id: string) => {
    setExtras(prev => prev.filter(e => e.id !== id));
    if(db) await deleteDoc(doc(db, 'extras', id));
  };

  // Complex Updates (Batch)

  const handleUpdateChapter = async (grade: string, semId: string, chapId: string, data: Partial<Chapter>) => {
    const newClasses = classes.map(c => {
      if (c.gradeLevel === grade) {
        return {
          ...c,
          semesters: c.semesters.map(s => {
            if (s.id === semId) {
              return {
                ...s,
                chapters: s.chapters.map(ch => ch.id === chapId ? { ...ch, ...data } : ch)
              };
            }
            return s;
          })
        };
      }
      return c;
    });

    setClasses(newClasses);

    if (db) {
      const batch = writeBatch(db);
      const classesToUpdate = newClasses.filter(c => c.gradeLevel === grade);
      classesToUpdate.forEach(c => {
        const ref = doc(db, 'classes', c.id);
        batch.set(ref, c);
      });
      await batch.commit();
    }
  };

  const handleUpdateResource = async (grade: string, type: 'exam' | 'grades' | 'schedule', item: ResourceItem, semId?: string) => {
      const newClasses = classes.map(c => {
          if (c.gradeLevel === grade) {
              if (type === 'schedule') return { ...c, schedule: item };
              if (type === 'grades' || type === 'exam') {
                  return {
                      ...c,
                      semesters: c.semesters.map(s => {
                          if (s.id === semId) {
                              if (type === 'grades') return { ...s, grades: item };
                              if (type === 'exam') {
                                  const exams = s.exams ? [...s.exams] : [];
                                  const idx = exams.findIndex(e => e.id === item.id);
                                  if (idx > -1) exams[idx] = item;
                                  else exams.push(item);
                                  return { ...s, exams };
                              }
                          }
                          return s;
                      })
                  };
              }
          }
          return c;
      });

      setClasses(newClasses);

      if (db) {
        const batch = writeBatch(db);
        const classesToUpdate = newClasses.filter(c => c.gradeLevel === grade);
        classesToUpdate.forEach(c => {
            const ref = doc(db, 'classes', c.id);
            batch.set(ref, c);
        });
        await batch.commit();
      }
  };

  const handleDeleteClassResource = async (grade: string, type: 'exam', itemId: string, semId: string) => {
      const newClasses = classes.map(cls => {
          if (cls.gradeLevel === grade) {
              return {
                  ...cls,
                  semesters: cls.semesters.map(sem => {
                      if (sem.id === semId) {
                          return {
                              ...sem,
                              exams: sem.exams?.filter(e => e.id !== itemId) || []
                          };
                      }
                      return sem;
                  })
              };
          }
          return cls;
      });

      setClasses(newClasses);

      if (db) {
        const batch = writeBatch(db);
        const classesToUpdate = newClasses.filter(c => c.gradeLevel === grade);
        classesToUpdate.forEach(c => {
            const ref = doc(db, 'classes', c.id);
            batch.set(ref, c);
        });
        await batch.commit();
      }
  };

  const renderContent = () => {
    switch (view) {
      case ViewState.LANDING:
        return <LandingView 
          onSelectClass={(id) => { setSelectedClassId(id); setView(ViewState.STUDENT_LOGIN); }}
          onAdminLogin={() => setView(ViewState.ADMIN_LOGIN)}
          onSelectCategory={(cat) => { setSelectedCategory(cat); setView(ViewState.EXTRA_CATEGORY_LIST); }}
          classes={classes}
          extras={extras}
          profile={schoolProfile}
        />;
      case ViewState.STUDENT_LOGIN:
        return <StudentLoginView 
           initialClassId={selectedClassId}
           classes={classes}
           students={students}
           onLoginSuccess={(s, cId) => { 
             setCurrentUser(s); 
             setSelectedClassId(cId); 
             setView(ViewState.CLASS_DETAIL);
             window.scrollTo(0, 0);
           }}
           onBack={() => setView(ViewState.LANDING)}
        />;
      case ViewState.CLASS_DETAIL:
        const cls = classes.find(c => c.id === selectedClassId);
        return cls ? <ClassDetailView 
           classData={cls}
           student={currentUser}
           onBack={() => { setCurrentUser(null); setView(ViewState.STUDENT_LOGIN); }}
           onSelectChapter={(id) => { setSelectedChapterId(id); setView(ViewState.CHAPTER_CONTENT); }}
        /> : <div>Loading...</div>;
      case ViewState.CHAPTER_CONTENT:
        const cls2 = classes.find(c => c.id === selectedClassId);
        let chapter = null;
        cls2?.semesters.forEach(s => s.chapters.forEach(c => { if (c.id === selectedChapterId) chapter = c; }));
        return chapter ? <ChapterContentView chapter={chapter} onBack={() => setView(ViewState.CLASS_DETAIL)} /> : <div>Loading...</div>;
      case ViewState.ADMIN_LOGIN:
        return <AdminLoginView onLogin={() => setView(ViewState.ADMIN_DASHBOARD)} onBack={() => setView(ViewState.LANDING)} />;
      case ViewState.ADMIN_DASHBOARD:
        return <AdminDashboardView 
           classes={classes}
           schoolProfile={schoolProfile}
           students={students}
           extras={extras}
           onUpdateChapterByGrade={handleUpdateChapter}
           onUpdateClassResourceByGrade={handleUpdateResource}
           onUpdateClass={handleUpdateClass}
           onUpdateProfile={handleUpdateProfile}
           onSaveStudent={handleSaveStudent}
           onDeleteStudent={handleDeleteStudent}
           onSaveExtra={handleSaveExtra}
           onDeleteExtra={handleDeleteExtra}
           onDeleteClassResource={handleDeleteClassResource}
           onLogout={() => setView(ViewState.LANDING)}
        />;
      case ViewState.EXTRA_CATEGORY_LIST:
        const filteredExtras = extras.filter(e => e.category === selectedCategory);
        return (
           <div className="max-w-4xl mx-auto px-4 py-12">
              <Button variant="secondary" onClick={() => setView(ViewState.LANDING)} className="mb-8"><ArrowLeft size={16}/> Kembali</Button>
              <SectionTitle title={selectedCategory ? `Pojok ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}` : 'Pojok Literasi'} subtitle="Klik pada judul untuk melihat isi konten." />
              <div className="space-y-4">
                 {filteredExtras.map(ex => (
                    <Card key={ex.id} className="p-0 overflow-hidden transition-all duration-300">
                       <button 
                          onClick={() => setExpandedExtraId(expandedExtraId === ex.id ? null : ex.id)}
                          className={`w-full flex items-center justify-between p-6 text-left transition-colors ${expandedExtraId === ex.id ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'}`}
                       >
                          <div className="flex items-center gap-4">
                             <div className={`p-2 rounded-lg ${expandedExtraId === ex.id ? 'bg-blue-200 text-blue-800' : 'bg-gray-100 text-gray-500'}`}>
                                {ex.type === 'link' ? (ex.url?.includes('youtu') ? <Youtube size={20}/> : <LinkIcon size={20}/>) : <FileText size={20}/>}
                             </div>
                             <span className={`font-bold text-lg ${expandedExtraId === ex.id ? 'text-blue-900' : 'text-gray-800'}`}>{ex.title}</span>
                          </div>
                          <ChevronDown size={20} className={`text-gray-400 transition-transform duration-300 ${expandedExtraId === ex.id ? 'rotate-180' : ''}`} />
                       </button>
                       <AnimatePresence>
                          {expandedExtraId === ex.id && (
                             <motion.div 
                               initial={{ height: 0, opacity: 0 }}
                               animate={{ height: 'auto', opacity: 1 }}
                               exit={{ height: 0, opacity: 0 }}
                               className="border-t border-gray-100 bg-white"
                             >
                                <div className="p-6">
                                   {ex.type === 'link' ? (
                                      ex.url?.includes('youtu') ? 
                                      <div className="aspect-w-16 aspect-h-9 rounded-xl overflow-hidden shadow-lg"><iframe src={`https://www.youtube.com/embed/${getYoutubeId(ex.url)}`} className="w-full h-[300px] md:h-[450px]" allowFullScreen></iframe></div> : 
                                      <a href={ex.url} target="_blank" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"><LinkIcon size={18}/> Buka Tautan Eksternal</a>
                                   ) : (
                                      <RichHtmlContent content={ex.content || ''} iframeHeight="h-auto min-h-[300px]"/>
                                   )}
                                </div>
                             </motion.div>
                          )}
                       </AnimatePresence>
                    </Card>
                 ))}
                 {filteredExtras.length === 0 && <div className="text-center py-12 text-gray-400 italic bg-white rounded-3xl border border-dashed border-gray-200">Belum ada konten untuk kategori ini.</div>}
              </div>
           </div>
        );
      default: return <div>404</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
       {view !== ViewState.ADMIN_DASHBOARD && (
          <>
            <Navbar goHome={() => setView(ViewState.LANDING)} goAdmin={view === ViewState.LANDING ? () => setView(ViewState.ADMIN_LOGIN) : undefined} schoolName={schoolProfile.name} />
            <AnimatePresence mode="wait">
               <motion.div key={view} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-20">
                  {renderContent()}
               </motion.div>
            </AnimatePresence>
            <Footer onAdminClick={() => setView(ViewState.ADMIN_LOGIN)} profile={schoolProfile} />
          </>
       )}
       {view === ViewState.ADMIN_DASHBOARD && renderContent()}
    </div>
  );
};

export default App;