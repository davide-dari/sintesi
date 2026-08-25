
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Stethoscope, 
  User, 
  Plus, 
  Trash2, 
  Clock, 
  Send,
  Pill, 
  MapPin,
  Edit2,
  X,
  ChevronRight,
  Check,
  Phone,
  Settings,
  CheckCircle2,
  Navigation,
  CalendarDays,
  Save,
  ArrowRight,
  Smartphone,
  Database,
  Download,
  Upload,
  Copy,
  AlertTriangle
} from 'lucide-react';
import { useAppStorage } from './services/storage';
import { useUpdateChecker } from './services/updater';
import { scanMedicineFromImage } from './services/ocr';
import { Button, Input, NavigationBar, ScreenLayout } from './components/UI';
import { AppData, Medicine, DAYS_OF_WEEK } from './types';

enum Screen {
  WELCOME,
  INTRO_USER,   
  REG_NAME,
  INTRO_DOCTOR, 
  REG_DOCTOR, 
  REG_MEDS,
  HOME,
  SELECTION,
  PROFILE,
  EDIT_USER,
  EDIT_DOCTOR,
  MENU 
}

type BackupMode = 'none' | 'export' | 'import';

const App: React.FC = () => {
  const { data, saveData, updateField, loaded } = useAppStorage();
  const { updateInfo, dismissUpdate } = useUpdateChecker();
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.HOME); 
  
  // Wizard Step State
  const [regStep, setRegStep] = useState(0);

  const [tempUser, setTempUser] = useState(data.user);
  const [tempDoctor, setTempDoctor] = useState(data.doctor);
  const [tempMeds, setTempMeds] = useState<Medicine[]>([]);
  
  const [medInput, setMedInput] = useState('');
  const [medType, setMedType] = useState<'farmaco' | 'visita'>('farmaco');
  const [selectedMeds, setSelectedMeds] = useState<Set<string>>(new Set());
  
  const [selectionTab, setSelectionTab] = useState<'farmaco' | 'visita'>('farmaco');
  
  const [landlineInput, setLandlineInput] = useState('');
  const [mobileInput, setMobileInput] = useState('');
  
  const [showStudioDetails, setShowStudioDetails] = useState(false);
  const [showCallMenu, setShowCallMenu] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Backup States
  const [backupMode, setBackupMode] = useState<BackupMode>('none');
  const [importText, setImportText] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResults, setScanResults] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const medsEndRef = useRef<HTMLDivElement>(null);
  const historyInitialized = useRef(false);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Refs per focus automatico
  const inputRef = useRef<HTMLInputElement>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  // Reset import text when backup modal closes
  useEffect(() => {
    if (backupMode === 'none') setImportText('');
  }, [backupMode]);

  // Detect safe area insets and set CSS variables (fallback for Android)
  useEffect(() => {
    const setSafeAreas = () => {
      const root = document.documentElement;
      // Try env() first via computed style on a test element
      const test = document.createElement('div');
      test.style.paddingTop = 'env(safe-area-inset-top)';
      document.body.appendChild(test);
      const envTop = getComputedStyle(test).paddingTop;
      document.body.removeChild(test);

      if (envTop && envTop !== '0px' && envTop !== '0') {
        root.style.setProperty('--sat', envTop);
      } else {
        // Fallback: use visualViewport
        const vp = window.visualViewport;
        if (vp) {
          root.style.setProperty('--sat', `${vp.offsetTop}px`);
          root.style.setProperty('--sab', `${Math.max(0, window.innerHeight - vp.height - vp.offsetTop)}px`);
        }
      }

      const testB = document.createElement('div');
      testB.style.paddingBottom = 'env(safe-area-inset-bottom)';
      document.body.appendChild(testB);
      const envBottom = getComputedStyle(testB).paddingBottom;
      document.body.removeChild(testB);

      if (envBottom && envBottom !== '0px' && envBottom !== '0') {
        root.style.setProperty('--sab', envBottom);
      } else {
        const vp = window.visualViewport;
        if (vp) {
          root.style.setProperty('--sab', `${Math.max(0, window.innerHeight - vp.height - vp.offsetTop)}px`);
        }
      }
    };
    setSafeAreas();
    window.visualViewport?.addEventListener('resize', setSafeAreas);
    window.visualViewport?.addEventListener('scroll', setSafeAreas);
    return () => {
      window.visualViewport?.removeEventListener('resize', setSafeAreas);
      window.visualViewport?.removeEventListener('scroll', setSafeAreas);
    };
  }, []);

  const goToScreen = (screen: Screen) => {
    setRegStep(0); // Reset step on screen change
    window.history.pushState({ screen }, '');
    setCurrentScreen(screen);
  };

  const goBack = () => {
    window.history.back();
  };

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.screen !== undefined) {
        setCurrentScreen(event.state.screen);
        setRegStep(0);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  React.useEffect(() => {
    if (loaded) {
      setTempUser(data.user);
      setTempDoctor(data.doctor);
      setTempMeds(data.medicines);
      if (!historyInitialized.current) {
        const startScreen = !data.isRegistered ? Screen.INTRO_USER : Screen.HOME;
        setCurrentScreen(startScreen);
        window.history.replaceState({ screen: startScreen }, '');
        historyInitialized.current = true;
      }
    }
  }, [loaded, data]);

  React.useEffect(() => {
    if (currentScreen === Screen.EDIT_USER) setTempUser(data.user);
    if (currentScreen === Screen.EDIT_DOCTOR) {
      setTempDoctor(data.doctor);
      setLandlineInput('');
      setMobileInput('');
    }
    if (currentScreen === Screen.REG_MEDS) {
       setTempMeds(data.medicines);
       setMedInput('');
    }
    if (currentScreen === Screen.SELECTION) {
       setSelectedMeds(new Set());
    }
  }, [currentScreen, data]);

  // Auto-focus input on step change
  useEffect(() => {
    if (inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [regStep, currentScreen]);

  if (!loaded) return <div className="min-h-screen flex items-center justify-center text-teal-700 text-xl font-medium">Caricamento...</div>;

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const capitalize = (str: string) => {
    if (!str) return '';
    return str.replace(/\b[\p{L}]/gu, l => l.toUpperCase());
  };

  // Helper per lo stato dello studio
  const getStudioStatus = () => {
    if (!data.doctor.hours) return null;
    
    const now = new Date();
    const dayIndex = now.getDay(); // 0 = Sun, 1 = Mon ...
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    // Convert JS day index to DAYS_OF_WEEK index
    // DAYS_OF_WEEK is 0:Lun, 1:Mar, 2:Mer, 3:Gio, 4:Ven
    // JS is 1:Mon ... 5:Fri.
    
    if (dayIndex === 0 || dayIndex === 6) {
        return { 
          isOpen: false, 
          label: 'CHIUSO', 
          color: 'text-red-500', 
          bg: 'bg-red-50', 
          border: 'border-red-100',
          icon: <Clock size={16} className="text-red-500" />,
          detail: 'Buon fine settimana'
        };
    }

    const arrayIndex = dayIndex - 1; // 1 (Mon) - 1 = 0
    const dayName = DAYS_OF_WEEK[arrayIndex];
    const hours = data.doctor.hours[dayName];
    
    if (!hours || hours.closed) {
         return { 
          isOpen: false, 
          label: 'CHIUSO', 
          color: 'text-red-500', 
          bg: 'bg-red-50', 
          border: 'border-red-100',
          icon: <Clock size={16} className="text-red-500" />,
          detail: 'Oggi chiuso'
        };
    }

    const [startH, startM] = hours.start.split(':').map(Number);
    const [endH, endM] = hours.end.split(':').map(Number);
    const startMins = startH * 60 + startM;
    const endMins = endH * 60 + endM;

    if (currentMinutes >= startMins && currentMinutes < endMins) {
        return { 
          isOpen: true, 
          label: 'APERTO', 
          color: 'text-green-600', 
          bg: 'bg-green-50', 
          border: 'border-green-100',
          icon: <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />,
          detail: `Fino alle ${hours.end}`
        };
    } else if (currentMinutes < startMins) {
        return { 
          isOpen: false, 
          label: 'CHIUSO', 
          color: 'text-orange-500', 
          bg: 'bg-orange-50', 
          border: 'border-orange-100',
          icon: <Clock size={16} className="text-orange-500" />,
          detail: `Apre alle ${hours.start}`
        };
    } else {
         return { 
          isOpen: false, 
          label: 'CHIUSO', 
          color: 'text-red-500', 
          bg: 'bg-red-50', 
          border: 'border-red-100',
          icon: <Clock size={16} className="text-red-500" />,
          detail: 'A domani'
        };
    }
  };

  // --- handlers registration ---
  const handleUserStepNext = () => {
    if (regStep === 0) {
      if (tempUser.firstName.trim()) setRegStep(1);
      else alert("Inserisci il nome");
    } else if (regStep === 1) {
      if (tempUser.lastName.trim()) {
        updateField('user', tempUser);
        goToScreen(Screen.INTRO_DOCTOR);
      } else alert("Inserisci il cognome");
    }
  };

  const handleUserStepBack = () => {
    if (regStep === 0) {
      if (currentScreen === Screen.REG_NAME) goBack(); 
    } else {
      setRegStep(regStep - 1);
    }
  };

  const validateDoctorStep = () => {
    switch (regStep) {
      case 0: return true; 
      case 1: return !!tempDoctor.lastName.trim();
      case 2: return isValidEmail(tempDoctor.email);
      case 3: return tempDoctor.address.trim().length > 3;
      case 4: return !!tempDoctor.city.trim();
      case 5: return /^\d{5}$/.test(tempDoctor.cap);
      case 6: return tempDoctor.landlines.length > 0 || tempDoctor.mobiles.length > 0;
      case 7: return true; // Step 7 is hours, defaults are valid
      default: return false;
    }
  };

  const handleDoctorStepNext = () => {
    if (!validateDoctorStep()) {
       if (regStep === 6) alert("Inserisci almeno un numero di telefono");
       else if (regStep === 2) alert("Email non valida");
       else if (regStep === 5) alert("CAP non valido (5 cifre)");
       else alert("Compila il campo per continuare");
       return;
    }

    if (regStep < 7) {
      setRegStep(regStep + 1);
    } else {
      updateField('doctor', tempDoctor);
      goToScreen(Screen.REG_MEDS);
    }
  };

  const handleDoctorStepBack = () => {
    if (regStep === 0) {
      goToScreen(Screen.INTRO_DOCTOR); 
    } else {
      setRegStep(regStep - 1);
    }
  };
  
  // --- Handlers for Single Page Edit ---

  const handleSaveEditUser = () => {
      if (!tempUser.firstName.trim() || !tempUser.lastName.trim()) {
          alert("Nome e Cognome sono obbligatori");
          return;
      }
      updateField('user', tempUser);
      goBack();
  };

  const handleSaveEditDoctor = () => {
      if (!tempDoctor.lastName.trim()) { alert("Il cognome è obbligatorio"); return; }
      if (!isValidEmail(tempDoctor.email)) { alert("Email non valida"); return; }
      if (tempDoctor.address.trim().length < 3) { alert("Indirizzo troppo corto"); return; }
      if (!tempDoctor.city.trim()) { alert("Città obbligatoria"); return; }
      if (!/^\d{5}$/.test(tempDoctor.cap)) { alert("CAP non valido (5 cifre)"); return; }
      if (tempDoctor.landlines.length === 0 && tempDoctor.mobiles.length === 0) { alert("Inserisci almeno un telefono"); return; }

      updateField('doctor', tempDoctor);
      goBack();
  };

  // --- Common Helpers ---

  const handleAddMed = () => {
    if (!medInput.trim()) return;
    const newMed: Medicine = {
      id: Date.now().toString(),
      name: medInput.trim(), 
      type: medType
    };
    const updated = [...tempMeds, newMed];
    setTempMeds(updated);
    updateField('medicines', updated);
    setMedInput('');
    setTimeout(() => {
      medsEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleScanPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScanning(true);
    setScanResults([]);
    try {
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const results = await scanMedicineFromImage(dataUrl);
      setScanResults(results);
    } catch (err) {
      console.error('OCR failed:', err);
      alert('Errore durante la scansione. Riprova.');
    } finally {
      setScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const addScannedMed = (name: string) => {
    const newMed: Medicine = {
      id: Date.now().toString(),
      name,
      type: medType,
    };
    const updated = [...tempMeds, newMed];
    setTempMeds(updated);
    updateField('medicines', updated);
    setScanResults((prev) => prev.filter((r) => r !== name));
    setTimeout(() => {
      medsEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleCompleteRegistration = () => {
    const wasRegistered = data.isRegistered;
    updateField('medicines', tempMeds);
    updateField('isRegistered', true);
    if (wasRegistered) goBack();
    else goToScreen(Screen.HOME);
  };

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedMeds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedMeds(newSet);
  };

  const addLandline = () => {
    const val = landlineInput.trim();
    if (val && val.length === 9) {
      setTempDoctor({ ...tempDoctor, landlines: [...(tempDoctor.landlines || []), val] });
      setLandlineInput('');
    } else { alert("Il numero fisso deve essere di 9 cifre"); }
  };

  const addMobile = () => {
    const val = mobileInput.trim();
    if (val && val.length === 10) {
      setTempDoctor({ ...tempDoctor, mobiles: [...(tempDoctor.mobiles || []), val] });
      setMobileInput('');
    } else { alert("Il numero di cellulare deve essere di 10 cifre"); }
  };

  const updateDoctorHour = (day: string, field: 'start' | 'end' | 'closed', value: any) => {
    setTempDoctor(prev => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: {
          ...prev.hours[day],
          [field]: value
        }
      }
    }));
  };

  const generateMailto = () => {
    const isMorning = new Date().getHours() < 13;
    const greetingTime = isMorning ? "Buongiorno" : "Buonasera";
    const title = data.doctor.gender === 'F' ? 'Dott.ssa' : 'Dr.';
    const selectedItems = data.medicines.filter(m => selectedMeds.has(m.id));
    const medsOnly = selectedItems.filter(m => m.type === 'farmaco');
    const visitsOnly = selectedItems.filter(m => m.type === 'visita');
    
    let itemsBody = "";
    if (medsOnly.length > 0) itemsBody += `Farmaci:\n${medsOnly.map(item => `- ${item.name}`).join('\n')}\n\n`;
    if (visitsOnly.length > 0) itemsBody += `Visite:\n${visitsOnly.map(item => `- ${item.name}`).join('\n')}\n\n`;

    const body = `${greetingTime} ${title} ${data.doctor.lastName},\n\nvorrei richiedere quanto segue:\n\n${itemsBody}Cordiali saluti,\n${data.user.firstName} ${data.user.lastName}`;
    const subject = `Richiesta Ricette - ${data.user.firstName} ${data.user.lastName}`;
    return `mailto:${data.doctor.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };
  
  const handleSendClick = () => {
    window.location.href = generateMailto();
    setSelectedMeds(new Set());
    setShowSuccess(true);
    if (successTimerRef.current) clearTimeout(successTimerRef.current);
    successTimerRef.current = setTimeout(() => {
       if (currentScreen === Screen.SELECTION) {
         setShowSuccess(false);
         window.history.replaceState({ screen: Screen.HOME }, '');
         setCurrentScreen(Screen.HOME);
       }
    }, 2500);
  };

  // --- Backup Handlers ---
  const handleCopyBackup = () => {
    const backupString = JSON.stringify(data);
    navigator.clipboard.writeText(backupString).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleRestoreBackup = () => {
    try {
      if (!importText.trim()) return;
      const parsed = JSON.parse(importText);
      // Simple validation
      if (parsed && typeof parsed === 'object' && 'user' in parsed && 'doctor' in parsed) {
        saveData(parsed);
        alert('Ripristino completato con successo!');
        window.location.reload();
      } else {
        alert('Il codice inserito non è valido.');
      }
    } catch (e) {
      alert('Errore durante il ripristino. Codice non valido.');
    }
  };

  // --- Views ---

  // --- INTRO USER SCREEN ---
  if (currentScreen === Screen.INTRO_USER) {
    return (
      <div className="h-[100dvh] bg-teal-50 flex flex-col items-center justify-center p-6 relative overflow-hidden screen-enter" style={{ paddingTop: 'var(--sat)', paddingBottom: 'var(--sab)' }}>
        <div className="z-10 flex flex-col items-center text-center space-y-6">
           <div className="bg-white p-6 rounded-full shadow-lg mb-2">
             <User size={64} className="text-teal-600" />
           </div>
           
           <div>
             <h1 className="text-3xl font-bold text-teal-900 mb-2">Benvenuto!</h1>
             <p className="text-lg text-teal-700">
               Creiamo il tuo profilo personale.
             </p>
           </div>

           <div className="w-full pt-6">
             <button 
               onClick={() => goToScreen(Screen.REG_NAME)}
               className="w-full bg-teal-600 text-white py-4 px-8 rounded-xl text-xl font-bold shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
             >
               Inizia Ora <ArrowRight size={24} />
             </button>
           </div>
        </div>
      </div>
    );
  }

  // --- INTRO DOCTOR SCREEN ---
  if (currentScreen === Screen.INTRO_DOCTOR) {
    return (
      <div className="h-[100dvh] bg-blue-50 flex flex-col items-center justify-center p-6 relative overflow-hidden screen-enter" style={{ paddingTop: 'var(--sat)', paddingBottom: 'var(--sab)' }}>
        <div className="z-10 flex flex-col items-center text-center space-y-6">
           <div className="bg-white p-6 rounded-full shadow-lg mb-2">
             <Stethoscope size={64} className="text-blue-600" />
           </div>
           
           <div>
             <h1 className="text-3xl font-bold text-blue-900 mb-2">Ottimo!</h1>
             <p className="text-lg text-blue-700">
               Adesso inseriamo i dati del tuo dottore.
             </p>
           </div>

           <div className="w-full pt-6 space-y-4">
             <button 
               onClick={() => goToScreen(Screen.REG_DOCTOR)}
               className="w-full bg-blue-600 text-white py-4 px-8 rounded-xl text-xl font-bold shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
             >
               Continua <ArrowRight size={24} />
             </button>
             
             <button 
               onClick={goBack}
               className="text-blue-600 font-semibold"
             >
               Torna Indietro
             </button>
           </div>
        </div>
      </div>
    );
  }

  if (currentScreen === Screen.MENU) {
    return (
      <div className="h-[100dvh] bg-white flex flex-col relative overflow-hidden screen-enter">
        <div className="pb-4 px-5 bg-white shrink-0 z-10 border-b border-gray-100" style={{ paddingTop: 'calc(2rem + var(--sat))' }}>
           <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Impostazioni</h1>
              <button onClick={goBack} className="bg-gray-100 p-2 rounded-full"><X size={24} /></button>
           </div>
        </div>

        <div className="flex-1 px-5 py-4 flex flex-col gap-4 overflow-y-auto no-scrollbar landscape:overflow-visible">
          <button onClick={() => goToScreen(Screen.EDIT_USER)} className="w-full flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-2xl shadow-sm active:scale-95 transition-all group">
            <div className="bg-teal-50 p-3 rounded-full text-teal-600 group-hover:bg-teal-100 transition-colors"><User size={28} /></div>
            <div className="text-left flex-1">
              <h3 className="text-lg font-bold text-gray-900">Profilo personale</h3>
              <p className="text-sm text-gray-400 font-medium">Modifica il tuo nome</p>
            </div>
            <ChevronRight className="text-gray-300 group-hover:text-teal-500 transition-colors" />
          </button>

          <button onClick={() => goToScreen(Screen.EDIT_DOCTOR)} className="w-full flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-2xl shadow-sm active:scale-95 transition-all group">
            <div className="bg-blue-50 p-3 rounded-full text-blue-600 group-hover:bg-blue-100 transition-colors"><Stethoscope size={28} /></div>
            <div className="text-left flex-1">
              <h3 className="text-lg font-bold text-gray-900">Profilo dottore</h3>
              <p className="text-sm text-gray-400 font-medium">Orari, indirizzi e contatti</p>
            </div>
            <ChevronRight className="text-gray-300 group-hover:text-blue-500 transition-colors" />
          </button>

          <button onClick={() => goToScreen(Screen.REG_MEDS)} className="w-full flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-2xl shadow-sm active:scale-95 transition-all group">
            <div className="bg-orange-50 p-3 rounded-full text-orange-600 group-hover:bg-orange-100 transition-colors"><Pill size={28} /></div>
            <div className="text-left flex-1">
              <h3 className="text-lg font-bold text-gray-900">Farmaci e visite</h3>
              <p className="text-sm text-gray-400 font-medium">Gestisci la tua lista</p>
            </div>
            <ChevronRight className="text-gray-300 group-hover:text-orange-500 transition-colors" />
          </button>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Gestione Dati</h4>
            <div className="flex gap-3">
              <button onClick={() => setBackupMode('export')} className="flex-1 bg-gray-50 border border-gray-200 p-4 rounded-xl flex flex-col items-center gap-2 active:scale-95 transition-all hover:bg-gray-100">
                 <Download size={24} className="text-gray-600" />
                 <span className="font-bold text-gray-700 text-sm">Backup</span>
              </button>
              <button onClick={() => setBackupMode('import')} className="flex-1 bg-gray-50 border border-gray-200 p-4 rounded-xl flex flex-col items-center gap-2 active:scale-95 transition-all hover:bg-gray-100">
                 <Upload size={24} className="text-gray-600" />
                 <span className="font-bold text-gray-700 text-sm">Ripristina</span>
              </button>
            </div>
          </div>
        </div>

        <div className="px-5 pt-2 bg-white shrink-0 z-30" style={{ paddingBottom: 'calc(3rem + var(--sab))' }}>
          <Button fullWidth onClick={goBack} variant="secondary">Torna alla Home</Button>
        </div>

        {/* BACKUP MODAL */}
        {backupMode !== 'none' && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6 animate-fade-in backdrop-blur-sm">
              <div className="bg-white w-full rounded-3xl p-6 shadow-2xl relative">
                <button onClick={() => setBackupMode('none')} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full"><X size={20}/></button>
                
                {backupMode === 'export' ? (
                  <div className="text-center">
                    <div className="bg-teal-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Database size={32} className="text-teal-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Salva i tuoi dati</h3>
                    <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                      Copia questo codice segreto e incollalo nell'app sul nuovo telefono per trasferire tutto.
                    </p>
                    
                    <div className="bg-gray-100 p-4 rounded-xl mb-4 text-left relative group cursor-pointer" onClick={handleCopyBackup}>
                       <code className="text-xs text-gray-600 break-all line-clamp-4 font-mono">
                         {JSON.stringify(data)}
                       </code>
                       <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                          <span className="bg-white shadow-sm px-2 py-1 rounded text-xs font-bold">Clicca per copiare</span>
                       </div>
                    </div>

                    <Button fullWidth onClick={handleCopyBackup} icon={copySuccess ? <Check size={20}/> : <Copy size={20}/>} className={copySuccess ? "!bg-green-600" : ""}>
                      {copySuccess ? "Copiato!" : "Copia Codice"}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="bg-orange-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertTriangle size={32} className="text-orange-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Ripristina dati</h3>
                    <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                      Incolla qui il codice generato dal vecchio telefono. <br/>
                      <span className="text-orange-600 font-bold">Attenzione: i dati attuali verranno persi.</span>
                    </p>
                    
                    <textarea 
                      className="w-full h-32 bg-gray-50 border-2 border-gray-200 rounded-xl p-3 text-xs font-mono outline-none focus:border-teal-500 transition-colors mb-4 resize-none"
                      placeholder='Incolla qui il codice...'
                      value={importText}
                      onChange={e => setImportText(e.target.value)}
                    />

                    <Button fullWidth onClick={handleRestoreBackup} icon={<Upload size={20}/>}>
                      Carica Dati
                    </Button>
                  </div>
                )}
             </div>
          </div>
        )}
      </div>
    );
  }

  // --- EDIT USER (SINGLE PAGE) ---
  if (currentScreen === Screen.EDIT_USER) {
      return (
          <ScreenLayout 
            title="Modifica Profilo" 
            headerAction={<button onClick={goBack} className="bg-gray-100 text-gray-600 p-2 rounded-full"><X size={24} /></button>}
          >
             <div className="flex flex-col gap-4 pt-2">
                <Input 
                  label="Il Tuo Nome" 
                  placeholder="Mario" 
                  value={tempUser.firstName} 
                  onChange={e => setTempUser({...tempUser, firstName: capitalize(e.target.value)})} 
                />
                
                <Input 
                  label="Il Tuo Cognome" 
                  placeholder="Rossi" 
                  value={tempUser.lastName} 
                  onChange={e => setTempUser({...tempUser, lastName: capitalize(e.target.value)})} 
                />

                <div className="mt-4">
                  <Button fullWidth onClick={handleSaveEditUser} icon={<Save size={20}/>}>
                     Salva Modifiche
                  </Button>
                </div>
             </div>
          </ScreenLayout>
      );
  }

  // --- REGISTRATION USER (WIZARD) ---
  if (currentScreen === Screen.REG_NAME) {
    return (
      <ScreenLayout 
        title={regStep === 0 ? "Come ti chiami?" : "Il tuo cognome?"}
        subtitle={regStep === 0 ? "Inserisci il tuo nome" : "Inserisci il tuo cognome"}
      >
        <div className="flex flex-col h-full justify-center pb-20 landscape:pb-4">
          {regStep === 0 && (
             <div className="animate-fade-in">
                <Input 
                  ref={inputRef}
                  label="" 
                  placeholder="Mario" 
                  value={tempUser.firstName} 
                  onChange={e => setTempUser({...tempUser, firstName: capitalize(e.target.value)})} 
                  onKeyDown={e => e.key === 'Enter' && handleUserStepNext()}
                  className="text-center text-3xl py-4 font-bold border-2 border-teal-100 focus:border-teal-500 rounded-2xl"
                />
             </div>
          )}
          {regStep === 1 && (
             <div className="animate-fade-in">
                <Input 
                  ref={inputRef}
                  label="" 
                  placeholder="Rossi" 
                  value={tempUser.lastName} 
                  onChange={e => setTempUser({...tempUser, lastName: capitalize(e.target.value)})} 
                  onKeyDown={e => e.key === 'Enter' && handleUserStepNext()}
                  className="text-center text-3xl py-4 font-bold border-2 border-teal-100 focus:border-teal-500 rounded-2xl"
                />
             </div>
          )}
        </div>
        <NavigationBar onBack={handleUserStepBack} onNext={handleUserStepNext} />
      </ScreenLayout>
    );
  }

  // --- EDIT DOCTOR (SINGLE PAGE) ---
  if (currentScreen === Screen.EDIT_DOCTOR) {
      return (
        <ScreenLayout 
            title="Modifica Dottore" 
            headerAction={<button onClick={goBack} className="bg-gray-100 text-gray-600 p-2 rounded-full"><X size={24} /></button>}
        >
          <div className="flex flex-col gap-6 pb-20 landscape:pb-4">
             {/* Section 1: Gender */}
             <div className="flex gap-3">
                <button
                  onClick={() => setTempDoctor({...tempDoctor, gender: 'M'})}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${tempDoctor.gender === 'M' ? 'bg-blue-50 border-blue-500 text-blue-900' : 'bg-white border-gray-200 text-gray-500'}`}
                >
                   <User size={32} />
                   <span className="font-bold">Il Dottore</span>
                </button>
                <button
                  onClick={() => setTempDoctor({...tempDoctor, gender: 'F'})}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${tempDoctor.gender === 'F' ? 'bg-pink-50 border-pink-500 text-pink-900' : 'bg-white border-gray-200 text-gray-500'}`}
                >
                   <User size={32} />
                   <span className="font-bold">La Dottoressa</span>
                </button>
             </div>

             {/* Section 2: Info */}
             <div className="space-y-2">
                <Input label="Cognome Medico" placeholder="Bianchi" value={tempDoctor.lastName} onChange={e => setTempDoctor({...tempDoctor, lastName: capitalize(e.target.value)})} />
                <Input label="Email per Ricette" type="email" placeholder="medico@posta.it" value={tempDoctor.email} onChange={e => setTempDoctor({...tempDoctor, email: e.target.value})} />
                <Input label="Indirizzo Studio" placeholder="Via Roma 10" value={tempDoctor.address} onChange={e => setTempDoctor({...tempDoctor, address: capitalize(e.target.value)})} />
                <div className="flex gap-3">
                    <div className="flex-1"><Input label="Città" placeholder="Roma" value={tempDoctor.city} onChange={e => setTempDoctor({...tempDoctor, city: capitalize(e.target.value)})} /></div>
                    <div className="w-24"><Input label="CAP" placeholder="00100" maxLength={5} value={tempDoctor.cap} onChange={e => setTempDoctor({...tempDoctor, cap: e.target.value.replace(/\D/g, '')})} className="text-center" /></div>
                </div>
             </div>

             {/* Section 3: Contacts */}
             <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2"><Phone size={20}/> Contatti</h3>
                
                {/* Landline */}
                <div className="mb-4 w-full">
                   <label className="block text-sm font-semibold text-gray-600 mb-2">Telefono Fisso</label>
                   <div className="flex gap-2 mb-2 w-full">
                      <input 
                        className="flex-1 p-3 rounded-xl border border-gray-300 font-bold text-lg bg-white text-gray-900 outline-none focus:border-blue-500 min-w-0" 
                        placeholder="06..." 
                        value={landlineInput} 
                        onChange={e => setLandlineInput(e.target.value.replace(/\D/g, ''))} 
                        maxLength={9} 
                      />
                      <button 
                        onClick={addLandline} 
                        className="bg-blue-600 text-white p-3 rounded-xl shadow-sm shrink-0 flex items-center justify-center"
                      >
                        <Plus size={24}/>
                      </button>
                   </div>
                   {tempDoctor.landlines.map((num, i) => (
                      <div key={i} className="flex justify-between items-center bg-white p-3 rounded-xl border border-blue-100 mb-2">
                        <span className="font-bold text-gray-800">{num}</span>
                        <button onClick={() => {const l=[...tempDoctor.landlines];l.splice(i,1);setTempDoctor({...tempDoctor,landlines:l})}} className="text-red-500 p-1"><Trash2 size={20}/></button>
                      </div>
                   ))}
                </div>

                {/* Mobile */}
                <div className="w-full">
                   <label className="block text-sm font-semibold text-gray-600 mb-2">Cellulare</label>
                   <div className="flex gap-2 mb-2 w-full">
                      <input 
                        className="flex-1 p-3 rounded-xl border border-gray-300 font-bold text-lg bg-white text-gray-900 outline-none focus:border-blue-500 min-w-0" 
                        placeholder="333..." 
                        value={mobileInput} 
                        onChange={e => setMobileInput(e.target.value.replace(/\D/g, ''))} 
                        maxLength={10} 
                      />
                      <button 
                        onClick={addMobile} 
                        className="bg-blue-600 text-white p-3 rounded-xl shadow-sm shrink-0 flex items-center justify-center"
                      >
                        <Plus size={24}/>
                      </button>
                   </div>
                   {tempDoctor.mobiles.map((num, i) => (
                      <div key={i} className="flex justify-between items-center bg-white p-3 rounded-xl border border-blue-100 mb-2">
                        <span className="font-bold text-gray-800">{num}</span>
                        <button onClick={() => {const m=[...tempDoctor.mobiles];m.splice(i,1);setTempDoctor({...tempDoctor,mobiles:m})}} className="text-red-500 p-1"><Trash2 size={20}/></button>
                      </div>
                   ))}
                </div>
             </div>

             {/* Section 4: Hours */}
             <div className="bg-gray-100 p-4 rounded-2xl border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Clock size={20}/> Orari Studio</h3>
                <div className="space-y-3">
                  {DAYS_OF_WEEK.map(day => (
                    <div key={day} className={`p-3 rounded-xl border bg-white ${tempDoctor.hours[day]?.closed ? 'opacity-60 border-gray-200' : 'border-teal-100'}`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-gray-900">{day}</span>
                        <button 
                          onClick={() => updateDoctorHour(day, 'closed', !tempDoctor.hours[day]?.closed)}
                          className={`px-3 py-1 rounded-lg font-bold text-xs ${tempDoctor.hours[day]?.closed ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-800'}`}
                        >
                          {tempDoctor.hours[day]?.closed ? 'CHIUSO' : 'APERTO'}
                        </button>
                      </div>
                      {!tempDoctor.hours[day]?.closed && (
                        <div className="flex gap-2 items-center">
                          <input type="time" value={tempDoctor.hours[day]?.start || '09:00'} onChange={e => updateDoctorHour(day, 'start', e.target.value)} className="w-full p-2 rounded-lg border border-gray-300 bg-gray-50 text-center" />
                          <span className="text-gray-400">-</span>
                          <input type="time" value={tempDoctor.hours[day]?.end || '18:00'} onChange={e => updateDoctorHour(day, 'end', e.target.value)} className="w-full p-2 rounded-lg border border-gray-300 bg-gray-50 text-center" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
             </div>

             <div className="mt-4">
               <Button fullWidth onClick={handleSaveEditDoctor} icon={<Save size={20}/>}>
                  Salva Modifiche
               </Button>
             </div>
          </div>
        </ScreenLayout>
      );
  }

  // --- REGISTRATION DOCTOR (WIZARD) ---
  if (currentScreen === Screen.REG_DOCTOR) {
    let title = "", subtitle = "", content = null;

    switch(regStep) {
      case 0:
        title = "Il tuo Dottore";
        subtitle = "È uomo o donna?";
        content = (
          <div className="flex flex-col gap-4 animate-fade-in justify-center h-full pb-20 landscape:pb-4">
            {/* Option Male */}
            <button
              onClick={() => setTempDoctor({...tempDoctor, gender: 'M'})}
              className={`relative w-full p-6 rounded-2xl border-2 transition-all active:scale-95 flex items-center gap-4 shadow-sm ${
                tempDoctor.gender === 'M'
                  ? 'bg-blue-50 border-blue-600'
                  : 'bg-white border-gray-100'
              }`}
            >
               <div className={`p-4 rounded-full ${tempDoctor.gender === 'M' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                  <User size={32} />
               </div>
               <div className="text-left flex-1">
                  <span className={`block text-xl font-bold ${tempDoctor.gender === 'M' ? 'text-blue-900' : 'text-gray-500'}`}>
                    Il Dottore
                  </span>
                  <span className="text-sm font-semibold text-gray-400">(DR.)</span>
               </div>
               {tempDoctor.gender === 'M' && <Check size={24} className="text-blue-600" />}
            </button>

            {/* Option Female */}
            <button
              onClick={() => setTempDoctor({...tempDoctor, gender: 'F'})}
              className={`relative w-full p-6 rounded-2xl border-2 transition-all active:scale-95 flex items-center gap-4 shadow-sm ${
                tempDoctor.gender === 'F'
                  ? 'bg-pink-50 border-pink-500'
                  : 'bg-white border-gray-100'
              }`}
            >
               <div className={`p-4 rounded-full ${tempDoctor.gender === 'F' ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                  <User size={32} />
               </div>
               <div className="text-left flex-1">
                  <span className={`block text-xl font-bold ${tempDoctor.gender === 'F' ? 'text-pink-900' : 'text-gray-500'}`}>
                    La Dottoressa
                  </span>
                  <span className="text-sm font-semibold text-gray-400">(DOTT.SSA)</span>
               </div>
               {tempDoctor.gender === 'F' && <Check size={24} className="text-pink-600" />}
            </button>
          </div>
        );
        break;
      case 1:
        title = "Cognome?";
        subtitle = "Inserisci il cognome del medico";
        content = (
          <div className="flex flex-col h-full justify-center pb-20 landscape:pb-4 animate-fade-in">
             <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
               <Stethoscope size={40} className="text-blue-600" />
             </div>
             <Input ref={inputRef} label="" placeholder="Bianchi" value={tempDoctor.lastName} onChange={e => setTempDoctor({...tempDoctor, lastName: capitalize(e.target.value)})} onKeyDown={e => e.key === 'Enter' && handleDoctorStepNext()} className="text-center text-3xl py-4 font-bold border-2 border-blue-100 focus:border-blue-500 rounded-2xl" />
          </div>
        );
        break;
      case 2:
        title = "Email?";
        subtitle = "Per inviare le ricette";
        content = (
          <div className="flex flex-col h-full justify-center pb-20 landscape:pb-4 animate-fade-in">
             <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
               <Send size={40} className="text-blue-600" />
             </div>
             <Input ref={inputRef} label="" type="email" placeholder="medico@posta.it" value={tempDoctor.email} onChange={e => setTempDoctor({...tempDoctor, email: e.target.value})} onKeyDown={e => e.key === 'Enter' && handleDoctorStepNext()} className="text-center text-2xl py-4 font-medium border-2 border-blue-100 focus:border-blue-500 rounded-2xl" />
          </div>
        );
        break;
      case 3:
        title = "Indirizzo?";
        subtitle = "Dove si trova lo studio";
        content = (
          <div className="flex flex-col h-full justify-center pb-20 landscape:pb-4 animate-fade-in">
             <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
               <MapPin size={40} className="text-blue-600" />
             </div>
             <Input ref={inputRef} label="" placeholder="Via Roma 10" value={tempDoctor.address} onChange={e => setTempDoctor({...tempDoctor, address: capitalize(e.target.value)})} onKeyDown={e => e.key === 'Enter' && handleDoctorStepNext()} className="text-center text-2xl py-4 font-bold border-2 border-blue-100 focus:border-blue-500 rounded-2xl" />
          </div>
        );
        break;
      case 4:
        title = "Città?";
        subtitle = "In che comune?";
        content = (
          <div className="flex flex-col h-full justify-center pb-20 landscape:pb-4 animate-fade-in">
             <Input ref={inputRef} label="" placeholder="Roma" value={tempDoctor.city} onChange={e => setTempDoctor({...tempDoctor, city: capitalize(e.target.value)})} onKeyDown={e => e.key === 'Enter' && handleDoctorStepNext()} className="text-center text-3xl py-4 font-bold border-2 border-blue-100 focus:border-blue-500 rounded-2xl" />
          </div>
        );
        break;
      case 5:
        title = "CAP?";
        subtitle = "Codice Postale (5 numeri)";
        content = (
          <div className="flex flex-col h-full justify-center pb-20 landscape:pb-4 animate-fade-in">
             <Input ref={inputRef} label="" placeholder="00100" maxLength={5} value={tempDoctor.cap} onChange={e => setTempDoctor({...tempDoctor, cap: e.target.value.replace(/\D/g, '')})} onKeyDown={e => e.key === 'Enter' && handleDoctorStepNext()} className="text-center text-3xl py-4 font-bold border-2 border-blue-100 focus:border-blue-500 rounded-2xl" />
          </div>
        );
        break;
      case 6:
        title = "Contatti?";
        subtitle = "Dove possiamo chiamarlo?";
        content = (
          <div className="flex flex-col h-full justify-start pt-2 pb-20 landscape:pb-4 animate-fade-in overflow-y-auto px-1">
             <div className="space-y-6">
               
               {/* Telefono Fisso */}
               <div className="flex flex-col gap-2">
                 <div className="flex items-center gap-2 px-1">
                    <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                      <Phone size={18} />
                    </div>
                    <label className="text-base font-bold text-gray-800">Telefono Fisso</label>
                 </div>
                 
                 <div className={`bg-white p-1 pr-1 rounded-xl border-2 transition-all flex items-center shadow-sm w-full ${landlineInput.length === 9 ? 'border-blue-500 ring-2 ring-blue-50' : 'border-gray-200 focus-within:border-blue-400'}`}>
                    <input 
                      ref={inputRef}
                      className="flex-1 pl-3 py-2 text-xl font-bold text-gray-900 outline-none bg-transparent placeholder:text-gray-300 tracking-wider min-w-0"
                      placeholder="06..." 
                      value={landlineInput} 
                      onChange={e => setLandlineInput(e.target.value.replace(/\D/g, ''))} 
                      type="tel" 
                      maxLength={9} 
                    />
                    <button 
                      onClick={addLandline} 
                      disabled={landlineInput.length !== 9}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 flex-shrink-0 ${landlineInput.length === 9 ? 'bg-blue-600 text-white shadow-md scale-100' : 'bg-gray-100 text-gray-300 scale-95'}`}
                    >
                      <Plus size={20}/>
                    </button>
                 </div>

                 {tempDoctor.landlines.length > 0 && (
                   <div className="grid gap-2 animate-fade-in">
                    {tempDoctor.landlines.map((num, i) => (
                      <div key={i} className="flex justify-between items-center p-2 pl-3 bg-blue-50 border border-blue-100 rounded-xl">
                        <span className="font-bold text-lg text-blue-900 tracking-wider">{num}</span>
                        <button onClick={() => {const l=[...tempDoctor.landlines];l.splice(i,1);setTempDoctor({...tempDoctor,landlines:l})}} className="w-8 h-8 flex items-center justify-center bg-white text-red-500 rounded-lg shadow-sm active:scale-95"><Trash2 size={16}/></button>
                      </div>
                    ))}
                   </div>
                 )}
               </div>

               <div className="w-full h-px bg-gray-100 my-2"></div>

               {/* Cellulare */}
               <div className="flex flex-col gap-2">
                 <div className="flex items-center gap-2 px-1">
                    <div className="p-1.5 bg-green-50 text-green-600 rounded-lg">
                      <Smartphone size={18} />
                    </div>
                    <label className="text-base font-bold text-gray-800">Cellulare</label>
                 </div>

                 <div className={`bg-white p-1 pr-1 rounded-xl border-2 transition-all flex items-center shadow-sm w-full ${mobileInput.length === 10 ? 'border-green-500 ring-2 ring-green-50' : 'border-gray-200 focus-within:border-green-400'}`}>
                    <input 
                      className="flex-1 pl-3 py-2 text-xl font-bold text-gray-900 outline-none bg-transparent placeholder:text-gray-300 tracking-wider min-w-0"
                      placeholder="333..." 
                      value={mobileInput} 
                      onChange={e => setMobileInput(e.target.value.replace(/\D/g, ''))} 
                      type="tel" 
                      maxLength={10} 
                    />
                    <button 
                      onClick={addMobile} 
                      disabled={mobileInput.length !== 10}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 flex-shrink-0 ${mobileInput.length === 10 ? 'bg-green-600 text-white shadow-md scale-100' : 'bg-gray-100 text-gray-300 scale-95'}`}
                    >
                      <Plus size={20}/>
                    </button>
                 </div>

                 {tempDoctor.mobiles.length > 0 && (
                   <div className="grid gap-2 animate-fade-in">
                    {tempDoctor.mobiles.map((num, i) => (
                      <div key={i} className="flex justify-between items-center p-2 pl-3 bg-green-50 border border-green-100 rounded-xl">
                        <span className="font-bold text-lg text-green-900 tracking-wider">{num}</span>
                        <button onClick={() => {const m=[...tempDoctor.mobiles];m.splice(i,1);setTempDoctor({...tempDoctor,mobiles:m})}} className="w-8 h-8 flex items-center justify-center bg-white text-red-500 rounded-lg shadow-sm active:scale-95"><Trash2 size={16}/></button>
                      </div>
                    ))}
                   </div>
                 )}
               </div>

             </div>
          </div>
        );
        break;
      case 7:
        title = "Orari?";
        subtitle = "Quando è aperto lo studio?";
        content = (
          <div className="flex flex-col h-full justify-start pt-2 pb-24 animate-fade-in overflow-y-auto px-1 no-scrollbar landscape:pb-4">
             <div className="bg-blue-50 p-4 rounded-2xl mb-4 border border-blue-100 flex items-start gap-3">
                <Clock className="text-blue-600 shrink-0 mt-1" size={20} />
                <p className="text-sm text-blue-900 leading-snug font-medium">
                  Imposta gli orari di apertura e chiusura per ogni giorno della settimana.
                </p>
             </div>

             <div className="space-y-3">
                  {DAYS_OF_WEEK.map(day => {
                    const isOpen = !tempDoctor.hours[day]?.closed;
                    return (
                    <div key={day} className={`p-4 rounded-2xl border-2 transition-all ${!isOpen ? 'bg-gray-50 border-gray-100' : 'bg-white border-teal-500 shadow-sm'}`}>
                      <div className="flex justify-between items-center mb-3">
                        <span className={`font-bold text-xl ${!isOpen ? 'text-gray-400' : 'text-teal-900'}`}>{day}</span>
                        <button 
                          onClick={() => updateDoctorHour(day, 'closed', isOpen)}
                          className={`relative h-8 w-20 rounded-full transition-colors flex items-center p-1 ${!isOpen ? 'bg-gray-200' : 'bg-teal-600'}`}
                        >
                          <div className={`w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-200 ${!isOpen ? 'translate-x-0' : 'translate-x-12'}`} />
                          <span className={`absolute text-[10px] font-bold ${!isOpen ? 'right-2 text-gray-500' : 'left-2 text-white'}`}>
                             {!isOpen ? 'OFF' : 'ON'}
                          </span>
                        </button>
                      </div>
                      
                      {isOpen && (
                        <div className="flex items-center gap-3 animate-fade-in">
                          <div className="flex-1 bg-gray-50 rounded-xl border border-gray-200 px-2 py-2 flex flex-col items-center">
                             <span className="text-[10px] uppercase font-bold text-gray-400 mb-1">Apre</span>
                             <input 
                               type="time" 
                               value={tempDoctor.hours[day]?.start || '09:00'} 
                               onChange={e => updateDoctorHour(day, 'start', e.target.value)} 
                               className="bg-transparent font-bold text-gray-900 text-lg outline-none text-center w-full p-0" 
                             />
                          </div>
                          <div className="text-gray-300 font-bold">-</div>
                          <div className="flex-1 bg-gray-50 rounded-xl border border-gray-200 px-2 py-2 flex flex-col items-center">
                             <span className="text-[10px] uppercase font-bold text-gray-400 mb-1">Chiude</span>
                             <input 
                               type="time" 
                               value={tempDoctor.hours[day]?.end || '18:00'} 
                               onChange={e => updateDoctorHour(day, 'end', e.target.value)} 
                               className="bg-transparent font-bold text-gray-900 text-lg outline-none text-center w-full p-0" 
                             />
                          </div>
                        </div>
                      )}
                    </div>
                  )})}
             </div>
          </div>
        );
        break;
    }

    return (
      <ScreenLayout title={title} subtitle={subtitle} headerAction={null}>
        {content}
        <NavigationBar onBack={handleDoctorStepBack} onNext={handleDoctorStepNext} />
      </ScreenLayout>
    );
  }

  if (currentScreen === Screen.REG_MEDS) {
    const filteredMedsList = tempMeds.filter(med => med.type === medType);
    return (
      <ScreenLayout title="Farmaci" subtitle="Aggiungi ciò che ti serve" headerAction={<button onClick={goBack} className="bg-gray-100 p-2 rounded-full"><X size={24} /></button>}>
        <div className="bg-teal-50 p-4 rounded-3xl border border-teal-100 mb-6">
          <div className="flex gap-2 mb-4">
             <button onClick={() => setMedType('farmaco')} className={`flex-1 py-3 rounded-xl text-lg font-bold border-2 transition-all ${medType === 'farmaco' ? 'bg-orange-500 border-orange-600 text-white shadow-md' : 'bg-white text-gray-400 border-gray-200'}`}>Farmaco</button>
             <button onClick={() => setMedType('visita')} className={`flex-1 py-3 rounded-xl text-lg font-bold border-2 transition-all ${medType === 'visita' ? 'bg-blue-600 border-blue-700 text-white shadow-md' : 'bg-white text-gray-400 border-gray-200'}`}>Visita</button>
          </div>

          {/* Scan button - only for farmaco */}
          {medType === 'farmaco' && (
            <div className="mb-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleScanPhoto}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={scanning}
                className="w-full py-3 rounded-xl border-2 border-dashed border-teal-300 bg-white text-teal-700 font-bold flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
              >
                {scanning ? (
                  <>
                    <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                    Analisi in corso...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                    Scansiona Confezione
                  </>
                )}
              </button>
            </div>
          )}

          {/* Scan results */}
          {scanResults.length > 0 && (
            <div className="mb-4 space-y-2">
              <p className="text-xs font-bold text-teal-600 uppercase tracking-wide">Trovati:</p>
              {scanResults.map((name) => (
                <div key={name} className="flex items-center gap-2 bg-white p-3 rounded-xl border border-teal-200">
                  <span className="flex-1 font-bold text-gray-900 text-sm">{name}</span>
                  <button
                    onClick={() => addScannedMed(name)}
                    className="bg-teal-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold active:scale-95 transition-transform flex items-center gap-1"
                  >
                    <Plus size={14} /> Aggiungi
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700 ml-1">{medType === 'farmaco' ? 'Nome Farmaco' : 'Tipo Visita'}</label>
            <div className="flex items-center gap-2 w-full">
              <input 
                ref={inputRef}
                className="flex-1 p-4 rounded-xl border border-gray-300 text-xl font-bold bg-white outline-none focus:border-teal-500 placeholder:text-gray-300 min-w-0" 
                placeholder={medType === 'farmaco' ? "Es. Aspirina..." : "Es. Controllo..."} 
                value={medInput} 
                onChange={e => setMedInput(e.target.value.toUpperCase())} 
                onKeyDown={e => e.key === 'Enter' && handleAddMed()} 
              />
              <button 
                onClick={handleAddMed} 
                disabled={!medInput.trim()} 
                className="w-16 h-[3.8rem] bg-teal-600 text-white rounded-xl shadow-md flex items-center justify-center active:scale-95 disabled:opacity-50 shrink-0"
              >
                <Plus size={32} />
              </button>
            </div>
          </div>
        </div>
        
        <div className="space-y-3 pb-24 landscape:pb-4">
          <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Lista {medType === 'farmaco' ? 'Farmaci' : 'Visite'} ({filteredMedsList.length})</h3>
          {filteredMedsList.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl">
              <p className="text-gray-400 italic">Lista Vuota</p>
            </div>
          ) : (
            filteredMedsList.map(med => (
              <div key={med.id} className="bg-white border border-gray-100 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                   <div className={`flex-shrink-0 p-3 rounded-full ${med.type === 'farmaco' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                     {med.type === 'farmaco' ? <Pill size={24}/> : <Stethoscope size={24}/>}
                   </div>
                   <span className="text-lg font-bold text-gray-900 leading-tight break-words pr-2">{med.name}</span>
                </div>
                <button 
                  onClick={() => {const updated = tempMeds.filter(m => m.id !== med.id); setTempMeds(updated); updateField('medicines', updated);}} 
                  className="flex-shrink-0 text-red-500 bg-red-50 p-3 rounded-xl hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={24}/>
                </button>
              </div>
            ))
          )}
          <div ref={medsEndRef} />
        </div>
        
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 z-30 flex justify-center" style={{ paddingBottom: 'calc(3rem + var(--sab))' }}>
            <button 
              onClick={handleCompleteRegistration} 
              className="w-full px-8 py-4 bg-teal-600 text-white font-bold text-xl rounded-xl shadow-lg flex items-center justify-center gap-3 active:scale-95 transition-transform"
            >
              <CheckCircle2 size={28} /> Salva e Esci
            </button>
        </div>
      </ScreenLayout>
    );
  }

  if (currentScreen === Screen.HOME) {
    const hasDoctor = !!data.doctor.lastName;
    const studioStatus = getStudioStatus();

    return (
      <div className="h-[100dvh] bg-gray-50 flex flex-col relative overflow-hidden screen-enter">
        
        <div className="bg-teal-700 text-white rounded-b-[3rem] shadow-lg pb-12 landscape:pb-16 flex flex-col px-4 shrink-0 z-10 relative overflow-hidden" style={{ paddingTop: 'calc(1.5rem + var(--sat))' }}>
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute -top-10 -right-10"><Stethoscope size={200} /></div>
            </div>

           <div className="w-full flex justify-start mb-4 mt-3">
             <button 
               onClick={() => goToScreen(Screen.MENU)} 
               className="relative bg-white/10 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white/20 flex items-center gap-2 active:scale-95 transition-transform"
             >
               <Settings size={20} className="text-teal-100" />
               <span className="text-xs font-bold uppercase tracking-wide">Impostazioni</span>
             </button>
           </div>
           
           <div className="text-center w-full">
             <h1 className="relative text-3xl font-black mb-1">
               {data.user.firstName ? `Ciao ${data.user.firstName}` : "Benvenuto"}
             </h1>
             <p className="relative text-teal-100 font-medium">Cosa facciamo oggi?</p>
           </div>
        </div>

        <div className="px-4 -mt-10 landscape:-mt-12 flex-1 flex flex-col relative z-20 min-h-0 overflow-y-auto no-scrollbar landscape:pb-4 landscape:overflow-visible" style={{ paddingBottom: 'calc(10rem + var(--sab))' }}>
          <div className="bg-white p-5 rounded-[2.5rem] shadow-xl border border-gray-100 min-h-full flex flex-col justify-center items-center w-full">
             {!hasDoctor ? (
               <div className="text-center flex flex-col items-center justify-center h-full">
                 <p className="text-gray-500 font-bold mb-6 text-xl max-w-[250px]">Tocca il tasto bianco sopra per inserire i dati!</p>
                 <div className="p-8 bg-gray-50 rounded-full inline-block text-gray-300 border-4 border-dashed border-gray-200"><Stethoscope size={64}/></div>
               </div>
             ) : (
               <div className="w-full flex flex-col items-center justify-between h-full py-2">
                  <div className="flex flex-col items-center gap-2 flex-1 justify-center w-full">
                    <div className="bg-teal-50 p-5 rounded-full text-teal-600 shadow-sm border border-teal-100 relative">
                        <Stethoscope size={40} />
                    </div>
                    
                    <div className="text-center w-full">
                      <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-1">Il tuo medico</p>
                      <h2 className="text-3xl font-black text-gray-900 leading-tight">
                        {data.doctor.gender === 'F' ? 'Dott.ssa' : 'Dr.'} <br/>
                        <span className="text-teal-700">{data.doctor.lastName}</span>
                      </h2>
                    </div>

                    {studioStatus && (
                      <div className={`mt-1 px-5 py-2 rounded-2xl ${studioStatus.bg} ${studioStatus.border} border-2 flex items-center justify-center gap-3 animate-fade-in shadow-sm w-full max-w-[260px] mx-auto`}>
                        <div className="shrink-0">
                           {studioStatus.icon}
                        </div>
                        <div className="flex flex-col text-left leading-none">
                            <span className={`font-black text-lg ${studioStatus.color}`}>{studioStatus.label}</span>
                            <span className="text-xs text-gray-600 font-semibold">{studioStatus.detail}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 w-full mt-2 shrink-0">
                     <button onClick={() => setShowStudioDetails(true)} className="bg-gray-50 p-3 rounded-2xl flex flex-col items-center gap-1 active:scale-95 border border-gray-200 hover:bg-gray-100 transition-colors">
                       <MapPin size={28} className="text-blue-600"/>
                       <span className="font-bold text-gray-700 text-sm">Studio</span>
                     </button>
                     <button onClick={() => setShowCallMenu(true)} className="bg-gray-50 p-3 rounded-2xl flex flex-col items-center gap-1 active:scale-95 border border-gray-200 hover:bg-gray-100 transition-colors">
                       <Phone size={28} className="text-green-600"/>
                       <span className="font-bold text-gray-700 text-sm">Chiama</span>
                     </button>
                  </div>
               </div>
             )}
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 z-30 flex justify-center" style={{ paddingBottom: 'calc(3rem + var(--sab))' }}>
          <div className="w-full">
            <Button 
              fullWidth 
              onClick={() => goToScreen(Screen.SELECTION)} 
              disabled={!hasDoctor} 
              className="py-5 text-2xl font-black shadow-lg shadow-teal-100 rounded-2xl flex items-center justify-center gap-3" 
            >
              <Send size={28} /> INVIA RICETTE
            </Button>
          </div>
        </div>
        
        {/* Modale Dettagli Studio */}
        {showStudioDetails && (
          <div className="fixed inset-0 bg-white z-50 flex flex-col overflow-hidden animate-fade-in">
             <div className="pt-8 pb-4 px-6 bg-white shrink-0 border-b border-gray-100">
               <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Il Tuo Studio</h2>
                    <p className="text-gray-500 font-medium text-sm">Dove e Quando</p>
                  </div>
                  <button onClick={() => setShowStudioDetails(false)} className="bg-gray-100 p-2 rounded-full"><X size={24}/></button>
               </div>
             </div>
             
             <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
                {/* Map Card */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-lg overflow-hidden mb-8">
                   <div className="relative h-48 bg-gray-200 w-full group cursor-pointer" onClick={() => window.open(`https://maps.google.com/?q=${data.doctor.address}, ${data.doctor.city}`, '_blank')}>
                      <iframe 
                        width="100%" 
                        height="100%" 
                        frameBorder="0" 
                        scrolling="no" 
                        marginHeight={0} 
                        marginWidth={0} 
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(data.doctor.address + ', ' + data.doctor.city)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                        className="pointer-events-none"
                      ></iframe>
                      <div className="absolute inset-0 bg-black/5 group-active:bg-black/10 transition-colors flex items-center justify-center">
                         <div className="bg-white/90 p-3 rounded-full shadow-lg backdrop-blur-sm">
                            <Navigation size={28} className="text-blue-600 fill-blue-600" />
                         </div>
                      </div>
                   </div>
                   <div className="p-6 text-center">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{data.doctor.address}</h3>
                      <p className="text-gray-500 font-medium mb-6">{data.doctor.city}, {data.doctor.cap}</p>
                      <a href={`https://maps.google.com/?q=${data.doctor.address}, ${data.doctor.city}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-100 active:scale-95 transition-transform">
                        <Navigation size={20} className="fill-white"/>
                        Naviga
                      </a>
                   </div>
                </div>

                {/* Hours List */}
                <div className="space-y-3 pb-8">
                   <div className="flex items-center gap-2 mb-2 px-1">
                     <CalendarDays size={24} className="text-teal-600" />
                     <h3 className="text-lg font-bold text-gray-900">Orari Settimanali</h3>
                   </div>
                   {DAYS_OF_WEEK.map((day, idx) => {
                     const isToday = new Date().getDay() === (idx + 1); // JS Sunday is 0, Monday is 1
                     const hours = data.doctor.hours[day];
                     return (
                       <div key={day} className={`p-4 rounded-2xl flex justify-between items-center transition-all ${isToday ? 'bg-teal-50 border-2 border-teal-500 shadow-md scale-[1.02]' : 'bg-white border border-gray-100'}`}>
                          <span className={`font-bold text-lg ${isToday ? 'text-teal-900' : 'text-gray-500'}`}>
                            {day} {isToday && <span className="text-[10px] bg-teal-600 text-white px-2 py-1 rounded-md ml-2 align-middle font-black tracking-wider uppercase">Oggi</span>}
                          </span>
                          <div className={`font-bold ${hours?.closed ? 'text-red-500' : 'text-gray-800'}`}>
                             {hours?.closed ? 'CHIUSO' : `${hours.start} - ${hours.end}`}
                          </div>
                       </div>
                     );
                   })}
                </div>
             </div>
          </div>
        )}

        {showCallMenu && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center p-4" onClick={() => setShowCallMenu(false)}>
            <div className="bg-white rounded-3xl p-6 w-full animate-slide-up shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-2xl font-bold text-gray-900">Chiama Ora</h3>
                 <button onClick={() => setShowCallMenu(false)} className="bg-gray-100 p-2 rounded-full"><X size={24}/></button>
              </div>
              <div className="space-y-4">
                {[...data.doctor.landlines, ...data.doctor.mobiles].map((num, i) => (
                  <a key={i} href={`tel:${num}`} className="flex items-center gap-4 p-4 rounded-2xl bg-teal-50 border border-teal-100 active:scale-95 transition-all">
                    <div className="bg-teal-600 text-white p-3 rounded-full shadow-sm flex-shrink-0"><Phone size={24}/></div>
                    <span className="text-xl font-bold text-gray-900 tracking-wide text-center flex-1">{num}</span>
                  </a>
                ))}
              </div>
              <button onClick={() => setShowCallMenu(false)} className="mt-8 w-full bg-gray-100 text-gray-600 py-4 rounded-2xl font-bold text-lg active:scale-95 transition-transform">Chiudi</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (currentScreen === Screen.SELECTION) {
    const filteredMeds = data.medicines.filter(m => m.type === selectionTab);
    return (
      <ScreenLayout title="Cosa ti serve?" subtitle="Seleziona dalla lista" headerAction={<button onClick={goBack} className="text-gray-500 bg-gray-100 p-2 rounded-full"><X size={24} /></button>}>
        <div className="flex gap-3 mb-6">
           <button onClick={() => setSelectionTab('farmaco')} className={`flex-1 py-3 rounded-xl text-lg font-bold border transition-all ${selectionTab === 'farmaco' ? 'bg-orange-500 border-orange-600 text-white shadow-md' : 'bg-white border-gray-200 text-gray-400'}`}>Farmaci</button>
           <button onClick={() => setSelectionTab('visita')} className={`flex-1 py-3 rounded-xl text-lg font-bold border transition-all ${selectionTab === 'visita' ? 'bg-blue-600 border-blue-700 text-white shadow-md' : 'bg-white border-gray-200 text-gray-400'}`}>Visite</button>
        </div>
        <div className="space-y-3 pb-32 landscape:pb-4">
           {filteredMeds.length === 0 ? (
             <div className="text-center py-12 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl">
               <p className="text-lg font-medium text-gray-400">Lista Vuota</p>
               <button onClick={() => goToScreen(Screen.REG_MEDS)} className="mt-2 text-teal-600 font-bold underline">Aggiungi ora</button>
             </div>
           ) : (
             filteredMeds.map(med => {
               const isSelected = selectedMeds.has(med.id);
               return (
                 <div key={med.id} onClick={() => toggleSelection(med.id)} className={`p-4 rounded-2xl border transition-all active:scale-95 cursor-pointer flex items-center justify-between shadow-sm ${isSelected ? 'bg-teal-50 border-teal-500' : 'bg-white border-gray-100'}`}>
                   <span className={`text-lg font-bold leading-tight flex-1 pr-4 break-words ${isSelected ? 'text-teal-900' : 'text-gray-900'}`}>{med.name}</span>
                   <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-teal-600 border-teal-600' : 'border-gray-300 bg-gray-50'}`}>
                     {isSelected && <Check size={20} className="text-white" />}
                   </div>
                 </div>
               );
             })
           )}
        </div>
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 z-40 flex justify-center" style={{ paddingBottom: 'calc(3rem + var(--sab))' }}>
            <button onClick={handleSendClick} disabled={selectedMeds.size === 0} className={`w-full bg-teal-600 text-white font-bold text-xl py-4 rounded-xl shadow-lg flex items-center justify-center gap-3 ${selectedMeds.size === 0 ? 'opacity-50 grayscale cursor-not-allowed' : 'active:scale-95 shadow-teal-200'} transition-all`}>
              <Send size={24} /> Invia Ora
            </button>
        </div>
        {showSuccess && (
          <div className="fixed inset-0 bg-white/95 z-[100] flex flex-col items-center justify-center p-6 animate-fade-in backdrop-blur-sm">
            <div className="bg-green-100 p-8 rounded-full mb-6 text-green-600 animate-bounce shadow-xl"><CheckCircle2 size={80} /></div>
            <h2 className="text-4xl font-black text-gray-900 mb-4 text-center">Inviata!</h2>
            <p className="text-xl font-medium text-gray-500 text-center mb-8">Il Dottore riceverà la mail.</p>
          </div>
        )}
      </ScreenLayout>
    );
  }
  return (
    <>
      {updateInfo && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-6 animate-fade-in backdrop-blur-sm">
          <div className="bg-white w-full rounded-3xl p-6 shadow-2xl relative animate-slide-up">
            <div className="text-center">
              <div className="bg-teal-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download size={32} className="text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Aggiornamento Disponibile</h3>
              <p className="text-sm text-gray-500 mb-1">Versione {updateInfo.latestVersion}</p>
              {updateInfo.body && (
                <p className="text-xs text-gray-400 mb-4 leading-relaxed max-h-24 overflow-y-auto">{updateInfo.body}</p>
              )}
              <div className="flex flex-col gap-3 mt-4">
                <a
                  href={updateInfo.downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-teal-600 text-white py-3 px-6 rounded-xl font-bold text-lg shadow-md flex items-center justify-center gap-2 active:scale-95 transition-transform"
                  onClick={dismissUpdate}
                >
                  <Download size={20} /> Aggiorna Ora
                </a>
                <button
                  onClick={dismissUpdate}
                  className="w-full bg-gray-100 text-gray-600 py-3 px-6 rounded-xl font-bold text-lg active:scale-95 transition-transform"
                >
                  Più Tardi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default App;
