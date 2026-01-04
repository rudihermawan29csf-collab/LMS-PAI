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
  User
} from 'lucide-react';

// Import Firebase (db will be null if config not set)
import { db, doc, setDoc, getDoc, collection, getDocs } from './firebase';

import { CLASSES_DATA, FEATURES, DEFAULT_SCHOOL_PROFILE, DEFAULT_STUDENTS, DEFAULT_EXTRAS } from './constants';
import { ViewState, ClassData, Chapter, SchoolProfile, Student, ExtraContent, ExtraCategory, ResourceItem, ContentSection } from './types';
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

  // Fallback times (WIB approx) if API fails
  const fallbackTimes = {
    Fajr: "04:15",
    Dhuhr: "11:40",
    Asr: "15:00",
    Maghrib: "17:50",
    Isha: "19:00"
  };

  useEffect(() => {
    // Clock
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    // Location & Prayer Times
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Get Prayer Times from Aladhan API
          const date = new Date();
          const response = await fetch(`https://api.aladhan.com/v1/timings/${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}?latitude=${latitude}&longitude=${longitude}&method=20`); 
          const data = await response.json();
          
          if (data.code === 200) {
            setTimes(data.data.timings);
            setLocationName('Lokasi Anda');
          } else {
             // Fallback
             setTimes(fallbackTimes);
             setLocationName('Waktu Jakarta (Offline)');
          }
        } catch (error) {
          console.error("Error fetching prayer times:", error);
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

      // Find the next prayer
      for (const p of prayerList) {
        const [h, m] = p.time.split(':').map(Number);
        const pMinutes = h * 60 + m;
        if (pMinutes > currentMinutes) {
          targetPrayer = p.name;
          targetTime = p.time;
          break;
        }
      }

      // If no prayer found, it means next is Subuh tomorrow
      if (!targetPrayer) {
        targetPrayer = 'Subuh';
        targetTime = times.Fajr;
      }

      // Calculate countdown
      const [targetH, targetM] = targetTime.split(':').map(Number);
      const targetDate = new Date();
      targetDate.setHours(targetH, targetM, 0);
      
      // If target is earlier than now, it implies tomorrow
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

const RobotGreeting = () => (
  <div className="max-w-4xl mx-auto mb-10 flex flex-col md:flex-row items-center gap-6 animate-fade-in-up">
    <div className="relative group cursor-pointer">
       {/* Peci (Hat) */}
       <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-8 bg-gray-900 rounded-t-lg z-20 shadow-md"></div>
       {/* Robot Body */}
       <div className="w-24 h-24 bg-gradient-to-b from-gray-50 to-white rounded-2xl border-2 border-gray-200 shadow-xl flex items-center justify-center relative z-10 animate-bounce-slow">
          {/* Eyes */}
          <div className="flex gap-4">
             <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
             <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse delay-75"></div>
          </div>
          {/* Mouth */}
          <div className="absolute bottom-6 w-8 h-1.5 bg-gray-300 rounded-full"></div>
       </div>
    </div>
    <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl rounded-tl-none border border-white/50 shadow-lg flex-1 transform transition-transform hover:scale-[1.01]">
       <p className="text-gray-700 font-medium leading-relaxed italic text-lg">
         "Assalamu’alaikum Warahmatullahi Wabarakatuh. Selamat datang di LMS Pendidikan Agama Islam. Mari belajar memahami Islam secara utuh, menumbuhkan iman, memperkuat akhlak, dan mengamalkan nilai-nilai kebaikan dalam kehidupan sehari-hari."
       </p>
    </div>
  </div>
);

// macOS-like Traffic Lights
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
          <div>
            <h1 className="font-bold text-gray-900 text-lg leading-tight tracking-tight">{schoolName}</h1>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6">
          {/* Admin link moved to hero/login area as per request, but can keep small here too */}
        </div>

        <button className="md:hidden text-gray-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
           {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 backdrop-blur-xl border-b border-gray-200 overflow-hidden"
          >
             <div className="px-4 py-4 space-y-3 flex flex-col">
                <button onClick={goHome} className="block w-full text-left py-2 text-gray-600 text-sm font-medium">Beranda</button>
                {goAdmin && (
                   <button onClick={goAdmin} className="block w-full text-left py-2 text-gray-600 text-sm mt-2 border-t border-gray-100 pt-4 flex items-center gap-2">
                     <Settings size={16} />
                     Login Guru
                   </button>
                )}
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Footer: React.FC<{ 
  onAdminClick: () => void,
  profile: SchoolProfile
}> = ({ onAdminClick, profile }) => (
  <footer className="bg-white/30 backdrop-blur-xl border-t border-white/60 mt-20 pb-10 pt-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
           <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
               <Moon size={16} />
            </div>
            <span className="font-bold text-gray-800">{profile.name}</span>
           </div>
           <p className="text-sm text-gray-500 leading-relaxed mb-4">
             {profile.description}
           </p>
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
             <a 
               href={`https://wa.me/${profile.phoneNumber}`} 
               target="_blank" 
               rel="noreferrer"
               className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl transition-colors shadow-sm mt-1"
             >
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
}> = ({ onSelectClass, onAdminLogin, onSelectCategory, classes }) => {
  
  const [expandedGrade, setExpandedGrade] = useState<string | null>(null);

  // Group classes by grade
  const groupedClasses = classes.reduce((acc, curr) => {
    const grade = curr.gradeLevel;
    if (!acc[grade]) acc[grade] = [];
    acc[grade].push(curr);
    return acc;
  }, {} as Record<string, ClassData[]>);

  const toggleGrade = (grade: string) => {
    setExpandedGrade(expandedGrade === grade ? null : grade);
  };

  const scrollToIntro = () => {
    document.getElementById('login-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="space-y-24 pb-12"
    >
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        {/* Abstract Background Blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
          <div className="absolute top-20 left-10 w-[500px] h-[500px] bg-blue-300/40 rounded-full mix-blend-multiply filter blur-[80px] animate-blob"></div>
          <div className="absolute top-20 right-10 w-[500px] h-[500px] bg-purple-300/40 rounded-full mix-blend-multiply filter blur-[80px] animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-[500px] h-[500px] bg-pink-200/40 rounded-full mix-blend-multiply filter blur-[80px] animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            {/* Widget Area */}
            <RobotGreeting />
            <PrayerTimesWidget />

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
              <Button onClick={scrollToIntro} className="w-full sm:w-auto text-lg px-8 py-4 shadow-blue-500/25 shadow-2xl hover:scale-105 transform transition-all duration-300 rounded-2xl flex items-center gap-3">
                <User size={20}/> Login Siswa
              </Button>
              <Button onClick={onAdminLogin} variant="secondary" className="w-full sm:w-auto text-lg px-8 py-4 shadow-2xl hover:scale-105 transform transition-all duration-300 rounded-2xl flex items-center gap-3">
                <UserCog size={20}/> Login Guru
              </Button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-24 relative p-8 md:p-10 bg-white/40 backdrop-blur-xl rounded-[2rem] border border-white/50 shadow-2xl inline-block max-w-2xl mx-auto"
          >
            <TrafficLights />
            <div className="mt-4">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur p-3 rounded-full border border-white shadow-sm">
                   <Moon className="text-blue-500" size={24} fill="currentColor" />
                </div>
                <p className="font-serif italic text-2xl text-gray-700 leading-relaxed mb-6 mt-4">
                  "Jadilah seperti bunga yang memberikan keharuman
                  bahkan kepada tangan yang telah merusaknya."
                </p>
                <div className="w-16 h-1.5 bg-gradient-to-r from-blue-400 to-green-400 rounded-full mx-auto mb-3"></div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">– Ali bin Abi Thalib</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Class Selection Section */}
      <section id="login-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle 
          title="Login Siswa: Pilih Kelasmu" 
          subtitle="Klik pada kelas yang sesuai untuk masuk ke halaman absensi dan materi." 
          center 
        />
        
        <div className="max-w-3xl mx-auto space-y-4">
          {['7', '8', '9'].map((grade) => (
            <div key={grade} className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
              <button 
                onClick={() => toggleGrade(grade)}
                className="w-full flex items-center justify-between p-5 bg-white text-left transition-colors hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                   <div className={`p-2 rounded-xl ${
                     grade === '7' ? 'bg-blue-100 text-blue-600' : 
                     grade === '8' ? 'bg-emerald-100 text-emerald-600' : 
                     'bg-amber-100 text-amber-600'
                   }`}>
                     {grade === '7' && <BookOpen size={20}/>}
                     {grade === '8' && <Layout size={20}/>}
                     {grade === '9' && <Brain size={20}/>}
                   </div>
                   <span className="text-lg font-bold text-gray-800">
                     Kelas {grade === '7' ? 'VII (Tujuh)' : grade === '8' ? 'VIII (Delapan)' : 'IX (Sembilan)'}
                   </span>
                </div>
                <ChevronDown 
                  size={20} 
                  className={`text-gray-400 transition-transform duration-300 ${expandedGrade === grade ? 'rotate-180' : ''}`}
                />
              </button>
              
              <AnimatePresence>
                {expandedGrade === grade && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-gray-50 border-t border-gray-100"
                  >
                     <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {groupedClasses[grade]?.map(cls => (
                           <button 
                             key={cls.id}
                             onClick={() => onSelectClass(cls.id)}
                             className={`py-3 px-4 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 transition-all shadow-sm hover:text-white ${
                                 grade === '7' ? 'hover:bg-blue-600 hover:border-blue-600' :
                                 grade === '8' ? 'hover:bg-emerald-600 hover:border-emerald-600' :
                                 'hover:bg-amber-500 hover:border-amber-500'
                             }`}
                           >
                              {cls.name.replace('Kelas ', '')}
                           </button>
                        ))}
                     </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* Extra Content Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <SectionTitle 
           title="Pojok Literasi & Ibadah" 
           subtitle="Perkaya hati dan pikiran dengan doa dan kisah inspiratif." 
           center 
         />
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
              <Card 
                key={cat.id}
                onClick={() => onSelectCategory(cat.id as ExtraCategory)}
                className={`bg-gradient-to-br from-${cat.color}-50 to-white border-${cat.color}-100 cursor-pointer hover:shadow-lg transition-all group`}
              >
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className={`w-10 h-10 rounded-xl bg-${cat.color}-100 flex items-center justify-center`}>
                          {cat.icon}
                       </div>
                       <h3 className={`text-lg font-bold text-${cat.color}-800`}>{cat.label}</h3>
                    </div>
                    <div className={`w-8 h-8 rounded-full bg-white border border-${cat.color}-100 flex items-center justify-center group-hover:bg-${cat.color}-500 group-hover:text-white transition-all`}>
                       <ChevronRight size={16}/>
                    </div>
                 </div>
              </Card>
            ))}
         </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionTitle 
              title="Keunggulan LMS" 
              subtitle="Teknologi untuk mendukung pembelajaran agama yang efektif."
              center 
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
               {FEATURES.map((feature, idx) => (
                 <div key={idx} className="p-8 rounded-[2rem] bg-white/40 backdrop-blur-xl border border-white/50 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="w-14 h-14 bg-white/60 rounded-2xl flex items-center justify-center text-blue-600 mb-6 shadow-inner relative z-10">
                       {feature.icon === 'library' && <Library size={26}/>}
                       {feature.icon === 'gamepad' && <Gamepad size={26}/>}
                       {feature.icon === 'brain' && <Brain size={26}/>}
                       {feature.icon === 'moon' && <Moon size={26}/>}
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-3 relative z-10">{feature.title}</h4>
                    <p className="text-gray-500 text-sm leading-relaxed relative z-10">{feature.desc}</p>
                 </div>
               ))}
            </div>
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

  // If initialClassId is provided, we skip the class selection step and go straight to name search
  useEffect(() => {
      if (initialClassId) setSelectedClassId(initialClassId);
  }, [initialClassId]);

  // Filter students for selected class
  const classStudents = selectedClassId 
    ? students.filter(s => s.classId === selectedClassId) 
    : [];
    
  const selectedClassName = classes.find(c => c.id === selectedClassId)?.name || 'Kelas';

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-4xl mx-auto px-4 py-12">
      <Button variant="secondary" onClick={onBack} className="mb-8"><ArrowLeft size={18}/> Kembali ke Menu Utama</Button>
      <Card className="p-8 md:p-12">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
             <Users size={32} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Login {selectedClassName}</h2>
          <p className="text-gray-500 mt-2">Silakan pilih namamu dari daftar di bawah ini.</p>
        </div>

        {/* Step 2: Student Selection (Only if class is selected) */}
        <AnimatePresence>
            {selectedClassId ? (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t pt-8"
                >
                    <div className="w-full max-w-md mx-auto space-y-6">
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                            <select
                                className="w-full pl-12 pr-10 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-medium focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer text-lg"
                                value={selectedStudentId}
                                onChange={(e) => setSelectedStudentId(e.target.value)}
                            >
                                <option value="">Pilih Nama Siswa...</option>
                                {classStudents.map(s => (
                                    <option key={s.id} value={s.id}>
                                        {s.name} ({s.nis})
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20}/>
                        </div>

                        <Button
                            className="w-full py-4 text-lg shadow-blue-500/20"
                            disabled={!selectedStudentId}
                            onClick={() => {
                                const s = classStudents.find(st => st.id === selectedStudentId);
                                if(s) onLoginSuccess(s, selectedClassId);
                            }}
                        >
                            Masuk Kelas <ChevronRight size={20}/>
                        </Button>
                    </div>
                </motion.div>
            ) : (
               <div className="text-center text-red-500">Error: Kelas belum dipilih.</div>
            )}
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

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
         <div>
            <Button variant="secondary" onClick={onBack} className="mb-4 text-sm py-2 px-4"><ArrowLeft size={16}/> Ganti Akun / Kelas</Button>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
               <span className={`w-3 h-8 bg-${classData.color}-500 rounded-full`}></span>
               Materi {classData.name}
            </h1>
            <p className="text-gray-500 mt-1 ml-6">Selamat datang, <span className="font-bold text-gray-800">{student?.name}</span>!</p>
         </div>
      </div>

      <div className="flex gap-2 mb-8 bg-gray-100 p-1 rounded-xl w-fit">
         {['ganjil', 'genap'].map((sem) => (
            <button
              key={sem}
              onClick={() => setActiveSem(sem as any)}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeSem === sem ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
               Semester {sem === 'ganjil' ? 'Ganjil' : 'Genap'}
            </button>
         ))}
      </div>

      {/* Jadwal Pelajaran - Placed below semester buttons as requested */}
      {classData.schedule && (
         <Card className="mb-8 border-l-4 border-l-blue-500 bg-blue-50/50">
            <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2"><CalendarRange size={18}/> Jadwal Pelajaran {classData.name}</h3>
            {classData.schedule.type === 'html' ? (
                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: classData.schedule.content || '' }} />
            ) : (
                <a href={classData.schedule.url} target="_blank" className="text-blue-600 hover:underline">Lihat Jadwal</a>
            )}
         </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
         {classData.semesters.find(s => s.id === activeSem)?.chapters.map((chapter) => (
            <Card key={chapter.id} onClick={() => onSelectChapter(chapter.id)} className="h-full flex flex-col cursor-pointer group hover:border-blue-300">
               <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 bg-${classData.color}-50 text-${classData.color}-700 text-xs font-bold rounded-full uppercase tracking-wider`}>BAB {chapter.id.split('-')[1]}</span>
                  {chapter.progress === 100 && <CheckCircle size={20} className="text-green-500"/>}
               </div>
               <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{chapter.title.split(': ')[1] || chapter.title}</h3>
               <p className="text-gray-500 text-sm mb-6 flex-grow">{chapter.description}</p>
               
               <div className="mt-auto">
                 <div className="w-full bg-gray-100 h-1.5 rounded-full mb-2 overflow-hidden">
                    <div className="bg-green-500 h-full rounded-full" style={{ width: `${chapter.progress}%` }}></div>
                 </div>
                 <div className="flex justify-between text-xs text-gray-400 font-medium">
                    <span>Progress</span>
                    <span>{chapter.progress}%</span>
                 </div>
               </div>
            </Card>
         ))}
      </div>

      {/* Monitoring Nilai - Placed above Bank Soal */}
      {classData.grades && (
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100 mb-6">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-3 text-xl border-b border-green-200/50 pb-4">
               <div className="p-2 bg-green-100 rounded-lg text-green-600">
                  <GraduationCap size={24}/> 
               </div>
               Rekapitulasi Nilai
            </h3>
            {classData.grades.type === 'html' ? (
                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: classData.grades.content || '' }} />
            ) : (
                <a href={classData.grades.url} target="_blank" className="text-green-600 hover:underline flex items-center gap-2"><ExternalLink size={16}/> Lihat Rekap Nilai</a>
            )}
        </Card>
      )}

      {/* Bank Soal Section */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
        <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-3 text-xl border-b border-blue-200/50 pb-4">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <FileQuestion size={24}/> 
            </div>
            Bank Soal (STS & SAS)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {classData.semesters.find(s => s.id === activeSem)?.exams?.map((exam) => (
                <a 
                key={exam.id} 
                href={exam.url || '#'} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-4 p-4 bg-white border border-blue-100/50 rounded-xl hover:shadow-md hover:border-blue-400 transition-all group"
                >
                    <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                    <FileText size={20} />
                    </div>
                    <div>
                    <h4 className="font-bold text-gray-900">{exam.title}</h4>
                    <p className="text-xs text-gray-500">Google Form / Quiz</p>
                    </div>
                    <ExternalLink size={16} className="ml-auto text-gray-400"/>
                </a>
            ))}
            {(!classData.semesters.find(s => s.id === activeSem)?.exams || classData.semesters.find(s => s.id === activeSem)?.exams?.length === 0) && (
                <div className="col-span-full text-gray-400 italic text-sm text-center py-4">
                    Belum ada soal evaluasi untuk semester ini.
                </div>
            )}
        </div>
      </Card>
    </motion.div>
  );
};

const ChapterContentView: React.FC<{
  chapter: Chapter;
  onBack: () => void;
}> = ({ chapter, onBack }) => {
  const [activeTab, setActiveTab] = useState<'materi' | 'video' | 'kuis'>('materi');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-5xl mx-auto px-4 py-8">
      <Button variant="secondary" onClick={onBack} className="mb-6"><ArrowLeft size={16}/> Kembali ke Bab</Button>
      
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/4">
           <Card className="p-4 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4">Daftar Isi</h3>
              <div className="space-y-2">
                 <button 
                   onClick={() => setActiveTab('materi')}
                   className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'materi' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-gray-50 text-gray-600'}`}
                 >
                    <BookOpen size={18}/> Materi
                 </button>
                 <button 
                   onClick={() => setActiveTab('video')}
                   className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'video' ? 'bg-red-50 text-red-700 font-bold' : 'hover:bg-gray-50 text-gray-600'}`}
                 >
                    <Youtube size={18}/> Video
                 </button>
                 <button 
                   onClick={() => setActiveTab('kuis')}
                   className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'kuis' ? 'bg-green-50 text-green-700 font-bold' : 'hover:bg-gray-50 text-gray-600'}`}
                 >
                    <Gamepad size={18}/> Kuis
                 </button>
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
                        {section.type === 'link' ? (
                            <a href={section.url} target="_blank" className="text-blue-600 hover:underline flex items-center gap-2 font-medium">
                                <LinkIcon size={18}/> Buka Materi: {section.title}
                            </a>
                        ) : (
                            <div dangerouslySetInnerHTML={{ __html: section.content }} />
                        )}
                     </div>
                   )) : (
                     <p className="text-gray-500 italic">Materi belum tersedia.</p>
                   )}
                </div>
              )}

              {activeTab === 'video' && (
                 <div className="space-y-8">
                    {chapter.videos && chapter.videos.length > 0 ? chapter.videos.map(video => (
                      <div key={video.id}>
                         <h3 className="font-bold text-lg mb-2">{video.title}</h3>
                         {video.type === 'link' && video.url ? (
                           <div className="aspect-w-16 aspect-h-9 rounded-xl overflow-hidden shadow-lg">
                              <iframe 
                                src={`https://www.youtube.com/embed/${getYoutubeId(video.url)}`} 
                                title={video.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen
                                className="w-full h-[300px] md:h-[400px]"
                              ></iframe>
                           </div>
                         ) : (
                           <div dangerouslySetInnerHTML={{ __html: video.content || '' }} />
                         )}
                      </div>
                    )) : (
                      <p className="text-gray-500 italic">Video pembelajaran belum tersedia.</p>
                    )}
                 </div>
              )}

              {activeTab === 'kuis' && (
                 <div className="space-y-4">
                    {chapter.quizzes && chapter.quizzes.length > 0 ? chapter.quizzes.map(quiz => (
                       <div key={quiz.id} className="p-6 border border-gray-200 rounded-xl bg-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                <FileQuestion size={24}/>
                             </div>
                             <div>
                                <h4 className="font-bold text-gray-900">{quiz.title}</h4>
                                <p className="text-sm text-gray-500">Kerjakan dengan jujur.</p>
                             </div>
                          </div>
                          {quiz.type === 'link' ? (
                             <a href={quiz.url} target="_blank" rel="noreferrer" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors">
                                Mulai Kuis
                             </a>
                          ) : (
                             <div dangerouslySetInnerHTML={{ __html: quiz.content || '' }} />
                          )}
                       </div>
                    )) : (
                       <p className="text-gray-500 italic">Kuis belum tersedia.</p>
                    )}
                 </div>
              )}
           </Card>
        </div>
      </div>
    </motion.div>
  );
};

const AdminLoginView: React.FC<{ onLogin: () => void; onBack: () => void }> = ({ onLogin, onBack }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') { // Simple hardcoded password for demo
      onLogin();
    } else {
      setError('Password salah!');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Login Guru / Admin</h2>
        <form onSubmit={handleSubmit}>
          <Input 
            type="password" 
            placeholder="Masukkan Password Admin" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4"
          />
          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
          <div className="flex gap-3">
             <Button type="button" variant="secondary" onClick={onBack} className="flex-1">Batal</Button>
             <Button type="submit" className="flex-1">Masuk</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

// --- ADMIN SUB COMPONENTS ---

const AdminContentEditor: React.FC<{
   chapter: Chapter;
   onSave: (updatedChapter: Chapter) => void;
}> = ({ chapter, onSave }) => {
   const [localChapter, setLocalChapter] = useState<Chapter>(chapter);
   const [activeTab, setActiveTab] = useState<'materi' | 'video' | 'kuis'>('materi');
   const [expandedItem, setExpandedItem] = useState<string | null>(null);

   const [editingSection, setEditingSection] = useState<{
      type: 'materi' | 'video' | 'kuis';
      item: ContentSection | ResourceItem;
      isNew: boolean;
   } | null>(null);

   useEffect(() => { setLocalChapter(chapter); }, [chapter]);

   const handleDelete = (type: 'materi' | 'video' | 'kuis', id: string) => {
      if (!confirm('Hapus item ini?')) return;
      const updated = { ...localChapter };
      if (type === 'materi') updated.contents = updated.contents.filter(c => c.id !== id);
      if (type === 'video') updated.videos = updated.videos.filter(v => v.id !== id);
      if (type === 'kuis') updated.quizzes = updated.quizzes.filter(q => q.id !== id);
      setLocalChapter(updated);
      onSave(updated);
   };

   const handleEdit = (type: 'materi' | 'video' | 'kuis', item: any) => {
      setEditingSection({ type, item: { ...item }, isNew: false });
   };

   const handleAdd = (type: 'materi' | 'video' | 'kuis') => {
      const id = Date.now().toString();
      // Default type based on category
      const newItem = { id, title: 'Judul Baru', type: 'html', content: '', url: '' };
      setEditingSection({ type, item: newItem as any, isNew: true });
   };

   const saveSection = () => {
      if (!editingSection) return;
      const { type, item, isNew } = editingSection;
      const updated = { ...localChapter };

      if (type === 'materi') {
         if (isNew) updated.contents = [...(updated.contents || []), item as ContentSection];
         else updated.contents = updated.contents.map(c => c.id === item.id ? item as ContentSection : c);
      } else if (type === 'video') {
         if (isNew) updated.videos = [...(updated.videos || []), item as ResourceItem];
         else updated.videos = updated.videos.map(v => v.id === item.id ? item as ResourceItem : v);
      } else if (type === 'kuis') {
         if (isNew) updated.quizzes = [...(updated.quizzes || []), item as ResourceItem];
         else updated.quizzes = updated.quizzes.map(q => q.id === item.id ? item as ResourceItem : q);
      }

      setLocalChapter(updated);
      onSave(updated);
      setEditingSection(null);
   };

   const toggleExpand = (id: string) => {
       setExpandedItem(expandedItem === id ? null : id);
   }

   return (
      <div className="space-y-6">
         {/* Main Info */}
         <div className="space-y-4 border-b pb-6">
            <h3 className="font-bold text-gray-800">Informasi Umum Bab</h3>
            <Input label="Judul Bab" value={localChapter.title} onChange={e => {
               const updated = { ...localChapter, title: e.target.value };
               setLocalChapter(updated);
            }} onBlur={() => onSave(localChapter)} />
            <TextArea label="Deskripsi" value={localChapter.description} onChange={e => {
               const updated = { ...localChapter, description: e.target.value };
               setLocalChapter(updated);
            }} onBlur={() => onSave(localChapter)} />
         </div>

         {/* Editor Modal */}
         {editingSection && (
            <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
               <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
                  <h3 className="font-bold text-lg mb-4">{editingSection.isNew ? 'Tambah' : 'Edit'} {editingSection.type === 'materi' ? 'Materi' : editingSection.type === 'video' ? 'Video' : 'Kuis'}</h3>
                  
                  <Input label="Judul" value={editingSection.item.title} onChange={e => setEditingSection({...editingSection, item: {...editingSection.item, title: e.target.value}})} />
                  
                  <div className="flex gap-4 mb-4">
                     <label className="flex items-center gap-2"><input type="radio" checked={(editingSection.item as ResourceItem).type === 'link'} onChange={() => setEditingSection({...editingSection, item: {...editingSection.item, type: 'link'}})} /> Link URL</label>
                     <label className="flex items-center gap-2"><input type="radio" checked={(editingSection.item as ResourceItem).type === 'html' || !(editingSection.item as ResourceItem).type} onChange={() => setEditingSection({...editingSection, item: {...editingSection.item, type: 'html'}})} /> HTML Code</label>
                  </div>

                  {(editingSection.item as ResourceItem).type === 'link' ? (
                     <Input label="URL Link" value={(editingSection.item as ResourceItem).url || ''} onChange={e => setEditingSection({...editingSection, item: {...editingSection.item, url: e.target.value}})} />
                  ) : (
                     <TextArea label="Konten HTML" value={editingSection.item.content || ''} onChange={e => setEditingSection({...editingSection, item: {...editingSection.item, content: e.target.value}})} className="min-h-[200px]" />
                  )}

                  <div className="flex justify-end gap-2 mt-4">
                     <Button variant="secondary" onClick={() => setEditingSection(null)}>Batal</Button>
                     <Button onClick={saveSection}>Simpan</Button>
                  </div>
               </div>
            </div>
         )}

         {/* Tabbed Content Editor */}
         <div>
            <div className="flex border-b mb-4">
               {(['materi', 'video', 'kuis'] as const).map(t => (
                   <button
                     key={t}
                     onClick={() => setActiveTab(t)}
                     className={`px-4 py-2 font-medium capitalize border-b-2 transition-colors ${activeTab === t ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                   >
                       {t}
                   </button>
               ))}
            </div>

            <div className="bg-gray-50 rounded-xl p-4 min-h-[300px]">
               <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-gray-800 capitalize flex items-center gap-2">Daftar {activeTab}</h4>
                  <Button onClick={() => handleAdd(activeTab)} className="py-1 px-3 text-sm flex items-center gap-1"><Plus size={14}/> Tambah</Button>
               </div>
               
               <div className="space-y-3">
                  {((activeTab === 'materi' ? localChapter.contents : activeTab === 'video' ? localChapter.videos : localChapter.quizzes) || []).map((item: any) => (
                     <div key={item.id} className="bg-white rounded-lg border shadow-sm overflow-hidden">
                        <div 
                           className="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                           onClick={() => toggleExpand(item.id)}
                        >
                           <span className="font-medium">{item.title}</span>
                           <div className="flex items-center gap-2">
                               <span className={`text-xs px-2 py-0.5 rounded ${item.type === 'link' ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'}`}>
                                   {item.type === 'link' ? 'LINK' : 'HTML'}
                               </span>
                               <ChevronDown size={16} className={`transform transition-transform ${expandedItem === item.id ? 'rotate-180' : ''}`}/>
                           </div>
                        </div>
                        {expandedItem === item.id && (
                           <div className="p-4 border-t bg-gray-50/50 text-sm">
                               <div className="mb-3">
                                   <strong>Konten:</strong>
                                   {item.type === 'link' ? (
                                       <a href={item.url} target="_blank" className="text-blue-600 block truncate mt-1">{item.url}</a>
                                   ) : (
                                       <div className="mt-1 p-2 bg-gray-100 rounded border font-mono text-xs max-h-32 overflow-y-auto whitespace-pre-wrap">{item.content}</div>
                                   )}
                               </div>
                               <div className="flex justify-end gap-2">
                                   <button onClick={() => handleEdit(activeTab, item)} className="text-blue-600 hover:underline flex items-center gap-1"><Edit3 size={14}/> Edit</button>
                                   <button onClick={() => handleDelete(activeTab, item.id)} className="text-red-600 hover:underline flex items-center gap-1"><Trash2 size={14}/> Hapus</button>
                               </div>
                           </div>
                        )}
                     </div>
                  ))}
                  {((activeTab === 'materi' ? localChapter.contents : activeTab === 'video' ? localChapter.videos : localChapter.quizzes) || []).length === 0 && (
                      <div className="text-center text-gray-400 py-8 italic">Belum ada item {activeTab}.</div>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
};

const AdminDashboardView: React.FC<{
  classes: ClassData[];
  schoolProfile: SchoolProfile;
  students: Student[];
  extras: ExtraContent[];
  onUpdateChapter: (classId: string, semesterId: string, chapterId: string, data: Partial<Chapter>) => void;
  onUpdateClass: (updatedClass: ClassData) => void;
  onUpdateProfile: (profile: SchoolProfile) => void;
  onUpdateStudents: (students: Student[]) => void;
  onUpdateExtras: (extras: ExtraContent[]) => void;
  onLogout: () => void;
}> = ({ classes, schoolProfile, students, extras, onUpdateChapter, onUpdateClass, onUpdateProfile, onUpdateStudents, onUpdateExtras, onLogout }) => {
  const [tab, setTab] = useState<'profile' | 'content' | 'students' | 'extras' | 'schedule'>('profile');

  // Profile
  const [profileForm, setProfileForm] = useState(schoolProfile);
  const handleProfileSave = () => {
    onUpdateProfile(profileForm);
    alert('Profil Sekolah diperbarui!');
  };

  // Student
  const [studentForm, setStudentForm] = useState<Partial<Student>>({ classId: '7A', gender: 'L' });
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [filterClass, setFilterClass] = useState<string>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStudentSave = () => {
    if (!studentForm.name || !studentForm.nis) return alert("Nama dan NIS wajib diisi");
    const studentData: Student = {
        id: editingStudentId || Date.now().toString(),
        name: studentForm.name,
        nis: studentForm.nis,
        classId: studentForm.classId || '7A',
        gender: studentForm.gender || 'L'
    };

    if (editingStudentId) {
      onUpdateStudents(students.map(s => s.id === editingStudentId ? studentData : s));
      setEditingStudentId(null);
    } else {
      onUpdateStudents([...students, studentData]);
    }
    setStudentForm({ classId: '7A', gender: 'L', name: '', nis: '' });
  };
  
  const handleStudentEdit = (s: Student) => {
    setEditingStudentId(s.id);
    setStudentForm(s);
  };

  const handleStudentDelete = (id: string) => {
    if (confirm('Hapus siswa ini?')) {
      onUpdateStudents(students.filter(s => s.id !== id));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
  
      const reader = new FileReader();
      reader.onload = (evt) => {
          const bstr = evt.target?.result;
          const wb = window.XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = window.XLSX.utils.sheet_to_json(ws);
          
          // Expected format columns: NIS, Nama Lengkap, Kelas, Gender
          const newStudents: Student[] = data.map((row: any) => {
               const nis = row['NIS'] || row['nis'] || Date.now().toString();
               const name = row['Nama Lengkap'] || row['Nama'] || 'Siswa Baru';
               const clsRaw = row['Kelas'] || 'VII A';
               const genderRaw = row['Gender'] || 'L';
               
               // Attempt to map class name
               let classId = '7A';
               // Simple parser for Roman numerals to ID
               const romanMap: {[key: string]: string} = { 'VII': '7', 'VIII': '8', 'IX': '9' };
               const [roman, suffix] = clsRaw.toString().split(' ');
               if (romanMap[roman]) {
                  classId = `${romanMap[roman]}${suffix || ''}`;
               }
               
               return {
                   id: nis.toString(),
                   nis: nis.toString(),
                   name: name,
                   classId: classId,
                   gender: genderRaw === 'L' ? 'L' : 'P'
               };
          });
  
          if (confirm(`Ditemukan ${newStudents.length} data siswa dari Excel. Tambahkan ke database?`)) {
              onUpdateStudents([...students, ...newStudents]);
          }
          if (fileInputRef.current) fileInputRef.current.value = '';
      };
      reader.readAsBinaryString(file);
  };

  const filteredStudents = students.filter(s => filterClass === 'all' || s.classId === filterClass);

  // Extras
  const [extraForm, setExtraForm] = useState<Partial<ExtraContent>>({ category: 'doa', type: 'link' });
  const [editingExtraId, setEditingExtraId] = useState<string | null>(null);

  const handleExtraSave = () => {
    if (!extraForm.title) return alert("Judul wajib diisi");
    
    if (editingExtraId) {
      onUpdateExtras(extras.map(e => e.id === editingExtraId ? { ...e, ...extraForm } as ExtraContent : e));
      setEditingExtraId(null);
    } else {
      const newExtra: ExtraContent = {
        id: Date.now().toString(),
        title: extraForm.title!,
        category: extraForm.category || 'doa',
        type: extraForm.type || 'link',
        url: extraForm.url || '',
        content: extraForm.content || ''
      };
      onUpdateExtras([...extras, newExtra]);
    }
    setExtraForm({ category: 'doa', type: 'link', title: '', url: '', content: '' });
  };
  
  const handleExtraEdit = (item: ExtraContent) => {
    setEditingExtraId(item.id);
    setExtraForm(item);
  };

  const handleExtraDelete = (id: string) => {
    if (confirm('Hapus konten ini?')) onUpdateExtras(extras.filter(e => e.id !== id));
  };

  // Content
  const [selClassId, setSelClassId] = useState<string>('7A');
  const [selSemId, setSelSemId] = useState<string>('ganjil');
  const [selChapId, setSelChapId] = useState<string>('7-ganjil-1');
  const [chapForm, setChapForm] = useState<Chapter | null>(null);
  
  const [resourceEdit, setResourceEdit] = useState<{
    type: 'schedule' | 'grades' | 'exam', 
    item: ResourceItem, 
    parentId?: string
  } | null>(null);

  // Update default chapter selection when class changes
  useEffect(() => {
     const cls = classes.find(c => c.id === selClassId);
     if (cls) {
         // Default to first chapter of selected semester
         const firstChap = cls.semesters.find(s => s.id === selSemId)?.chapters[0];
         if (firstChap) setSelChapId(firstChap.id);
     }
  }, [selClassId, selSemId, classes]);

  useEffect(() => {
    const cls = classes.find(c => c.id === selClassId);
    const sem = cls?.semesters.find(s => s.id === selSemId);
    const chap = sem?.chapters.find(c => c.id === selChapId);
    if (chap) {
      setChapForm(JSON.parse(JSON.stringify(chap)));
    }
  }, [selClassId, selSemId, selChapId, classes]);

  const handleChapterUpdate = (updatedChapter: Chapter) => {
     onUpdateChapter(selClassId, selSemId, selChapId, updatedChapter);
  };

  const handleResourceSave = () => {
    if (!resourceEdit) return;
    const { type, item } = resourceEdit;
    
    const cls = classes.find(c => c.id === selClassId);
    if (!cls) return;

    let updatedClass = { ...cls };

    if (type === 'schedule') {
        updatedClass.schedule = item;
    } else if (type === 'grades') {
        updatedClass.grades = item;
    } else if (type === 'exam') {
        const semIdx = updatedClass.semesters.findIndex(s => s.id === selSemId);
        if (semIdx > -1) {
            const sem = { ...updatedClass.semesters[semIdx] };
            const exams = sem.exams ? [...sem.exams] : [];
            const existingIdx = exams.findIndex(e => e.id === item.id);
            if (existingIdx > -1) exams[existingIdx] = item;
            else exams.push(item);
            sem.exams = exams;
            updatedClass.semesters[semIdx] = sem;
        }
    }

    onUpdateClass(updatedClass);
    setResourceEdit(null);
    alert('Perubahan berhasil disimpan!');
  };

  const handleExamDelete = (examId: string) => {
      if(!confirm("Hapus soal evaluasi ini?")) return;
      const cls = classes.find(c => c.id === selClassId);
      if (!cls) return;
      
      const semIdx = cls.semesters.findIndex(s => s.id === selSemId);
      if (semIdx > -1) {
          const sem = { ...cls.semesters[semIdx] };
          sem.exams = (sem.exams || []).filter(e => e.id !== examId);
          const updatedClass = { ...cls };
          updatedClass.semesters[semIdx] = sem;
          onUpdateClass(updatedClass);
      }
  };

  const currentClass = classes.find(c => c.id === selClassId);
  const currentSemester = currentClass?.semesters.find(s => s.id === selSemId);

  const adminTabs = [
    { id: 'profile', label: 'Profil Sekolah', icon: <School size={18}/> },
    { id: 'content', label: 'Manajemen Materi', icon: <BookOpen size={18}/> },
    { id: 'schedule', label: 'Jadwal & Nilai', icon: <CalendarRange size={18}/> },
    { id: 'students', label: 'Data Siswa', icon: <Users size={18}/> },
    { id: 'extras', label: 'Pojok Literasi', icon: <Sparkles size={18}/> },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50">
       <div className="bg-white/90 backdrop-blur-xl border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg">
                <Settings size={20} />
             </div>
             <h1 className="font-bold text-gray-800 text-lg hidden sm:block">Admin Dashboard</h1>
          </div>
          <Button variant="danger" onClick={onLogout} className="px-4 py-2 text-sm">
             <LogOut size={16} /> Keluar
          </Button>
       </div>

       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Top Horizontal Tabs */}
          <div className="flex overflow-x-auto pb-4 gap-2 mb-6 hide-scrollbar border-b border-gray-200 sticky top-20 bg-gray-50/95 backdrop-blur z-40 pt-2 -mx-4 px-4 sm:mx-0 sm:px-0">
             {adminTabs.map(item => (
               <button
                 key={item.id}
                 onClick={() => setTab(item.id as any)}
                 className={`flex-shrink-0 px-6 py-3 rounded-xl flex items-center gap-2 font-bold transition-all ${
                   tab === item.id 
                   ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                   : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                 }`}
               >
                 {item.icon} {item.label}
               </button>
             ))}
          </div>

          <div className="flex-grow min-h-[600px]">
             {tab === 'profile' && (
               <Card>
                  <SectionTitle title="Edit Profil Sekolah" />
                  <Input label="Nama Sekolah" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} />
                  <TextArea label="Deskripsi" value={profileForm.description} onChange={e => setProfileForm({...profileForm, description: e.target.value})} />
                  <Input label="Alamat" value={profileForm.address} onChange={e => setProfileForm({...profileForm, address: e.target.value})} />
                  <Input label="Email" value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})} />
                  <div className="grid grid-cols-2 gap-4">
                     <Input label="Nama Guru PAI" value={profileForm.teacherName} onChange={e => setProfileForm({...profileForm, teacherName: e.target.value})} />
                     <Input label="No. WhatsApp (Format 62...)" value={profileForm.phoneNumber} onChange={e => setProfileForm({...profileForm, phoneNumber: e.target.value})} />
                  </div>
                  <div className="mt-6 flex justify-end">
                     <Button onClick={handleProfileSave}><Save size={18} /> Simpan Perubahan</Button>
                  </div>
               </Card>
             )}

             {tab === 'students' && (
               <Card>
                   <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                     <SectionTitle title="Manajemen Data Siswa" subtitle={`Total: ${students.length} Siswa Terdaftar`} />
                     <div className="flex items-center gap-2">
                        <input 
                           type="file" 
                           accept=".xlsx, .xls" 
                           ref={fileInputRef}
                           onChange={handleFileUpload} 
                           className="hidden" 
                           id="excel-upload"
                        />
                        <label htmlFor="excel-upload" className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg cursor-pointer hover:bg-green-200 transition-colors text-sm font-bold">
                           <Upload size={16}/> Import Excel
                        </label>
                        <div className="w-px h-6 bg-gray-300 mx-2"></div>
                        <Filter size={16} className="text-gray-500"/>
                        <select 
                           className="p-2 border rounded-lg text-sm bg-white"
                           value={filterClass}
                           onChange={(e) => setFilterClass(e.target.value)}
                        >
                           <option value="all">Semua Kelas</option>
                           {classes
                             .sort((a, b) => a.id.localeCompare(b.id))
                             .map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                           }
                        </select>
                     </div>
                  </div>
                  
                  {/* Form & Upload */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                     <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Plus size={18}/> {editingStudentId ? 'Edit Siswa' : 'Tambah Siswa Manual'}</h3>
                        <Input placeholder="Nama Lengkap" value={studentForm.name || ''} onChange={e => setStudentForm({...studentForm, name: e.target.value})} className="mb-2"/>
                        <div className="flex gap-2 mb-2">
                           <Input placeholder="NIS/NISN" value={studentForm.nis || ''} onChange={e => setStudentForm({...studentForm, nis: e.target.value})} className="flex-1 mb-0"/>
                           <select className="p-3 rounded-xl border border-gray-300 bg-white" value={studentForm.gender || 'L'} onChange={e => setStudentForm({...studentForm, gender: e.target.value as any})}>
                              <option value="L">Laki-laki</option>
                              <option value="P">Perempuan</option>
                           </select>
                           <select className="p-3 rounded-xl border border-gray-300 bg-white" value={studentForm.classId || '7A'} onChange={e => setStudentForm({...studentForm, classId: e.target.value})}>
                              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                           </select>
                        </div>
                        <Button onClick={handleStudentSave} className="w-full text-sm py-2">
                           {editingStudentId ? 'Simpan Perubahan' : 'Tambah Siswa'}
                        </Button>
                        {editingStudentId && <button onClick={() => {setEditingStudentId(null); setStudentForm({ classId: '7A', gender: 'L', name: '', nis: '' })}} className="text-xs text-red-500 mt-2 text-center w-full block">Batal Edit</button>}
                     </div>
                  </div>

                  <div className="overflow-x-auto max-h-[500px] border rounded-xl">
                     <table className="min-w-full text-sm text-left">
                        <thead className="bg-gray-100 font-bold text-gray-700 sticky top-0">
                           <tr>
                              <th className="px-4 py-3">NIS</th>
                              <th className="px-4 py-3">Nama</th>
                              <th className="px-4 py-3">Kelas</th>
                              <th className="px-4 py-3">L/P</th>
                              <th className="px-4 py-3 text-right">Aksi</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                           {filteredStudents.map(s => (
                             <tr key={s.id} className="hover:bg-gray-50">
                                <td className="px-4 py-2">{s.nis}</td>
                                <td className="px-4 py-2 font-medium">{s.name}</td>
                                <td className="px-4 py-2">{s.classId}</td>
                                <td className="px-4 py-2">{s.gender}</td>
                                <td className="px-4 py-2 text-right flex justify-end gap-2">
                                   <button onClick={() => handleStudentEdit(s)} className="text-blue-600 hover:bg-blue-50 p-1 rounded"><Edit3 size={16}/></button>
                                   <button onClick={() => handleStudentDelete(s.id)} className="text-red-600 hover:bg-red-50 p-1 rounded"><Trash2 size={16}/></button>
                                </td>
                             </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </Card>
             )}

             {tab === 'schedule' && (
                <Card>
                    <SectionTitle title="Pengaturan Jadwal & Nilai" subtitle="Kelola jadwal pelajaran dan rekap nilai per kelas." />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <h3 className="font-bold mb-4">Pilih Kelas</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
                                {classes.map(c => (
                                    <button
                                        key={c.id}
                                        onClick={() => setSelClassId(c.id)}
                                        className={`p-3 rounded-lg border text-sm font-bold transition-all ${selClassId === c.id ? `bg-${c.color}-100 border-${c.color}-500 text-${c.color}-800` : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        {c.name}
                                    </button>
                                ))}
                            </div>
                            
                            <div className="space-y-4">
                                <div 
                                    onClick={() => setResourceEdit({ type: 'schedule', item: currentClass?.schedule || { id: 'sch', title: 'Jadwal Pelajaran', type: 'html', content: '' } })} 
                                    className="p-4 rounded-xl bg-blue-50 border border-blue-100 hover:bg-blue-100 cursor-pointer flex items-center justify-between group transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-200 rounded-lg text-blue-700"><CalendarRange size={24}/></div>
                                        <div>
                                            <h4 className="font-bold text-blue-900">Jadwal Pelajaran</h4>
                                            <p className="text-sm text-blue-600">{currentClass?.name}</p>
                                        </div>
                                    </div>
                                    <Edit3 className="text-blue-400 group-hover:text-blue-600" size={20}/>
                                </div>

                                <div 
                                    onClick={() => setResourceEdit({ type: 'grades', item: currentClass?.grades || { id: 'grd', title: 'Monitoring Nilai', type: 'html', content: '' } })} 
                                    className="p-4 rounded-xl bg-green-50 border border-green-100 hover:bg-green-100 cursor-pointer flex items-center justify-between group transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-200 rounded-lg text-green-700"><GraduationCap size={24}/></div>
                                        <div>
                                            <h4 className="font-bold text-green-900">Monitoring Nilai</h4>
                                            <p className="text-sm text-green-600">{currentClass?.name}</p>
                                        </div>
                                    </div>
                                    <Edit3 className="text-green-400 group-hover:text-green-600" size={20}/>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-xl border">
                            {resourceEdit && (resourceEdit.type === 'schedule' || resourceEdit.type === 'grades') ? (
                                <div className="animate-fade-in-up">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold text-gray-800">Edit {resourceEdit.item.title}</h3>
                                        <Button onClick={handleResourceSave} className="py-2 px-4 text-sm"><Save size={16}/> Simpan</Button>
                                    </div>
                                    <div className="flex gap-4 mb-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" checked={resourceEdit.item.type === 'html'} onChange={() => setResourceEdit({...resourceEdit, item: {...resourceEdit.item, type: 'html'}})}/>
                                            <span className="text-sm">HTML Editor</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" checked={resourceEdit.item.type === 'link'} onChange={() => setResourceEdit({...resourceEdit, item: {...resourceEdit.item, type: 'link'}})}/>
                                            <span className="text-sm">External Link</span>
                                        </label>
                                    </div>
                                    {resourceEdit.item.type === 'html' ? (
                                        <TextArea 
                                            value={resourceEdit.item.content || ''} 
                                            onChange={e => setResourceEdit({...resourceEdit, item: {...resourceEdit.item, content: e.target.value}})} 
                                            className="h-64 font-mono text-sm"
                                            placeholder="Masukkan kode HTML untuk tabel jadwal/nilai..."
                                        />
                                    ) : (
                                        <Input 
                                            value={resourceEdit.item.url || ''} 
                                            onChange={e => setResourceEdit({...resourceEdit, item: {...resourceEdit.item, url: e.target.value}})} 
                                            placeholder="https://..."
                                        />
                                    )}
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-400 text-center italic">
                                    Pilih menu Jadwal atau Nilai di samping untuk mulai mengedit.
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
             )}

             {tab === 'content' && (
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="lg:col-span-1 h-fit">
                     <h3 className="font-bold text-gray-800 mb-4">Pilih Bab & Kelas</h3>
                     <div className="space-y-4">
                        <select className="w-full p-2 border rounded-lg bg-gray-50" value={selClassId} onChange={e => setSelClassId(e.target.value)}>
                           {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <select className="w-full p-2 border rounded-lg bg-gray-50 mt-2" value={selSemId} onChange={e => setSelSemId(e.target.value)}>
                           <option value="ganjil">Semester Ganjil</option>
                           <option value="genap">Semester Genap</option>
                        </select>
                        <div className="space-y-1">
                            <div className="flex justify-between items-center px-1">
                                <div className="p-2 text-xs font-bold text-gray-500 uppercase">Evaluasi Semester</div>
                                <button onClick={() => setResourceEdit({ type: 'exam', item: { id: Date.now().toString(), title: 'Evaluasi Baru', type: 'link', url: '' } })} className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200">+ Tambah</button>
                            </div>
                            {currentSemester?.exams?.map(exam => (
                                <div key={exam.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded text-sm group">
                                    <span className="truncate">{exam.title}</span>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                                        <button onClick={() => setResourceEdit({ type: 'exam', item: exam })}><Edit3 size={12} className="text-blue-500"/></button>
                                        <button onClick={() => handleExamDelete(exam.id)}><Trash2 size={12} className="text-red-500"/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-1 max-h-[250px] overflow-y-auto mt-4 pt-2 border-t">
                           <div className="text-xs font-bold text-gray-500 uppercase mb-2">Daftar Bab</div>
                           {currentSemester?.chapters.map(chap => (
                              <div key={chap.id} onClick={() => { setSelChapId(chap.id); setResourceEdit(null); }} className={`p-2 rounded cursor-pointer text-sm ${selChapId === chap.id && !resourceEdit ? 'bg-blue-600 text-white font-bold' : 'hover:bg-gray-100 text-gray-700'}`}>{chap.title}</div>
                           ))}
                        </div>
                     </div>
                  </Card>
                  <Card className="lg:col-span-2">
                     {resourceEdit && resourceEdit.type === 'exam' ? (
                        <div>
                            {/* Resource Editor (Exam) */}
                            <div className="flex justify-between items-center mb-6 border-b pb-4">
                                <h2 className="text-xl font-bold">Edit Soal Evaluasi</h2>
                                <div className="flex gap-2">
                                    <Button variant="secondary" onClick={() => setResourceEdit(null)} className="py-2 px-4 text-sm">Batal</Button>
                                    <Button onClick={handleResourceSave} className="py-2 px-4 text-sm"><Save size={16}/> Simpan</Button>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <Input label="Judul" value={resourceEdit.item.title} onChange={e => setResourceEdit({...resourceEdit, item: {...resourceEdit.item, title: e.target.value}})} />
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" checked={resourceEdit.item.type === 'html'} onChange={() => setResourceEdit({...resourceEdit, item: {...resourceEdit.item, type: 'html'}})}/>
                                        <span className="text-sm">HTML</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" checked={resourceEdit.item.type === 'link'} onChange={() => setResourceEdit({...resourceEdit, item: {...resourceEdit.item, type: 'link'}})}/>
                                        <span className="text-sm">Link</span>
                                    </label>
                                </div>
                                {resourceEdit.item.type === 'html' ? <TextArea label="Konten HTML" value={resourceEdit.item.content || ''} onChange={e => setResourceEdit({...resourceEdit, item: {...resourceEdit.item, content: e.target.value}})} /> : <Input label="URL Link" value={resourceEdit.item.url || ''} onChange={e => setResourceEdit({...resourceEdit, item: {...resourceEdit.item, url: e.target.value}})} />}
                            </div>
                        </div>
                     ) : (
                        chapForm ? (
                           <AdminContentEditor 
                              chapter={chapForm} 
                              onSave={handleChapterUpdate} 
                           />
                        ) : (
                           <div>Memuat data bab...</div>
                        )
                     )}
                  </Card>
               </div>
             )}
             
             {tab === 'extras' && (
               <Card>
                 <SectionTitle title="Pojok Literasi" subtitle="Kelola konten tambahan (Doa, Cerita, Ramadhan, dll)" />
                 <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
                    <h3 className="font-bold text-gray-800 mb-4">{editingExtraId ? 'Edit Konten' : 'Tambah Konten Baru'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                       <Input label="Judul" value={extraForm.title || ''} onChange={e => setExtraForm({...extraForm, title: e.target.value})} className="mb-0"/>
                       <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategori</label>
                          <select className="w-full p-3 rounded-xl border border-gray-300 bg-white" value={extraForm.category} onChange={e => setExtraForm({...extraForm, category: e.target.value as ExtraCategory})}>
                             <option value="doa">Kumpulan Do'a</option>
                             <option value="cerita">Kisah Islami</option>
                             <option value="sholat">Materi Sholat</option>
                             <option value="fiqih">Fiqih Dasar</option>
                             <option value="hadist">Hadist Pilihan</option>
                             <option value="ramadhan">Special Ramadhan</option>
                             <option value="lainnya">Lain-Lain</option>
                          </select>
                       </div>
                    </div>
                    <div className="flex gap-4 mb-4">
                       <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={extraForm.type === 'link'} onChange={() => setExtraForm({...extraForm, type: 'link'})}/><span className="text-sm">Link</span></label>
                       <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={extraForm.type === 'html'} onChange={() => setExtraForm({...extraForm, type: 'html'})}/><span className="text-sm">HTML</span></label>
                    </div>
                    {extraForm.type === 'link' ? <Input placeholder="Link URL" value={extraForm.url || ''} onChange={e => setExtraForm({...extraForm, url: e.target.value})} /> : <TextArea placeholder="Isi HTML" value={extraForm.content || ''} onChange={e => setExtraForm({...extraForm, content: e.target.value})} />}
                    <div className="flex gap-2"><Button onClick={handleExtraSave}>{editingExtraId ? 'Simpan' : 'Tambah'}</Button></div>
                 </div>
                 <div className="space-y-2">
                    {extras.map(item => (
                       <div key={item.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg hover:shadow-sm">
                          <div className="flex items-center gap-3"><span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded uppercase">{item.category}</span><span className="font-medium text-gray-800">{item.title}</span></div>
                          <div className="flex gap-2"><button onClick={() => handleExtraEdit(item)} className="text-blue-500 p-1"><Edit3 size={16}/></button><button onClick={() => handleExtraDelete(item.id)} className="text-red-500 p-1"><Trash2 size={16}/></button></div>
                       </div>
                    ))}
                 </div>
               </Card>
             )}
          </div>
       </div>
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

  const navigate = (newView: ViewState, classId?: string | null, chapterId?: string | null) => {
      setView(newView);
      if (classId !== undefined) setSelectedClassId(classId);
      if (chapterId !== undefined) setSelectedChapterId(chapterId);
      window.scrollTo(0, 0);
  };

  const handleLoginSuccess = (student: Student, classId: string) => {
      setCurrentUser(student);
      navigate(ViewState.CLASS_DETAIL, classId);
  };

  const handleUpdateChapter = (classId: string, semId: string, chapId: string, data: Partial<Chapter>) => {
      setClassesData(prev => prev.map(cls => {
          if (cls.id !== classId) return cls;
          return {
              ...cls,
              semesters: cls.semesters.map(sem => {
                  if (sem.id !== semId) return sem;
                  return {
                      ...sem,
                      chapters: sem.chapters.map(chap => {
                          if (chap.id !== chapId) return chap;
                          return { ...chap, ...data };
                      })
                  };
              })
          };
      }));
  };

  const activeChapter = selectedClassId && selectedChapterId 
      ? classesData.find(c => c.id === selectedClassId)?.semesters.flatMap(s => s.chapters).find(ch => ch.id === selectedChapterId)
      : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 font-sans text-gray-800">
      {view !== ViewState.ADMIN_DASHBOARD && (
          <Navbar 
             goHome={() => navigate(ViewState.LANDING)}
             goAdmin={() => navigate(ViewState.ADMIN_LOGIN)}
             schoolName={schoolProfile.name}
          />
      )}

      <div className={view !== ViewState.ADMIN_DASHBOARD ? "pt-20" : ""}>
        <AnimatePresence mode="wait">
           {view === ViewState.LANDING && (
              <LandingView 
                  key="landing"
                  onSelectClass={(clsId) => { navigate(ViewState.STUDENT_LOGIN, clsId); }}
                  onAdminLogin={() => navigate(ViewState.ADMIN_LOGIN)}
                  onSelectCategory={(c) => { setSelectedCategory(c); navigate(ViewState.EXTRA_CATEGORY_LIST); }}
                  classes={classesData}
                  extras={extrasData}
              />
           )}
           
           {view === ViewState.STUDENT_LOGIN && (
              <StudentLoginView 
                  key="login"
                  initialClassId={selectedClassId}
                  classes={classesData}
                  students={studentsData}
                  onLoginSuccess={handleLoginSuccess}
                  onBack={() => navigate(ViewState.LANDING)}
              />
           )}

           {view === ViewState.CLASS_DETAIL && selectedClassId && (
              <ClassDetailView 
                  key="class-detail"
                  classData={classesData.find(c => c.id === selectedClassId)!}
                  student={currentUser}
                  onBack={() => navigate(ViewState.LANDING)}
                  onSelectChapter={(cid) => navigate(ViewState.CHAPTER_CONTENT, selectedClassId, cid)}
              />
           )}

           {view === ViewState.CHAPTER_CONTENT && activeChapter && (
              <ChapterContentView 
                  key="chapter-content"
                  chapter={activeChapter}
                  onBack={() => navigate(ViewState.CLASS_DETAIL)}
              />
           )}

           {view === ViewState.EXTRA_CATEGORY_LIST && (
              <motion.div key="extra-list" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="max-w-6xl mx-auto px-4 py-8">
                  <Button variant="secondary" onClick={() => navigate(ViewState.LANDING)} className="mb-8"><ArrowLeft size={16}/> Kembali</Button>
                  <SectionTitle title={`Kategori: ${selectedCategory.toUpperCase()}`} />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {extrasData.filter(e => e.category === selectedCategory).map(item => (
                          <Card key={item.id}>
                              <div className="flex items-center gap-3 mb-3">
                                  <div className={`p-2 rounded-lg bg-gray-100`}>
                                     {item.category === 'doa' && <BookHeart size={20} className="text-green-600"/>}
                                     {item.category === 'sholat' && <Sun size={20} className="text-orange-600"/>}
                                     {item.category !== 'doa' && item.category !== 'sholat' && <Sparkles size={20} className="text-blue-600"/>}
                                  </div>
                                  <h3 className="font-bold text-gray-800">{item.title}</h3>
                              </div>
                              {item.type === 'link' ? (
                                  <a href={item.url} target="_blank" className="text-blue-600 hover:underline flex items-center gap-2 text-sm font-medium"><LinkIcon size={14}/> Buka Konten</a>
                              ) : (
                                  <div className="prose prose-sm max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: item.content || '' }} />
                              )}
                          </Card>
                      ))}
                      {extrasData.filter(e => e.category === selectedCategory).length === 0 && (
                          <div className="col-span-full text-center py-12 text-gray-400 italic">Belum ada konten untuk kategori ini.</div>
                      )}
                  </div>
              </motion.div>
           )}

           {view === ViewState.ADMIN_LOGIN && (
              <AdminLoginView 
                  key="admin-login"
                  onLogin={() => navigate(ViewState.ADMIN_DASHBOARD)}
                  onBack={() => navigate(ViewState.LANDING)}
              />
           )}

           {view === ViewState.ADMIN_DASHBOARD && (
              <AdminDashboardView 
                  key="admin-dash"
                  classes={classesData}
                  schoolProfile={schoolProfile}
                  students={studentsData}
                  extras={extrasData}
                  onUpdateChapter={handleUpdateChapter}
                  onUpdateClass={(u) => setClassesData(prev => prev.map(c => c.id === u.id ? u : c))}
                  onUpdateProfile={setSchoolProfile}
                  onUpdateStudents={setStudentsData}
                  onUpdateExtras={setExtrasData}
                  onLogout={() => navigate(ViewState.LANDING)}
              />
           )}
        </AnimatePresence>
      </div>

      {view !== ViewState.ADMIN_DASHBOARD && view !== ViewState.CHAPTER_CONTENT && (
          <Footer onAdminClick={() => navigate(ViewState.ADMIN_LOGIN)} profile={schoolProfile} />
      )}
    </div>
  );
};

export default App;