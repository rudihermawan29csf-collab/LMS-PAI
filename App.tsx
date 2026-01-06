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
  ChevronUp,
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
  MonitorPlay,
  Home,
  CloudSun,
  Compass,
  Star,
  LogIn,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown
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

  const [times, setTimes] = useState<any>(fallbackTimes);
  const [locationName, setLocationName] = useState('Jakarta (Def)');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [nextPrayer, setNextPrayer] = useState<string>('Memuat...');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    if (navigator.geolocation) {
      setLocationName('Lokasi...');
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
             setLocationName('Jakarta (Off)');
          }
        } catch (error) {
          setLocationName("Jakarta (Off)");
        }
      }, (error) => {
        setLocationName("Jakarta (Def)");
      });
    }
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (times) {
      const now = new Date();
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

      if (!targetPrayer) {
        const p = prayerList[0];
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
        const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);
        setNextPrayer(`Menuju ${targetPrayer} ${diffHrs}:${diffMins}:${diffSecs}`);
      }
    }
  }, [times, currentTime]);

  const formatTimeOnly = (t: string) => t ? t.split(' ')[0] : '-';

  return (
    <div className="w-full mb-8 transform hover:scale-[1.02] transition-transform duration-500">
      <div className="bg-gradient-to-r from-orange-400 via-pink-500 to-rose-500 rounded-3xl p-6 shadow-2xl text-white relative overflow-hidden">
         {/* Decorative circles */}
         <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-2xl"></div>
         <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-300/20 rounded-full blur-xl"></div>

         <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            {/* Left: Current Time & Next Prayer */}
            <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 text-orange-100 text-sm font-medium mb-1">
                    <MapPin size={14} /> {locationName}
                </div>
                <div className="text-4xl font-bold tracking-tight mb-2">
                    {currentTime.toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}
                </div>
                <div className="inline-block bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-semibold border border-white/30">
                    {nextPrayer}
                </div>
            </div>

            {/* Right: Prayer Grid */}
            {times && (
                <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide justify-center">
                    {[
                    { name: 'Subuh', time: times.Fajr, icon: <CloudSun size={14}/> },
                    { name: 'Dzuhur', time: times.Dhuhr, icon: <Sun size={14}/> },
                    { name: 'Ashar', time: times.Asr, icon: <Sun size={14}/> },
                    { name: 'Maghrib', time: times.Maghrib, icon: <Moon size={14}/> },
                    { name: 'Isya', time: times.Isha, icon: <Moon size={14}/> },
                    ].map((item) => (
                    <div key={item.name} className="flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/20 min-w-[70px]">
                        <span className="text-white/80 mb-1">{item.icon}</span>
                        <span className="text-[10px] uppercase font-bold text-white/70 tracking-wider mb-1">{item.name}</span>
                        <span className="text-sm font-bold text-white">{formatTimeOnly(item.time)}</span>
                    </div>
                    ))}
                </div>
            )}
         </div>
      </div>
    </div>
  );
};

const RobotGreeting: React.FC<{ greetingText: string }> = ({ greetingText }) => (
  <div className="max-w-3xl mx-auto mb-8 flex flex-col items-center gap-6 animate-fade-in-up">
    <div className="relative group cursor-pointer">
       <div className="w-20 h-20 bg-gradient-to-b from-white to-gray-100 rounded-2xl border border-white/50 shadow-xl flex items-center justify-center relative z-10 animate-bounce-slow">
          <div className="flex gap-3">
             <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
             <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse delay-75"></div>
          </div>
       </div>
    </div>
    <div className="bg-white/40 backdrop-blur-xl p-5 rounded-2xl border border-white/40 shadow-lg text-center">
       <p className="text-gray-700 font-medium leading-relaxed italic text-base">
         "{greetingText || 'Selamat datang.'}"
       </p>
    </div>
  </div>
);

const TrafficLights = () => (
  <div className="flex items-center gap-2 mb-8 px-4">
    <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E] shadow-sm"></div>
    <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] shadow-sm"></div>
    <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29] shadow-sm"></div>
  </div>
);

const RichHtmlContent: React.FC<{ content: string; className?: string; iframeHeight?: string }> = ({ content, className = '', iframeHeight = 'h-[800px]' }) => {
  const isComplexContent = /<script|<style|<iframe/i.test(content);

  if (isComplexContent) {
    return (
      <div className={`w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ${className}`}>
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

const AdminContentEditor: React.FC<{ chapter: Chapter; onSave: (updatedChapter: Chapter) => void }> = ({ chapter, onSave }) => {
    const [formData, setFormData] = useState<Chapter>(chapter);
    const [previewId, setPreviewId] = useState<string | null>(null);

    useEffect(() => { setFormData(chapter); }, [chapter]);
    const handleSave = () => { onSave(formData); alert('Perubahan materi bab berhasil disimpan!'); };
    
    // --- Move Helper Functions ---
    const moveItem = (index: number, direction: 'up' | 'down', type: 'contents' | 'videos' | 'quizzes') => {
        const list = [...formData[type]] as any[];
        if (direction === 'up' && index > 0) {
            [list[index], list[index - 1]] = [list[index - 1], list[index]];
        } else if (direction === 'down' && index < list.length - 1) {
            [list[index], list[index + 1]] = [list[index + 1], list[index]];
        }
        setFormData({ ...formData, [type]: list });
    };

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
        
        {/* Konten Materi */}
        <div className="space-y-4">
          <Input label="Judul Bab" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
          <TextArea label="Deskripsi Singkat" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center border-t pt-4">
            <h3 className="font-bold flex items-center gap-2"><BookOpen size={18} /> Bagian Materi (HTML/Tautan)</h3>
            <button onClick={addContent} className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200">+ Tambah</button>
          </div>
          {formData.contents.map((section, index) => (
            <div key={section.id} className="p-4 border rounded-xl bg-gray-50 relative group">
              <div className="absolute top-2 right-2 flex gap-1">
                  <button onClick={() => moveItem(index, 'up', 'contents')} disabled={index === 0} className="p-1 bg-gray-200 hover:bg-gray-300 rounded text-gray-600 disabled:opacity-30"><ArrowUp size={14}/></button>
                  <button onClick={() => moveItem(index, 'down', 'contents')} disabled={index === formData.contents.length - 1} className="p-1 bg-gray-200 hover:bg-gray-300 rounded text-gray-600 disabled:opacity-30"><ArrowDown size={14}/></button>
                  <button onClick={() => deleteContent(section.id)} className="p-1 bg-red-100 hover:bg-red-200 rounded text-red-500"><Trash2 size={14}/></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3 mt-4 sm:mt-0">
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
                <>
                    <TextArea placeholder="Source Code HTML" value={section.content || ''} onChange={e => updateContent(section.id, { content: e.target.value })} className="font-mono text-sm" />
                    {section.content && (
                        <div className="mt-2">
                            <button onClick={() => setPreviewId(previewId === section.id ? null : section.id)} className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700">
                                {previewId === section.id ? <EyeOff size={14}/> : <Eye size={14}/>} {previewId === section.id ? 'Tutup Preview' : 'Lihat Preview'}
                            </button>
                            {previewId === section.id && (
                                <div className="mt-2 p-2 border border-blue-200 rounded-lg bg-white">
                                    <RichHtmlContent content={section.content} />
                                </div>
                            )}
                        </div>
                    )}
                </>
              }
            </div>
          ))}
        </div>

        {/* Video */}
        <div className="space-y-4">
          <div className="flex justify-between items-center border-t pt-4">
            <h3 className="font-bold flex items-center gap-2"><Youtube size={18} /> Video Pembelajaran</h3>
            <button onClick={addVideo} className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200">+ Tambah</button>
          </div>
          {formData.videos.map((v, index) => (
            <div key={v.id} className="p-4 border rounded-xl bg-gray-50 relative group">
              <div className="absolute top-2 right-2 flex gap-1">
                  <button onClick={() => moveItem(index, 'up', 'videos')} disabled={index === 0} className="p-1 bg-gray-200 hover:bg-gray-300 rounded text-gray-600 disabled:opacity-30"><ArrowUp size={14}/></button>
                  <button onClick={() => moveItem(index, 'down', 'videos')} disabled={index === formData.videos.length - 1} className="p-1 bg-gray-200 hover:bg-gray-300 rounded text-gray-600 disabled:opacity-30"><ArrowDown size={14}/></button>
                  <button onClick={() => deleteVideo(v.id)} className="p-1 bg-red-100 hover:bg-red-200 rounded text-red-500"><Trash2 size={14}/></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3 mt-4 sm:mt-0">
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

        {/* Kuis */}
        <div className="space-y-4">
          <div className="flex justify-between items-center border-t pt-4">
            <h3 className="font-bold flex items-center gap-2"><Gamepad size={18} /> Kuis Interaktif</h3>
            <button onClick={addQuiz} className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded hover:bg-green-200">+ Tambah</button>
          </div>
          {formData.quizzes.map((q, index) => (
            <div key={q.id} className="p-4 border rounded-xl bg-gray-50 relative group">
              <div className="absolute top-2 right-2 flex gap-1">
                  <button onClick={() => moveItem(index, 'up', 'quizzes')} disabled={index === 0} className="p-1 bg-gray-200 hover:bg-gray-300 rounded text-gray-600 disabled:opacity-30"><ArrowUp size={14}/></button>
                  <button onClick={() => moveItem(index, 'down', 'quizzes')} disabled={index === formData.quizzes.length - 1} className="p-1 bg-gray-200 hover:bg-gray-300 rounded text-gray-600 disabled:opacity-30"><ArrowDown size={14}/></button>
                  <button onClick={() => deleteQuiz(q.id)} className="p-1 bg-red-100 hover:bg-red-200 rounded text-red-500"><Trash2 size={14}/></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3 mt-4 sm:mt-0">
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
                  <>
                    <TextArea label="Kode Embed HTML" value={q.content || ''} onChange={e => updateQuiz(q.id, { content: e.target.value })} className="font-mono text-xs h-24" placeholder="<iframe...>" />
                    {q.content && (
                        <div className="mt-2">
                            <button onClick={() => setPreviewId(previewId === q.id ? null : q.id)} className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                                {previewId === q.id ? <EyeOff size={14}/> : <Eye size={14}/>} {previewId === q.id ? 'Tutup Preview' : 'Lihat Preview Full'}
                            </button>
                            {previewId === q.id && (
                                <div className="fixed inset-0 z-[100] bg-white p-6 overflow-auto">
                                    <div className="max-w-7xl mx-auto">
                                        <div className="flex justify-between items-center mb-4 border-b pb-4">
                                            <h3 className="text-xl font-bold">Preview: {q.title}</h3>
                                            <button onClick={() => setPreviewId(null)} className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-bold hover:bg-gray-200">Tutup</button>
                                        </div>
                                        <RichHtmlContent content={q.content} iframeHeight="h-[85vh]"/>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                  </>
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
  onUpdateClassResourceByGrade: (gradeLevel: string, resourceType: 'exam', item: ResourceItem, semesterId?: string) => void;
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
  const [resourceEdit, setResourceEdit] = useState<{ type: 'globalSchedule' | 'globalGrades' | 'exam', item: ResourceItem, semesterId?: 'ganjil'|'genap' } | null>(null);
  const [showResourcePreview, setShowResourcePreview] = useState(false);

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
    const { type, item, semesterId } = resourceEdit;
    
    if (type === 'globalSchedule') {
        onUpdateProfile({ ...schoolProfile, globalSchedule: item });
        setProfileForm({ ...profileForm, globalSchedule: item }); // Update local form state too
    } else if (type === 'globalGrades') {
        onUpdateProfile({ ...schoolProfile, globalGrades: item });
        setProfileForm({ ...profileForm, globalGrades: item });
    } else if (type === 'exam') {
        onUpdateClassResourceByGrade(selGrade, 'exam', item, semesterId);
    }
    setResourceEdit(null);
    setShowResourcePreview(false);
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
               {/* Profile Tab */}
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

               {/* Personalization Tab */}
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

               {/* Students Tab */}
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
                    {/* ... (student table and form) ... */}
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

               {/* Schedule & Grades Tab */}
               {tab === 'schedule' && (
                  <Card>
                      <SectionTitle title="Jadwal, Nilai & Soal" subtitle="Kelola jadwal pelajaran global, rekap nilai, dan bank soal per semester." />
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          {/* ... (same as before) ... */}
                          <div>
                                {/* Global Section */}
                                <div className="space-y-6 mb-8">
                                    <h3 className="font-bold text-gray-800 flex items-center gap-2"><School size={18} className="text-blue-500"/> Informasi Global (Semua Kelas)</h3>
                                    <div className="space-y-3">
                                        <button onClick={() => setResourceEdit({ type: 'globalSchedule', item: schoolProfile.globalSchedule || { id: 'gl-sch', title: 'Jadwal Pelajaran Universal', type: 'link', url: '' } })} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${resourceEdit?.type === 'globalSchedule' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white border border-gray-100 hover:border-blue-200 text-gray-700'}`}>
                                            <div className="flex items-center gap-3"><CalendarRange size={20}/><span className="font-bold">Jadwal Pelajaran</span></div>
                                            <ChevronRight size={18} className={resourceEdit?.type === 'globalSchedule' ? 'text-white' : 'text-gray-300'}/>
                                        </button>
                                        <button onClick={() => setResourceEdit({ type: 'globalGrades', item: schoolProfile.globalGrades || { id: 'gl-grd', title: 'Rekap Nilai Universal', type: 'link', url: '' } })} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${resourceEdit?.type === 'globalGrades' ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' : 'bg-white border border-gray-100 hover:border-green-200 text-gray-700'}`}>
                                            <div className="flex items-center gap-3"><GraduationCap size={20}/><span className="font-bold">Rekapitulasi Nilai</span></div>
                                            <ChevronRight size={18} className={resourceEdit?.type === 'globalGrades' ? 'text-white' : 'text-gray-300'}/>
                                        </button>
                                    </div>
                                </div>

                                {/* Bank Soal per Kelas Section */}
                                <div>
                                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Filter size={18} className="text-blue-500"/> Bank Soal per Kelas</h3>
                                    <div className="mb-4">
                                        <select 
                                            className="w-full p-4 rounded-2xl border border-gray-200 bg-white font-bold text-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                                            value={selClassId}
                                            onChange={(e) => { setSelClassId(e.target.value); if(resourceEdit?.type === 'exam') setResourceEdit(null); }}
                                        >
                                            {classes.sort((a,b)=>a.id.localeCompare(b.id)).map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    {currentClass && (
                                        <div className="space-y-4">
                                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                                <div className="flex justify-between items-center mb-3">
                                                    <span className="font-bold text-gray-700 text-sm">Semester Ganjil</span>
                                                    <button onClick={() => setResourceEdit({ type: 'exam', item: { id: `exam-${Date.now()}`, title: 'Soal Baru', type: 'link', url: '' }, semesterId: 'ganjil' })} className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200 font-bold border border-blue-200 shadow-sm">+ Tambah</button>
                                                </div>
                                                <div className="space-y-2">
                                                    {semGanjil?.exams?.map(ex => (
                                                        <div key={ex.id} className={`flex justify-between items-center bg-white p-3 rounded-lg border transition-all ${resourceEdit?.item.id === ex.id ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200 hover:border-blue-300'}`}>
                                                            <div className="flex items-center gap-2 overflow-hidden">
                                                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${ex.type === 'link' ? 'bg-orange-400' : 'bg-purple-400'}`}></div>
                                                                <span className="text-sm font-medium text-gray-700 truncate">{ex.title}</span>
                                                            </div>
                                                            <div className="flex gap-1 flex-shrink-0">
                                                                <button onClick={() => setResourceEdit({ type: 'exam', item: ex, semesterId: 'ganjil' })} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition-colors"><Edit3 size={14}/></button>
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
                                                    <button onClick={() => setResourceEdit({ type: 'exam', item: { id: `exam-${Date.now()}`, title: 'Soal Baru', type: 'link', url: '' }, semesterId: 'genap' })} className="text-xs bg-emerald-100 text-emerald-600 px-2 py-1 rounded hover:bg-emerald-200 font-bold border border-emerald-200 shadow-sm">+ Tambah</button>
                                                </div>
                                                <div className="space-y-2">
                                                    {semGenap?.exams?.map(ex => (
                                                        <div key={ex.id} className={`flex justify-between items-center bg-white p-3 rounded-lg border transition-all ${resourceEdit?.item.id === ex.id ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-gray-200 hover:border-emerald-300'}`}>
                                                            <div className="flex items-center gap-2 overflow-hidden">
                                                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${ex.type === 'link' ? 'bg-orange-400' : 'bg-purple-400'}`}></div>
                                                                <span className="text-sm font-medium text-gray-700 truncate">{ex.title}</span>
                                                            </div>
                                                            <div className="flex gap-1 flex-shrink-0">
                                                                <button onClick={() => setResourceEdit({ type: 'exam', item: ex, semesterId: 'genap' })} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition-colors"><Edit3 size={14}/></button>
                                                                <button onClick={() => onDeleteClassResource(selGrade, 'exam', ex.id, 'genap')} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"><Trash2 size={14}/></button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {(!semGenap?.exams || semGenap.exams.length === 0) && <p className="text-xs text-gray-400 italic text-center py-2">Belum ada soal.</p>}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                          </div>
                          
                          {/* Editor Section */}
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
                                              <>
                                                <TextArea label="HTML Content" value={resourceEdit.item.content || ''} onChange={e => setResourceEdit({...resourceEdit, item: {...resourceEdit.item, content: e.target.value}})} className="font-mono text-xs h-40"/>
                                                {resourceEdit.item.content && (
                                                    <div className="mt-2">
                                                        <button onClick={() => setShowResourcePreview(!showResourcePreview)} className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                                                            {showResourcePreview ? <EyeOff size={14}/> : <Eye size={14}/>} {showResourcePreview ? 'Tutup Preview' : 'Lihat Preview Full'}
                                                        </button>
                                                        {showResourcePreview && (
                                                            <div className="fixed inset-0 z-[100] bg-white p-6 overflow-auto">
                                                                <div className="max-w-7xl mx-auto">
                                                                    <div className="flex justify-between items-center mb-4 border-b pb-4">
                                                                        <h3 className="text-xl font-bold">Preview: {resourceEdit.item.title}</h3>
                                                                        <button onClick={() => setShowResourcePreview(false)} className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-bold hover:bg-gray-200">Tutup</button>
                                                                    </div>
                                                                    <RichHtmlContent content={resourceEdit.item.content || ''} iframeHeight="h-[85vh]"/>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                              </>
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

               {/* Extras Tab */}
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

const StudentLoginView: React.FC<{
  initialClassId: string | null;
  classes: ClassData[];
  students: Student[];
  onLoginSuccess: (student: Student, classId: string) => void;
  onBack: () => void;
}> = ({ initialClassId, classes, students, onLoginSuccess, onBack }) => {
  const [selectedClassId, setSelectedClassId] = useState(initialClassId || (classes[0]?.id || ''));
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter students based on class and search
  const classStudents = students.filter(s => s.classId === selectedClassId);
  const filteredStudents = classStudents.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.nis.includes(searchQuery)
  );

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6">
        <Button variant="secondary" onClick={onBack} className="mb-4 text-sm py-2 px-4">
          <ArrowLeft size={16} /> Kembali
        </Button>
        <SectionTitle title="Masuk Kelas" subtitle="Pilih namamu untuk mulai belajar." />
      </div>

      <Card>
        <div className="mb-6">
           <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Kelas</label>
           <div className="relative">
             <select 
               className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 appearance-none font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
               value={selectedClassId}
               onChange={(e) => { setSelectedClassId(e.target.value); setSearchQuery(''); }}
             >
               {classes.map(c => (
                 <option key={c.id} value={c.id}>{c.name}</option>
               ))}
             </select>
             <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
           </div>
        </div>

        <div className="mb-4">
          <div className="relative">
            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Cari namamu atau NIS..." 
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-gray-200">
          {filteredStudents.length > 0 ? (
            filteredStudents.map(student => (
              <button
                key={student.id}
                onClick={() => onLoginSuccess(student, selectedClassId)}
                className="w-full text-left p-4 rounded-xl hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all group flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-gray-700 group-hover:text-blue-700">{student.name}</div>
                  <div className="text-xs text-gray-400 font-mono">{student.nis}</div>
                </div>
                <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-500" />
              </button>
            ))
          ) : (
             <div className="text-center py-8 text-gray-400 text-sm">
               Siswa tidak ditemukan. <br/> Coba cari nama lain.
             </div>
          )}
        </div>
      </Card>
    </div>
  );
};

const ClassDetailView: React.FC<{
  classData: ClassData;
  student: Student | null;
  onBack: () => void;
  onSelectChapter: (chapterId: string) => void;
}> = ({ classData, student, onBack, onSelectChapter }) => {
  const [activeSemester, setActiveSemester] = useState<'ganjil' | 'genap'>('ganjil');

  const semesterData = classData.semesters.find(s => s.id === activeSemester);

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
           <Button variant="secondary" onClick={onBack} className="mb-4 text-sm py-2 px-4">
             <ArrowLeft size={16} /> Keluar Kelas
           </Button>
           <h1 className="text-3xl font-bold text-gray-800">{classData.name}</h1>
           <p className="text-gray-500 flex items-center gap-2">
             <User size={16} /> Halo, <span className="font-semibold text-gray-700">{student?.name || 'Siswa'}</span>
           </p>
        </div>
        <div className="flex bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm">
           <button 
             onClick={() => setActiveSemester('ganjil')}
             className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeSemester === 'ganjil' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
           >
             Semester Ganjil
           </button>
           <button 
             onClick={() => setActiveSemester('genap')}
             className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeSemester === 'genap' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
           >
             Semester Genap
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Main Content (Chapters) */}
         <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3 mb-2">
               <div className={`p-2 rounded-lg ${activeSemester === 'ganjil' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                 <BookOpen size={20} />
               </div>
               <h2 className="text-xl font-bold text-gray-800">Daftar Materi</h2>
            </div>
            
            {semesterData?.chapters.map((chapter, index) => (
              <div 
                key={chapter.id}
                onClick={() => onSelectChapter(chapter.id)}
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group relative overflow-hidden"
              >
                 <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${activeSemester === 'ganjil' ? 'bg-blue-500' : 'bg-emerald-500'}`}></div>
                 <div className="flex justify-between items-start pl-4">
                    <div>
                       <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${activeSemester === 'ganjil' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                         Bab {index + (activeSemester === 'genap' ? 6 : 1)}
                       </span>
                       <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-blue-700 transition-colors">{chapter.title}</h3>
                       <p className="text-sm text-gray-500 line-clamp-2">{chapter.description}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-full group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                       <Play size={20} fill="currentColor" className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                 </div>
              </div>
            ))}
         </div>

         {/* Sidebar (Exams & Stats) */}
         <div className="space-y-6">
             {/* Exams Card */}
             <Card className="border-t-4 border-t-orange-400">
                <div className="flex items-center gap-3 mb-6">
                   <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><FileQuestion size={20}/></div>
                   <h3 className="font-bold text-gray-800">Ujian & Evaluasi</h3>
                </div>
                <div className="space-y-3">
                   {semesterData?.exams && semesterData.exams.length > 0 ? (
                     semesterData.exams.map(exam => (
                       <a 
                         key={exam.id}
                         href={exam.url || '#'}
                         target={exam.type === 'link' ? "_blank" : "_self"}
                         className="flex items-center gap-3 p-3 rounded-xl bg-orange-50 border border-orange-100 hover:bg-orange-100 transition-colors group"
                       >
                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-orange-500 shadow-sm group-hover:scale-110 transition-transform">
                            {exam.type === 'link' ? <ExternalLink size={14}/> : <FileText size={14}/>}
                          </div>
                          <span className="text-sm font-bold text-gray-700 group-hover:text-orange-800">{exam.title}</span>
                       </a>
                     ))
                   ) : (
                     <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-sm text-gray-400 italic">Belum ada ujian aktif.</p>
                     </div>
                   )}
                </div>
             </Card>

             {/* Resources Card */}
             <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none">
                <h3 className="font-bold text-lg mb-2">Butuh Bantuan?</h3>
                <p className="text-indigo-100 text-sm mb-4">Jika mengalami kendala teknis atau materi, silakan hubungi guru pengampu.</p>
                <button className="w-full py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl text-sm font-bold hover:bg-white/30 transition-colors flex items-center justify-center gap-2">
                   <MessageCircle size={16}/> Hubungi Guru
                </button>
             </Card>
         </div>
      </div>
    </div>
  );
};

const ChapterContentView: React.FC<{
  chapter: Chapter;
  onBack: () => void;
}> = ({ chapter, onBack }) => {
  const [activeTab, setActiveTab] = useState<'materi' | 'video' | 'kuis'>('materi');
  // State for Accordion
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);

  const toggleSection = (id: string) => {
    setExpandedSectionId(expandedSectionId === id ? null : id);
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in-up">
       <div className="mb-6">
          <Button variant="secondary" onClick={onBack} className="mb-4 text-sm py-2 px-4">
             <ArrowLeft size={16} /> Kembali ke Daftar Bab
          </Button>
          <div className="flex items-center gap-3 mb-2">
             <Badge color="blue">Materi Pembelajaran</Badge>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">{chapter.title}</h1>
       </div>

       {/* Tabs */}
       <div className="flex border-b border-gray-200 mb-8 overflow-x-auto scrollbar-hide">
          {[
            { id: 'materi', label: 'Rangkuman Materi', icon: <BookOpen size={18}/> },
            { id: 'video', label: 'Video Pembelajaran', icon: <Youtube size={18}/> },
            { id: 'kuis', label: 'Kuis & Latihan', icon: <Gamepad size={18}/> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); setExpandedSectionId(null); }} // Reset expanded on tab change
              className={`flex items-center gap-2 px-6 py-4 border-b-2 font-bold text-sm whitespace-nowrap transition-all ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              {tab.icon}
              {tab.label}
              <span className={`ml-2 text-xs py-0.5 px-2 rounded-full ${activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                {tab.id === 'materi' ? chapter.contents.length : tab.id === 'video' ? chapter.videos.length : chapter.quizzes.length}
              </span>
            </button>
          ))}
       </div>

       {/* Content Area - ACCORDION STYLE */}
       <div className="min-h-[400px]">
          {activeTab === 'materi' && (
            <div className="space-y-4 animate-fade-in">
               {chapter.contents.map((section) => (
                 <div key={section.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm transition-all hover:shadow-md">
                    <button 
                        onClick={() => toggleSection(section.id)}
                        className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${expandedSectionId === section.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                                <BookOpen size={20}/>
                            </div>
                            <h3 className={`text-lg font-bold ${expandedSectionId === section.id ? 'text-blue-700' : 'text-gray-800'}`}>{section.title}</h3>
                        </div>
                        {expandedSectionId === section.id ? <ChevronUp size={20} className="text-blue-500"/> : <ChevronDown size={20} className="text-gray-400"/>}
                    </button>
                    
                    {expandedSectionId === section.id && (
                        <div className="p-8 border-t border-gray-100 bg-gray-50/30">
                            {section.type === 'link' ? (
                                <div className="text-center py-6">
                                    <ExternalLink size={40} className="mx-auto text-gray-300 mb-4"/>
                                    <p className="text-gray-600 mb-4">Materi ini tersedia di tautan eksternal.</p>
                                    <a href={section.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">Buka Materi</a>
                                </div>
                            ) : (
                                <RichHtmlContent content={section.content} />
                            )}
                        </div>
                    )}
                 </div>
               ))}
               {chapter.contents.length === 0 && <div className="text-center py-12 text-gray-400">Belum ada materi teks untuk bab ini.</div>}
            </div>
          )}

          {activeTab === 'video' && (
            <div className="space-y-4 animate-fade-in">
               {chapter.videos.map(video => (
                 <div key={video.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm transition-all hover:shadow-md">
                    <button 
                        onClick={() => toggleSection(video.id)}
                        className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${expandedSectionId === video.id ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                                <Youtube size={20}/>
                            </div>
                            <h3 className={`text-lg font-bold ${expandedSectionId === video.id ? 'text-red-700' : 'text-gray-800'}`}>{video.title}</h3>
                        </div>
                        {expandedSectionId === video.id ? <ChevronUp size={20} className="text-red-500"/> : <ChevronDown size={20} className="text-gray-400"/>}
                    </button>

                    {expandedSectionId === video.id && (
                         <div className="p-6 border-t border-gray-100 bg-gray-900">
                             <div className="aspect-video w-full flex items-center justify-center relative rounded-xl overflow-hidden bg-black">
                                {video.type === 'html' ? (
                                    <div className="w-full h-full" dangerouslySetInnerHTML={{__html: video.content || ''}} />
                                ) : (
                                    <>
                                        {getYoutubeId(video.url) ? (
                                            <iframe 
                                                width="100%" 
                                                height="100%" 
                                                src={`https://www.youtube.com/embed/${getYoutubeId(video.url)}`} 
                                                title={video.title}
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            ></iframe>
                                        ) : (
                                            <div className="flex flex-col items-center text-white/50">
                                                <MonitorPlay size={48} className="mb-2"/>
                                                <span className="text-sm">Video External</span>
                                                <a href={video.url} target="_blank" rel="noreferrer" className="mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white font-bold text-sm">Buka Video</a>
                                            </div>
                                        )}
                                    </>
                                )}
                             </div>
                         </div>
                    )}
                 </div>
               ))}
               {chapter.videos.length === 0 && <div className="text-center py-12 text-gray-400">Belum ada video pembelajaran untuk bab ini.</div>}
            </div>
          )}

          {activeTab === 'kuis' && (
            <div className="space-y-4 animate-fade-in">
               {chapter.quizzes.map(quiz => (
                 <div key={quiz.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm transition-all hover:shadow-md border-l-4 border-l-purple-500">
                    <button 
                        onClick={() => toggleSection(quiz.id)}
                        className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${expandedSectionId === quiz.id ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'}`}>
                                <Gamepad size={20}/>
                            </div>
                            <h3 className={`text-lg font-bold ${expandedSectionId === quiz.id ? 'text-purple-700' : 'text-gray-800'}`}>{quiz.title}</h3>
                        </div>
                        {expandedSectionId === quiz.id ? <ChevronUp size={20} className="text-purple-500"/> : <ChevronDown size={20} className="text-gray-400"/>}
                    </button>
                    
                    {expandedSectionId === quiz.id && (
                        <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                             {quiz.type === 'html' ? (
                                 <div className="w-full overflow-hidden rounded-lg bg-white border border-gray-200 shadow-inner">
                                    <RichHtmlContent content={quiz.content || ''} iframeHeight="h-[85vh]" />
                                 </div>
                             ) : (
                                 <div className="text-center py-8">
                                     <p className="text-gray-600 mb-6">Silakan kerjakan kuis melalui tautan berikut:</p>
                                     <a href={quiz.url} target="_blank" rel="noreferrer" className="inline-block w-full sm:w-auto px-8 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200">
                                       Mulai Kuis
                                     </a>
                                 </div>
                             )}
                        </div>
                    )}
                 </div>
               ))}
               {chapter.quizzes.length === 0 && <div className="col-span-full text-center py-12 text-gray-400">Belum ada kuis untuk bab ini.</div>}
            </div>
          )}
       </div>
    </div>
  );
};

// --- APP COMPONENT ---

const App: React.FC = () => {
  // --- STATE ---
  const [view, setView] = useState<ViewState>(ViewState.LANDING);
  const [activeTab, setActiveTab] = useState('beranda');
  
  // Data State
  const [profile, setProfile] = useState<SchoolProfile>(DEFAULT_SCHOOL_PROFILE);
  const [classes, setClasses] = useState<ClassData[]>(CLASSES_DATA);
  const [extras, setExtras] = useState<ExtraContent[]>(DEFAULT_EXTRAS);
  const [students, setStudents] = useState<Student[]>(DEFAULT_STUDENTS);

  // Selection State
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ExtraCategory | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<Student | null>(null);
  
  // UI State
  const [expandedGrade, setExpandedGrade] = useState<string | null>(null);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [showGlobalContent, setShowGlobalContent] = useState<ResourceItem | null>(null);
  
  // Literacy Accordion State
  const [expandedExtraId, setExpandedExtraId] = useState<string | null>(null);

  // ... (Effects and Handlers remain the same)
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!db) return; 

        // 1. Fetch Profile
        const profileDoc = await getDoc(doc(db, 'settings', 'schoolProfile'));
        if (profileDoc.exists()) {
             setProfile(profileDoc.data() as SchoolProfile);
        }

        // 2. Fetch Classes (CRITICAL FOR ONLINE DATA)
        const classesSnap = await getDocs(collection(db, 'classes'));
        if (!classesSnap.empty) {
            const loadedClasses: ClassData[] = [];
            classesSnap.forEach(doc => loadedClasses.push(doc.data() as ClassData));
            setClasses(loadedClasses);
            console.log("Classes loaded from Firebase:", loadedClasses.length);
        } else {
            // First time online: Upload default classes to Firestore
            console.log("Classes collection empty. Uploading defaults...");
            const batch = writeBatch(db);
            CLASSES_DATA.forEach(c => {
                const ref = doc(db, 'classes', c.id);
                batch.set(ref, c);
            });
            await batch.commit();
            console.log("Default classes uploaded.");
        }

        // 3. Fetch Students
        const studentsSnap = await getDocs(collection(db, 'students'));
        if (!studentsSnap.empty) {
            const loadedStudents: Student[] = [];
            studentsSnap.forEach(doc => loadedStudents.push(doc.data() as Student));
            setStudents(loadedStudents);
        }

        // 4. Fetch Extras
        const extrasSnap = await getDocs(collection(db, 'extras'));
        if (!extrasSnap.empty) {
            const loadedExtras: ExtraContent[] = [];
            extrasSnap.forEach(doc => loadedExtras.push(doc.data() as ExtraContent));
            setExtras(loadedExtras);
        }

      } catch (e) {
        console.warn("Using offline data", e);
      }
    };
    fetchData();
  }, []);

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

  // --- HANDLERS (PERSISTENCE) ---
  const handleUpdateProfile = async (p: SchoolProfile) => { setProfile(p); if(db) await setDoc(doc(db, 'settings', 'schoolProfile'), p); };
  const handleUpdateClass = async (c: ClassData) => { setClasses(prev => prev.map(p => p.id === c.id ? c : p)); if(db) await setDoc(doc(db, 'classes', c.id), c); };
  const handleSaveStudent = async (s: Student) => { setStudents(prev => { const idx = prev.findIndex(p => p.id === s.id); if (idx > -1) { const n = [...prev]; n[idx] = s; return n; } return [...prev, s]; }); if(db) await setDoc(doc(db, 'students', s.id), s); };
  const handleDeleteStudent = async (id: string) => { setStudents(prev => prev.filter(s => s.id !== id)); if(db) await deleteDoc(doc(db, 'students', id)); };
  const handleSaveExtra = async (e: ExtraContent) => { setExtras(prev => { const idx = prev.findIndex(p => p.id === e.id); if (idx > -1) { const n = [...prev]; n[idx] = e; return n; } return [...prev, e]; }); if(db) await setDoc(doc(db, 'extras', e.id), e); };
  const handleDeleteExtra = async (id: string) => { setExtras(prev => prev.filter(e => e.id !== id)); if(db) await deleteDoc(doc(db, 'extras', id)); };
  const handleUpdateChapter = async (grade: string, semId: string, chapId: string, data: Partial<Chapter>) => {
    const newClasses = classes.map(c => {
      if (c.gradeLevel === grade) {
        return {
          ...c,
          semesters: c.semesters.map(s => {
            if (s.id === semId) {
              return { ...s, chapters: s.chapters.map(ch => ch.id === chapId ? { ...ch, ...data } : ch) };
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
      classesToUpdate.forEach(c => { const ref = doc(db, 'classes', c.id); batch.set(ref, c); });
      await batch.commit();
    }
  };
  const handleUpdateResource = async (grade: string, type: 'exam', item: ResourceItem, semId?: string) => {
      const newClasses = classes.map(c => {
          if (c.gradeLevel === grade) {
              if (type === 'exam') {
                  return {
                      ...c,
                      semesters: c.semesters.map(s => {
                          if (s.id === semId) {
                              const exams = s.exams ? [...s.exams] : [];
                              const idx = exams.findIndex(e => e.id === item.id);
                              if (idx > -1) exams[idx] = item; else exams.push(item);
                              return { ...s, exams };
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
        classesToUpdate.forEach(c => { const ref = doc(db, 'classes', c.id); batch.set(ref, c); });
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
                          return { ...sem, exams: sem.exams?.filter(e => e.id !== itemId) || [] };
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
        classesToUpdate.forEach(c => { const ref = doc(db, 'classes', c.id); batch.set(ref, c); });
        await batch.commit();
      }
  };

  const handleSelectClass = (classId: string) => { setSelectedClassId(classId); setView(ViewState.STUDENT_LOGIN); };
  const handleSelectCategory = (category: ExtraCategory) => { setSelectedCategory(category); setView(ViewState.EXTRA_CATEGORY_LIST); };
  const handleAdminLogin = () => { setView(ViewState.ADMIN_LOGIN); };
  const groupedClasses = classes.reduce((acc, curr) => {
    const grade = curr.gradeLevel;
    if (!acc[grade]) acc[grade] = [];
    acc[grade].push(curr);
    return acc;
  }, {} as Record<string, ClassData[]>);
  const toggleGrade = (grade: string) => setExpandedGrade(expandedGrade === grade ? null : grade);

  const sidebarItems = [
      { id: 'beranda', label: 'Beranda', icon: <Home size={20}/> },
      { id: 'login', label: 'Ruang Siswa', icon: <Users size={20}/> },
      { id: 'literasi', label: 'Pojok Literasi', icon: <BookHeart size={20}/> },
  ];

  const renderContent = () => {
      if (showGlobalContent) {
          // ... (same as before)
          return (
             <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="space-y-6">
                 <button onClick={() => setShowGlobalContent(null)} className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors mb-4">
                     <ArrowLeft size={20}/> Kembali ke Menu
                 </button>
                 <Card>
                     <div className="flex items-center gap-3 mb-6 border-b pb-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                            {showGlobalContent.id.includes('schedule') ? <CalendarRange size={20}/> : <GraduationCap size={20}/>}
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">{showGlobalContent.title}</h2>
                     </div>
                     {showGlobalContent.type === 'link' ? 
                        <div className="text-center py-10">
                            <p className="mb-4 text-gray-600">Konten ini dapat diakses melalui tautan berikut:</p>
                            <a href={showGlobalContent.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg"><ExternalLink size={18}/> Buka Tautan</a>
                        </div> 
                        : <RichHtmlContent content={showGlobalContent.content || ''} />
                     }
                 </Card>
             </motion.div>
          );
      }

      if (view === ViewState.ADMIN_LOGIN) return (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center h-full"><div className="w-full max-w-md"><SectionTitle title="Login Guru" center /><Card className="p-8 space-y-4"><Input label="Username" placeholder="Username" /><Input label="Password" type="password" placeholder="Password" /><div className="flex gap-3 pt-4"><Button variant="secondary" className="flex-1" onClick={() => setView(ViewState.LANDING)}>Batal</Button><Button className="flex-1" onClick={() => setView(ViewState.ADMIN_DASHBOARD)}>Masuk</Button></div></Card></div></motion.div>);
      if (view === ViewState.ADMIN_DASHBOARD) return (<AdminDashboardView classes={classes} schoolProfile={profile} students={students} extras={extras} onUpdateChapterByGrade={handleUpdateChapter} onUpdateClassResourceByGrade={handleUpdateResource} onUpdateClass={handleUpdateClass} onUpdateProfile={handleUpdateProfile} onSaveStudent={handleSaveStudent} onDeleteStudent={handleDeleteStudent} onSaveExtra={handleSaveExtra} onDeleteExtra={handleDeleteExtra} onDeleteClassResource={handleDeleteClassResource} onLogout={() => setView(ViewState.LANDING)} />);
      if (view === ViewState.STUDENT_LOGIN) return (<StudentLoginView initialClassId={selectedClassId} classes={classes} students={students} onLoginSuccess={(s, cId) => { setCurrentUser(s); setSelectedClassId(cId); setView(ViewState.CLASS_DETAIL); }} onBack={() => setView(ViewState.LANDING)} />);
      if (view === ViewState.CLASS_DETAIL) { const cls = classes.find(c => c.id === selectedClassId); return cls ? (<ClassDetailView classData={cls} student={currentUser} onBack={() => { setCurrentUser(null); setView(ViewState.STUDENT_LOGIN); }} onSelectChapter={(id) => { setSelectedChapterId(id); setView(ViewState.CHAPTER_CONTENT); }} />) : <div>Loading...</div>; }
      if (view === ViewState.CHAPTER_CONTENT) { const cls = classes.find(c => c.id === selectedClassId); let chapter = null; cls?.semesters.forEach(s => s.chapters.forEach(c => { if (c.id === selectedChapterId) chapter = c; })); return chapter ? (<ChapterContentView chapter={chapter} onBack={() => setView(ViewState.CLASS_DETAIL)} />) : <div>Loading...</div>; }
      if (view === ViewState.EXTRA_CATEGORY_LIST) {
        const categoryExtras = extras.filter(e => e.category === selectedCategory);
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                 <div className="flex items-center gap-4 mb-6">
                    <Button variant="secondary" onClick={() => { setView(ViewState.LANDING); setExpandedExtraId(null); }}><ArrowLeft size={18}/> Kembali</Button>
                    <h2 className="text-2xl font-bold capitalize">Literasi: {selectedCategory}</h2>
                </div>
                
                {/* Modified to Accordion Style as requested */}
                <div className="space-y-4">
                    {categoryExtras.map(ex => (
                        <div key={ex.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm transition-all hover:shadow-md">
                             <button 
                                onClick={() => setExpandedExtraId(expandedExtraId === ex.id ? null : ex.id)}
                                className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                             >
                                 <div className="flex items-center gap-4">
                                     <div className={`p-2 rounded-lg ${ex.type === 'link' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                                         {ex.type === 'link' ? <LinkIcon size={20}/> : <FileText size={20}/>}
                                     </div>
                                     <h3 className={`text-lg font-bold ${expandedExtraId === ex.id ? 'text-blue-700' : 'text-gray-800'}`}>{ex.title}</h3>
                                 </div>
                                 {expandedExtraId === ex.id ? <ChevronUp size={20} className="text-blue-500"/> : <ChevronDown size={20} className="text-gray-400"/>}
                             </button>
                             
                             {expandedExtraId === ex.id && (
                                 <div className="p-8 border-t border-gray-100 bg-gray-50/50">
                                     {ex.type === 'link' ? (
                                         <div className="text-center">
                                             <p className="mb-4 text-gray-600">Konten ini tersedia melalui tautan berikut:</p>
                                             <a href={ex.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg"><ExternalLink size={18}/> Buka Tautan</a>
                                         </div>
                                     ) : (
                                         <RichHtmlContent content={ex.content || ''} />
                                     )}
                                 </div>
                             )}
                        </div>
                    ))}
                    {categoryExtras.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-400 italic bg-white rounded-2xl border border-dashed border-gray-200">
                            Belum ada konten di kategori ini.
                        </div>
                    )}
                </div>
            </motion.div>
        );
      }

      switch(activeTab) {
          case 'beranda':
              return (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                    <PrayerTimesWidget />
                    {/* ... (existing beranda content) ... */}
                    <div className="relative overflow-hidden">
                        <div className="text-center relative z-10">
                            <RobotGreeting greetingText={profile.greetingText}/>
                            <div className="mt-8 relative p-8 bg-white/60 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-xl inline-block w-full max-w-2xl mx-auto overflow-hidden group hover:bg-white/70 transition-all duration-500">
                                <div className="min-h-[100px] flex flex-col justify-center relative">
                                    <Quote className="absolute top-0 left-0 text-blue-200/50" size={60} />
                                    <AnimatePresence mode="wait">
                                        <motion.div key={quoteIndex} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 0.8 }} className="space-y-4 relative z-10">
                                            <p className="font-serif italic text-xl md:text-2xl text-gray-700 leading-relaxed">"{activeQuotes[quoteIndex] || 'Bismillah.'}"</p>
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* ... (existing footer) ... */}
                    <div className="mt-16 border-t border-white/40 pt-8 text-center pb-8">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">LMS PAI SMPN 3 Pacet</h3>
                        <p className="text-gray-600 text-sm max-w-2xl mx-auto mb-8 leading-relaxed">Membangun generasi berakhlak mulia dengan teknologi pembelajaran modern yang interaktif dan menyenangkan.</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
                            <div className="bg-white/40 backdrop-blur-sm p-6 rounded-2xl border border-white/50 flex flex-col items-center gap-3"><div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600"><MapPin size={20}/></div><div className="text-sm text-gray-600"><p className="font-bold text-gray-800 mb-1">Alamat</p><p>Jl. Tirtawening Desa Kembangbelor Kec. Pacet Kab. Mojokerto</p></div></div>
                            <div className="bg-white/40 backdrop-blur-sm p-6 rounded-2xl border border-white/50 flex flex-col items-center gap-3"><div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600"><User size={20}/></div><div className="text-sm text-gray-600"><p className="font-bold text-gray-800 mb-1">Guru Pengampu</p><p className="font-semibold">Rudi Hermawan, S.Pd.I</p><p className="text-xs text-blue-600 mt-1">rudihermawan90@guru.smp.belajar.id</p></div></div>
                            <div className="bg-white/40 backdrop-blur-sm p-6 rounded-2xl border border-white/50 flex flex-col items-center gap-3"><div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600"><Phone size={20}/></div><div className="text-sm text-gray-600"><p className="font-bold text-gray-800 mb-2">Kontak & Bantuan</p><a href="https://wa.me/6285331717115" target="_blank" className="inline-flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-full font-bold hover:bg-green-600 transition-colors shadow-sm text-xs">Chat Guru (6285331717115)</a></div></div>
                        </div>
                        <div className="text-xs text-gray-500 space-y-2"><p>© 2026 LMS PAI SMPN 3 Pacet. All rights reserved.</p><div className="flex justify-center items-center gap-4"><button onClick={handleAdminLogin} className="hover:text-blue-600 font-medium transition-colors">Admin Login</button><span className="text-gray-300">|</span><span className="font-medium">Design by erha</span></div></div>
                    </div>
                </motion.div>
              );
          case 'login':
              return (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 max-w-5xl mx-auto">
                      <div className="text-center mb-10">
                          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">Portal Siswa</h2>
                          <p className="text-gray-500 text-lg">Akses sumber belajar dan informasi akademik.</p>
                      </div>

                      {/* Global Widgets Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                          <div 
                             onClick={() => setShowGlobalContent(profile.globalSchedule || {id:'sched', title:'Jadwal', type:'html', content:''})}
                             className="group bg-white/40 backdrop-blur-xl border border-white/50 p-6 rounded-3xl cursor-pointer hover:bg-white/60 transition-all duration-300 shadow-sm hover:shadow-md flex items-center gap-6"
                          >
                              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform duration-300">
                                  <CalendarRange size={32}/>
                              </div>
                              <div>
                                  <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">Jadwal Pelajaran</h3>
                                  <p className="text-sm text-gray-500 font-medium">Cek jadwal PAI terbaru</p>
                              </div>
                          </div>

                          <div 
                             onClick={() => setShowGlobalContent(profile.globalGrades || {id:'grade', title:'Nilai', type:'html', content:''})}
                             className="group bg-white/40 backdrop-blur-xl border border-white/50 p-6 rounded-3xl cursor-pointer hover:bg-white/60 transition-all duration-300 shadow-sm hover:shadow-md flex items-center gap-6"
                          >
                              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform duration-300">
                                  <GraduationCap size={32}/>
                              </div>
                              <div>
                                  <h3 className="text-xl font-bold text-gray-800 group-hover:text-emerald-600 transition-colors">Rekapitulasi Nilai</h3>
                                  <p className="text-sm text-gray-500 font-medium">Lihat progress belajar</p>
                              </div>
                          </div>
                      </div>
                      
                      {/* Grade Selector - Direct Login Style (Modified) */}
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-6 px-2">Pilih Jenjang Kelas</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { id: '7', label: 'Kelas VII', icon: <BookOpen size={32}/>, color: 'blue', desc: 'Fase D Awal' },
                                { id: '8', label: 'Kelas VIII', icon: <Compass size={32}/>, color: 'emerald', desc: 'Fase D Pertengahan' },
                                { id: '9', label: 'Kelas IX', icon: <Star size={32}/>, color: 'amber', desc: 'Fase D Akhir' }
                            ].map((grade) => (
                                <div key={grade.id} className="relative">
                                    <div 
                                        onClick={() => {
                                            // Find first class of this grade to pre-select
                                            const firstClass = classes.find(c => c.gradeLevel === grade.id);
                                            if (firstClass) handleSelectClass(firstClass.id);
                                        }}
                                        className="relative z-10 bg-white/70 backdrop-blur-2xl border border-white/60 p-6 rounded-3xl cursor-pointer transition-all duration-300 hover:bg-white/80 hover:shadow-lg hover:-translate-y-1 group"
                                    >
                                        <div className={`w-14 h-14 rounded-2xl mb-4 flex items-center justify-center text-white shadow-md bg-gradient-to-br from-${grade.color}-400 to-${grade.color}-600`}>
                                            {grade.icon}
                                        </div>
                                        <h4 className="text-2xl font-bold text-gray-800 mb-1">{grade.label}</h4>
                                        <p className="text-sm text-gray-500">{grade.desc}</p>
                                        
                                        <div className="absolute top-6 right-6 text-gray-300 group-hover:text-blue-500 transition-colors">
                                            <LogIn size={24} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                      </div>
                  </motion.div>
              );
          case 'literasi':
              return (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 max-w-6xl mx-auto">
                      <div className="text-center mb-12">
                          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">Pustaka Digital</h2>
                          <p className="text-gray-500 text-lg">Koleksi materi pengayaan untuk memperluas wawasan.</p>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-10 gap-x-6">
                            {[
                            { id: 'doa', label: 'Doa Harian', icon: <BookHeart size={32}/>, color: 'from-green-400 to-emerald-600' },
                            { id: 'cerita', label: 'Kisah Islami', icon: <Sparkles size={32}/>, color: 'from-purple-400 to-indigo-600' },
                            { id: 'sholat', label: 'Fiqih Sholat', icon: <Sun size={32}/>, color: 'from-orange-400 to-red-500' },
                            { id: 'fiqih', label: 'Fiqih Dasar', icon: <Hand size={32}/>, color: 'from-blue-400 to-cyan-600' },
                            { id: 'hadist', label: 'Hadist', icon: <MessageCircle size={32}/>, color: 'from-teal-400 to-green-600' },
                            { id: 'ramadhan', label: 'Ramadhan', icon: <Coffee size={32}/>, color: 'from-amber-400 to-orange-600' },
                            { id: 'lainnya', label: 'Lainnya', icon: <MoreHorizontal size={32}/>, color: 'from-gray-400 to-slate-600' },
                            ].map((cat) => (
                                <div key={cat.id} className="flex flex-col items-center group cursor-pointer" onClick={() => handleSelectCategory(cat.id as ExtraCategory)}>
                                    <div className={`w-20 h-20 rounded-[1.5rem] bg-gradient-to-br ${cat.color} shadow-lg shadow-gray-300/50 flex items-center justify-center text-white mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:shadow-xl`}>
                                        {cat.icon}
                                    </div>
                                    <span className="font-semibold text-gray-700 text-sm group-hover:text-blue-600 transition-colors text-center">{cat.label}</span>
                                </div>
                            ))}
                        </div>
                  </motion.div>
              );
          default: return null;
      }
  };

  // ... (Sidebar and Return remain roughly the same)
  // ...
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-0 sm:p-4 md:p-8 font-sans overflow-hidden">
       {/* Abstract Colorful Background */}
       <div className="fixed inset-0 z-0 opacity-80 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-400/30 blur-[120px] animate-blob"></div>
          <div className="absolute top-[10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/30 blur-[120px] animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[60%] rounded-full bg-pink-400/30 blur-[120px] animate-blob animation-delay-4000"></div>
       </div>

       {/* Main Glass Window Container */}
       <div className="relative z-10 w-full max-w-[1400px] h-[100vh] sm:h-[90vh] bg-white/40 backdrop-blur-3xl rounded-[0px] sm:rounded-[30px] shadow-2xl border border-white/40 flex flex-col lg:flex-row overflow-hidden">
          
          {view !== ViewState.ADMIN_DASHBOARD && (
            <>
                {/* Desktop Sidebar (Finder Style) */}
                <aside className="hidden lg:flex w-72 bg-white/30 backdrop-blur-md border-r border-white/20 flex-col py-6 px-4">
                        <TrafficLights />
                        
                        <div className="px-4 mb-8 mt-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                                    <School size={20} />
                                </div>
                                <div>
                                    <h1 className="font-extrabold text-gray-800 text-sm leading-tight">E-Learning PAI</h1>
                                    <p className="text-[10px] font-medium text-gray-500">SMPN 3 Pacet</p>
                                </div>
                            </div>
                        </div>
                        
                        <nav className="space-y-1 flex-1">
                            {sidebarItems.map((item) => (
                                <button 
                                    key={item.id}
                                    onClick={() => { setActiveTab(item.id); setView(ViewState.LANDING); setShowGlobalContent(null); }}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === item.id && view === ViewState.LANDING ? 'bg-black/5 text-gray-900 font-semibold' : 'text-gray-600 hover:bg-black/5 hover:text-gray-900'}`}
                                >
                                    {React.cloneElement(item.icon as React.ReactElement, { size: 18, className: activeTab === item.id && view === ViewState.LANDING ? 'text-blue-600' : 'text-gray-500' })}
                                    {item.label}
                                </button>
                            ))}
                        </nav>

                        <button onClick={handleAdminLogin} className="flex items-center gap-3 px-4 py-3 text-xs font-semibold text-gray-400 hover:text-blue-600 transition-colors mt-auto">
                            <Settings size={14} /> Mode Guru
                        </button>
                </aside>

                {/* Mobile Bottom Nav */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-white/50 z-50 px-6 py-4 flex justify-between items-center pb-safe shadow-lg">
                        {sidebarItems.map((item) => (
                            <button 
                                key={item.id}
                                onClick={() => { setActiveTab(item.id); setView(ViewState.LANDING); setShowGlobalContent(null); window.scrollTo(0,0); }}
                                className={`flex flex-col items-center gap-1 ${activeTab === item.id && view === ViewState.LANDING ? 'text-blue-600' : 'text-gray-400'}`}
                            >
                                {React.cloneElement(item.icon as React.ReactElement, { size: 24 })}
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </button>
                        ))}
                        <button onClick={handleAdminLogin} className="flex flex-col items-center gap-1 text-gray-400">
                            <Settings size={24}/>
                            <span className="text-[10px] font-medium">Admin</span>
                        </button>
                </div>
            </>
          )}

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto scrollbar-hide relative bg-white/30">
               {view !== ViewState.ADMIN_DASHBOARD && (
                   <div className="sticky top-0 z-40 bg-white/30 backdrop-blur-md border-b border-white/20 px-6 py-4 flex items-center justify-between lg:hidden">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white"><School size={16}/></div>
                            <span className="font-bold text-gray-800 text-sm">E-Learning PAI SMPN 3 Pacet</span>
                        </div>
                   </div>
               )}

               <div className="p-6 lg:p-10 pb-24 lg:pb-10 min-h-full">
                   <AnimatePresence mode="wait">
                       <motion.div key={view + activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                          {renderContent()}
                       </motion.div>
                   </AnimatePresence>
               </div>
          </main>
       </div>
    </div>
  );
};

export default App;