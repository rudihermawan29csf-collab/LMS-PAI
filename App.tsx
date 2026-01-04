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
  Phone
} from 'lucide-react';

// Import Firebase (db will be null if config not set)
import { db, doc, setDoc, getDoc, collection, getDocs } from './firebase';

import { CLASSES_DATA, FEATURES, DEFAULT_SCHOOL_PROFILE, DEFAULT_STUDENTS, DEFAULT_EXTRAS } from './constants';
import { ViewState, ClassData, Chapter, SchoolProfile, Student, ExtraContent, ExtraCategory, ResourceItem } from './types';
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
          }
        } catch (error) {
          console.error("Error fetching prayer times:", error);
          setLocationName("Jadwal Sholat Tidak Tersedia");
        }
      }, (error) => {
        setLocationName("Izin Lokasi Ditolak");
      });
    } else {
      setLocationName("Geolocation Tidak Didukung");
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
          {goAdmin && (
             <button 
               onClick={goAdmin} 
               className="text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-1 bg-white/50 px-3 py-2 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 hover:shadow-sm"
               title="Masuk sebagai Administrator"
             >
               <Settings size={16} />
               <span>Admin</span>
             </button>
          )}
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
                {goAdmin && (
                   <button onClick={goAdmin} className="block w-full text-left py-2 text-gray-600 text-sm mt-4 border-t border-gray-100 pt-4 flex items-center gap-2">
                     <Settings size={16} />
                     Administrator
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
          <p>Design by erha</p>
        </div>
      </div>
    </div>
  </footer>
);

// --- VIEWS ---

const LandingView: React.FC<{ 
  onStart: () => void; 
  onSelectClass: (id: string) => void;
  onSelectCategory: (category: ExtraCategory) => void;
  classes: ClassData[];
  extras: ExtraContent[];
}> = ({ onStart, onSelectClass, onSelectCategory, classes }) => {
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
            <PrayerTimesWidget />

            <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter mb-8 leading-[1.1] text-gray-900 relative z-10 drop-shadow-sm">
              Belajar PAI Lebih <br className="hidden md:block" />
              <span className="relative inline-block mt-2 md:mt-0">
                <span className="absolute -inset-2 bg-blue-400/20 blur-2xl rounded-full"></span>
                <span className="text-shimmer relative z-10">Bermakna</span>
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
              Jelajahi materi Pendidikan Agama Islam secara interaktif, menyenangkan, dan tanamkan nilai moderasi beragama sejak dini.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
              <Button onClick={onStart} className="w-full sm:w-auto text-lg px-8 py-4 shadow-blue-500/25 shadow-2xl hover:scale-105 transform transition-all duration-300 rounded-2xl">
                Mulai Belajar Sekarang
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
      <section id="pilih-kelas" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle 
          title="Pilih Kelasmu" 
          subtitle="Login dengan memilih kelas dan namamu." 
          center 
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {classes.map((cls) => (
            <Card 
              key={cls.id} 
              onClick={() => onSelectClass(cls.id)}
              className="group relative overflow-hidden h-full border border-white/40 bg-white/40 backdrop-blur-xl hover:bg-white/60 transition-all duration-300 pt-12"
            >
              <TrafficLights />
              <div className={`absolute -right-10 -top-10 w-48 h-48 bg-gradient-to-br from-${cls.color}-100 to-${cls.color}-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700 blur-3xl`}></div>
              
              <div className="relative z-10 flex flex-col h-full">
                <div className={`w-16 h-16 bg-gradient-to-br from-${cls.color}-50 to-white rounded-2xl flex items-center justify-center text-${cls.color}-600 mb-6 border border-${cls.color}-100 shadow-sm`}>
                  {cls.icon === 'book-open' && <BookOpen size={28} />}
                  {cls.icon === 'compass' && <Layout size={28} />}
                  {cls.icon === 'star' && <Brain size={28} />}
                </div>
                
                <h3 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">{cls.name}</h3>
                <p className="text-gray-500 mb-8 leading-relaxed">Akses materi lengkap untuk semester ganjil dan genap.</p>
                
                <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-200/30">
                   <span className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Login Kelas</span>
                   <div className={`w-10 h-10 rounded-full bg-white/50 border border-white flex items-center justify-center group-hover:bg-${cls.color}-500 group-hover:text-white group-hover:border-transparent transition-all shadow-sm`}>
                     <ChevronRight size={20} />
                   </div>
                </div>
              </div>
            </Card>
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
  targetClassId: string;
  classes: ClassData[];
  students: Student[];
  onLoginSuccess: (student: Student) => void;
  onBack: () => void;
}> = ({ targetClassId, classes, students, onLoginSuccess, onBack }) => {
  const [search, setSearch] = useState('');
  const targetClass = classes.find(c => c.id === targetClassId);
  const classStudents = students.filter(s => s.classId === targetClassId);
  const filteredStudents = classStudents.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.nis.includes(search)
  );

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-4xl mx-auto px-4 py-12">
      <Button variant="secondary" onClick={onBack} className="mb-8"><ArrowLeft size={18}/> Kembali</Button>
      <Card className="p-8 md:p-12">
        <div className="text-center mb-8">
          <div className={`w-20 h-20 mx-auto bg-${targetClass?.color}-100 rounded-full flex items-center justify-center text-${targetClass?.color}-600 mb-4`}>
             <Users size={32} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Login {targetClass?.name}</h2>
          <p className="text-gray-500 mt-2">Cari namamu atau masukkan NIS untuk masuk.</p>
        </div>

        <Input 
           placeholder="Cari Nama / NIS..." 
           value={search} 
           onChange={e => setSearch(e.target.value)}
           className="text-lg py-4 mb-8"
           autoFocus
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2">
           {filteredStudents.length > 0 ? (
             filteredStudents.map(student => (
               <button 
                 key={student.id}
                 onClick={() => onLoginSuccess(student)}
                 className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
               >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${student.gender === 'L' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}>
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 group-hover:text-blue-700">{student.name}</h4>
                    <p className="text-sm text-gray-500">NIS: {student.nis}</p>
                  </div>
               </button>
             ))
           ) : (
             <div className="col-span-full text-center py-8 text-gray-400">
               Siswa tidak ditemukan.
             </div>
           )}
        </div>
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
            <Button variant="secondary" onClick={onBack} className="mb-4 text-sm py-2 px-4"><ArrowLeft size={16}/> Ganti Kelas</Button>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
               <span className={`w-3 h-8 bg-${classData.color}-500 rounded-full`}></span>
               Materi {classData.name}
            </h1>
            <p className="text-gray-500 mt-1 ml-6">Selamat datang, <span className="font-bold text-gray-800">{student?.name}</span>!</p>
         </div>
         <div className="flex gap-2">
            {classData.schedule && (
              <button onClick={() => window.open('#', '_blank')} className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50">
                <CalendarRange size={16} className="text-blue-500"/> Jadwal
              </button>
            )}
            {classData.grades && (
              <button onClick={() => window.open('#', '_blank')} className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50">
                <GraduationCap size={16} className="text-green-500"/> Nilai
              </button>
            )}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* Bank Soal Section */}
      <div className="mt-12">
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
      </div>
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
                   {chapter.contents.map(section => (
                     <div key={section.id} className="mb-8">
                        {section.title && <h3 className="text-xl font-bold mb-3 text-gray-800">{section.title}</h3>}
                        <div dangerouslySetInnerHTML={{ __html: section.content }} />
                     </div>
                   ))}
                   {chapter.contents.length === 0 && <p className="text-gray-500 italic">Materi belum tersedia.</p>}
                </div>
              )}

              {activeTab === 'video' && (
                 <div className="space-y-8">
                    {chapter.videos.length > 0 ? chapter.videos.map(video => (
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
                    {chapter.quizzes.length > 0 ? chapter.quizzes.map(quiz => (
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
        <h2 className="text-2xl font-bold text-center mb-6">Login Administrator</h2>
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
  const [tab, setTab] = useState<'profile' | 'content' | 'students' | 'extras'>('profile');

  // Profile
  const [profileForm, setProfileForm] = useState(schoolProfile);
  const handleProfileSave = () => {
    onUpdateProfile(profileForm);
    alert('Profil Sekolah diperbarui!');
  };

  // Student
  const [studentForm, setStudentForm] = useState<Partial<Student>>({ classId: '7', gender: 'L' });
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [filterClass, setFilterClass] = useState<string>('all');

  const handleStudentSave = () => {
    if (!studentForm.name || !studentForm.nis) return alert("Nama dan NIS wajib diisi");
    const studentData: Student = {
        id: editingStudentId || Date.now().toString(),
        name: studentForm.name,
        nis: studentForm.nis,
        classId: studentForm.classId || '7',
        gender: studentForm.gender || 'L'
    };

    if (editingStudentId) {
      onUpdateStudents(students.map(s => s.id === editingStudentId ? studentData : s));
      setEditingStudentId(null);
    } else {
      onUpdateStudents([...students, studentData]);
    }
    setStudentForm({ classId: '7', gender: 'L', name: '', nis: '' });
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
  const [selClassId, setSelClassId] = useState<string>('7');
  const [selSemId, setSelSemId] = useState<string>('ganjil');
  const [selChapId, setSelChapId] = useState<string>('7-1');
  const [chapForm, setChapForm] = useState<Partial<Chapter>>({});
  
  const [resourceEdit, setResourceEdit] = useState<{
    type: 'schedule' | 'grades' | 'exam', 
    item: ResourceItem, 
    parentId?: string
  } | null>(null);

  useEffect(() => {
    const cls = classes.find(c => c.id === selClassId);
    const sem = cls?.semesters.find(s => s.id === selSemId);
    const chap = sem?.chapters.find(c => c.id === selChapId);
    if (chap) {
      setChapForm(JSON.parse(JSON.stringify(chap)));
    }
  }, [selClassId, selSemId, selChapId, classes]);

  const handleChapterSave = () => {
    if (selChapId && chapForm) {
      onUpdateChapter(selClassId, selSemId, selChapId, chapForm);
      alert('Materi Bab berhasil disimpan!');
    }
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

  const currentClass = classes.find(c => c.id === selClassId);
  const currentSemester = currentClass?.semesters.find(s => s.id === selSemId);

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

       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-64 flex-shrink-0 space-y-2">
             {[
               { id: 'profile', label: 'Profil Sekolah', icon: <School size={18}/> },
               { id: 'content', label: 'Manajemen Materi', icon: <BookOpen size={18}/> },
               { id: 'students', label: 'Data Siswa', icon: <Users size={18}/> },
               { id: 'extras', label: 'Pojok Literasi', icon: <Sparkles size={18}/> },
             ].map(item => (
               <button
                 key={item.id}
                 onClick={() => setTab(item.id as any)}
                 className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 font-medium transition-all ${
                   tab === item.id ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'
                 }`}
               >
                 {item.icon} {item.label}
               </button>
             ))}
          </div>

          <div className="flex-grow">
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
                        <Filter size={16} className="text-gray-500"/>
                        <select 
                           className="p-2 border rounded-lg text-sm bg-white"
                           value={filterClass}
                           onChange={(e) => setFilterClass(e.target.value)}
                        >
                           <option value="all">Semua Kelas</option>
                           <option value="7">Kelas 7</option>
                           <option value="8">Kelas 8</option>
                           <option value="9">Kelas 9</option>
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
                           <select className="p-3 rounded-xl border border-gray-300 bg-white" value={studentForm.classId || '7'} onChange={e => setStudentForm({...studentForm, classId: e.target.value})}>
                              <option value="7">Kelas 7</option>
                              <option value="8">Kelas 8</option>
                              <option value="9">Kelas 9</option>
                           </select>
                        </div>
                        <Button onClick={handleStudentSave} className="w-full text-sm py-2">
                           {editingStudentId ? 'Simpan Perubahan' : 'Tambah Siswa'}
                        </Button>
                        {editingStudentId && <button onClick={() => {setEditingStudentId(null); setStudentForm({ classId: '7', gender: 'L', name: '', nis: '' })}} className="text-xs text-red-500 mt-2 text-center w-full block">Batal Edit</button>}
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

             {tab === 'content' && (
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="lg:col-span-1 h-fit">
                     <h3 className="font-bold text-gray-800 mb-4">Pilih Bab & Kelas</h3>
                     <div className="space-y-4">
                        <select className="w-full p-2 border rounded-lg bg-gray-50" value={selClassId} onChange={e => setSelClassId(e.target.value)}>
                           {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <div className="space-y-2 pt-2 border-t">
                            <div onClick={() => setResourceEdit({ type: 'schedule', item: currentClass?.schedule || { id: 'sch', title: 'Jadwal Pelajaran', type: 'html', content: '' } })} className="p-2 rounded hover:bg-blue-50 text-blue-600 text-sm cursor-pointer flex items-center gap-2">
                                <CalendarRange size={14}/> Pengaturan Jadwal
                            </div>
                            <div onClick={() => setResourceEdit({ type: 'grades', item: currentClass?.grades || { id: 'grd', title: 'Monitoring Nilai', type: 'html', content: '' } })} className="p-2 rounded hover:bg-green-50 text-green-600 text-sm cursor-pointer flex items-center gap-2">
                                <GraduationCap size={14}/> Monitoring Nilai
                            </div>
                        </div>
                        <select className="w-full p-2 border rounded-lg bg-gray-50 mt-2" value={selSemId} onChange={e => setSelSemId(e.target.value)}>
                           <option value="ganjil">Semester Ganjil</option>
                           <option value="genap">Semester Genap</option>
                        </select>
                        <div className="space-y-1">
                            <div className="p-2 bg-gray-100 rounded text-xs font-bold text-gray-500 uppercase">Evaluasi Semester (STS/SAS)</div>
                            {currentSemester?.exams?.map(exam => (
                                <div key={exam.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded text-sm group">
                                    <span className="truncate">{exam.title}</span>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                                        <button onClick={() => setResourceEdit({ type: 'exam', item: exam })}><Edit3 size={12} className="text-blue-500"/></button>
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
                     {resourceEdit ? (
                        <div>
                            {/* Resource Editor (Schedule, etc) */}
                            <div className="flex justify-between items-center mb-6 border-b pb-4">
                                <h2 className="text-xl font-bold">Edit Resource</h2>
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
                        <div>
                            {/* Chapter Editor */}
                            <div className="flex justify-between items-center mb-6 border-b pb-4">
                                <h2 className="text-xl font-bold">Edit Materi Bab</h2>
                                <Button onClick={handleChapterSave} className="py-2 px-4 text-sm"><Save size={16}/> Simpan</Button>
                            </div>
                            <div className="space-y-6">
                                <Input label="Judul Bab" value={chapForm.title || ''} onChange={e => setChapForm({...chapForm, title: e.target.value})}/>
                                <TextArea label="Deskripsi" value={chapForm.description || ''} onChange={e => setChapForm({...chapForm, description: e.target.value})} className="!min-h-[80px]"/>
                                {/* Simply show a note about editing content in this demo */}
                                <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm border border-yellow-200">
                                   Catatan: Dalam versi demo ini, editing konten detail (HTML) disederhanakan. Anda dapat mengedit judul dan deskripsi bab di sini.
                                </div>
                            </div>
                        </div>
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

const ExtraDetailView: React.FC<{ categoryId: string; extras: ExtraContent[]; onBack: () => void }> = ({ categoryId, extras, onBack }) => {
   const categoryTitle = {
      'doa': 'Kumpulan Doa',
      'cerita': 'Kisah Islami',
      'sholat': 'Panduan Sholat',
      'fiqih': 'Fiqih Dasar',
      'hadist': 'Hadist Pilihan',
      'ramadhan': 'Spesial Ramadhan',
      'lainnya': 'Lainnya'
   }[categoryId] || 'Materi Tambahan';

   const filteredExtras = extras.filter(e => e.category === categoryId);

   return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-4xl mx-auto px-4 py-12">
         <Button variant="secondary" onClick={onBack} className="mb-8"><ArrowLeft size={18}/> Kembali</Button>
         <SectionTitle title={categoryTitle} center />
         
         <div className="grid gap-6">
            {filteredExtras.map(item => (
               <Card key={item.id} className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{item.title}</h3>
                  {item.type === 'html' ? (
                     <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: item.content || '' }} />
                  ) : (
                     <a href={item.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-2">
                        <LinkIcon size={16}/> Buka Tautan
                     </a>
                  )}
               </Card>
            ))}
            {filteredExtras.length === 0 && (
               <div className="text-center text-gray-500 py-12">Belum ada konten untuk kategori ini.</div>
            )}
         </div>
      </motion.div>
   );
};

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.LANDING);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [selectedExtraCategory, setSelectedExtraCategory] = useState<ExtraCategory | null>(null);
  const [currentUser, setCurrentUser] = useState<Student | null>(null);
  
  // Data State
  const [classesData, setClassesData] = useState<ClassData[]>(CLASSES_DATA);
  const [extrasData, setExtrasData] = useState<ExtraContent[]>(DEFAULT_EXTRAS);
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(DEFAULT_SCHOOL_PROFILE);
  const [studentsData, setStudentsData] = useState<Student[]>(DEFAULT_STUDENTS);

  // Load data from Firebase
  useEffect(() => {
    const fetchData = async () => {
      if (!db) return; // Use local constants if db is null
      try {
        // Fetch School Profile
        const profileDoc = await getDoc(doc(db, 'school_data', 'profile'));
        if (profileDoc.exists()) setSchoolProfile(profileDoc.data() as SchoolProfile);

        // Fetch Students
        const studentsDoc = await getDoc(doc(db, 'school_data', 'students'));
        if (studentsDoc.exists()) setStudentsData(studentsDoc.data().data as Student[]);

        // Fetch Extras
        const extrasDoc = await getDoc(doc(db, 'school_data', 'extras'));
        if (extrasDoc.exists()) setExtrasData(extrasDoc.data().data as ExtraContent[]);

        // Fetch Classes
        const classesDoc = await getDoc(doc(db, 'school_data', 'classes'));
        if (classesDoc.exists()) setClassesData(classesDoc.data().data as ClassData[]);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // --- FIREBASE UPDATE HELPERS ---
  const saveToFirebase = async (collectionName: string, docName: string, data: any) => {
    if (!db) return; // Ignore if offline
    try {
      await setDoc(doc(db, collectionName, docName), data);
      console.log(`Saved ${docName} to Firebase`);
    } catch (e) {
      console.error("Error saving to Firebase", e);
      alert("Gagal menyimpan ke cloud. Cek koneksi internet.");
    }
  };

  const handleUpdateProfile = (newProfile: SchoolProfile) => {
    setSchoolProfile(newProfile);
    saveToFirebase('school_data', 'profile', newProfile);
  };

  const handleUpdateStudents = (newStudents: Student[]) => {
    setStudentsData(newStudents);
    saveToFirebase('school_data', 'students', { data: newStudents });
  };

  const handleUpdateExtras = (newExtras: ExtraContent[]) => {
    setExtrasData(newExtras);
    saveToFirebase('school_data', 'extras', { data: newExtras });
  };

  const handleUpdateClassesWhole = (newClasses: ClassData[]) => {
    setClassesData(newClasses);
    saveToFirebase('school_data', 'classes', { data: newClasses });
  };

  const handleUpdateChapter = (classId: string, semesterId: string, chapterId: string, newData: Partial<Chapter>) => {
    const newClasses = classesData.map(cls => {
        if (cls.id !== classId) return cls;
        return {
          ...cls,
          semesters: cls.semesters.map(sem => {
            if (sem.id !== semesterId) return sem;
            return {
              ...sem,
              chapters: sem.chapters.map(chap => {
                if (chap.id !== chapterId) return chap;
                return { ...chap, ...newData };
              })
            };
          })
        };
      });
      handleUpdateClassesWhole(newClasses);
  };

  const handleUpdateClass = (updatedClass: ClassData) => {
      const newClasses = classesData.map(c => c.id === updatedClass.id ? updatedClass : c);
      handleUpdateClassesWhole(newClasses);
  };

  const handleClassSelect = (id: string) => {
    setSelectedClassId(id);
    setView(ViewState.STUDENT_LOGIN);
  };

  const handleLoginSuccess = (student: Student) => {
    setCurrentUser(student);
    setView(ViewState.CLASS_DETAIL);
  };

  const handleChapterSelect = (id: string) => {
    setSelectedChapterId(id);
    setView(ViewState.CHAPTER_CONTENT);
  };
  
  const handleExtraCategorySelect = (cat: ExtraCategory) => {
     setSelectedExtraCategory(cat);
     setView(ViewState.EXTRA_DETAIL);
  };

  const renderView = () => {
    switch (view) {
      case ViewState.LANDING:
        return (
          <LandingView 
            classes={classesData} 
            extras={extrasData}
            onStart={() => {
              const element = document.getElementById('pilih-kelas');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
            onSelectClass={handleClassSelect}
            onSelectCategory={handleExtraCategorySelect}
          />
        );
      case ViewState.STUDENT_LOGIN:
        return (
          <StudentLoginView 
            targetClassId={selectedClassId!} 
            classes={classesData} 
            students={studentsData}
            onLoginSuccess={handleLoginSuccess}
            onBack={() => setView(ViewState.LANDING)}
          />
        );
      case ViewState.CLASS_DETAIL:
        return (
          <ClassDetailView 
            classData={classesData.find(c => c.id === selectedClassId)!} 
            student={currentUser}
            onBack={() => {
               setCurrentUser(null);
               setView(ViewState.LANDING);
            }}
            onSelectChapter={handleChapterSelect}
          />
        );
      case ViewState.CHAPTER_CONTENT:
         const cls = classesData.find(c => c.id === selectedClassId);
         const semester = cls?.semesters.find(s => s.chapters.some(ch => ch.id === selectedChapterId));
         const chapter = semester?.chapters.find(ch => ch.id === selectedChapterId);
         
         if (!chapter) return <div>Chapter not found</div>;

         return (
            <ChapterContentView 
               chapter={chapter}
               onBack={() => setView(ViewState.CLASS_DETAIL)}
            />
         );
      case ViewState.ADMIN_LOGIN:
         return (
            <AdminLoginView 
               onLogin={() => setView(ViewState.ADMIN_DASHBOARD)}
               onBack={() => setView(ViewState.LANDING)}
            />
         );
      case ViewState.ADMIN_DASHBOARD:
         return (
            <AdminDashboardView 
              classes={classesData}
              schoolProfile={schoolProfile}
              students={studentsData}
              extras={extrasData}
              onUpdateChapter={handleUpdateChapter}
              onUpdateClass={handleUpdateClass}
              onUpdateProfile={handleUpdateProfile}
              onUpdateStudents={handleUpdateStudents}
              onUpdateExtras={handleUpdateExtras}
              onLogout={() => setView(ViewState.LANDING)}
            />
         );
      case ViewState.EXTRA_DETAIL:
         return (
            <ExtraDetailView 
               categoryId={selectedExtraCategory!}
               extras={extrasData}
               onBack={() => setView(ViewState.LANDING)}
            />
         );
      default:
        return <div>View not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white font-sans text-gray-800 selection:bg-blue-200 selection:text-blue-900">
      <Navbar 
         schoolName={schoolProfile.name} 
         goHome={() => setView(ViewState.LANDING)}
         goAdmin={() => setView(ViewState.ADMIN_LOGIN)}
      />
      <main className="pt-24 pb-20 min-h-screen">
        <AnimatePresence mode="wait">
          {renderView()}
        </AnimatePresence>
      </main>
      <Footer 
         profile={schoolProfile} 
         onAdminClick={() => setView(ViewState.ADMIN_LOGIN)}
      />
    </div>
  );
};

export default App;