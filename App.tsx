
import React, { useState, useRef, useEffect } from 'react';
import {
  Stethoscope,
  User,
  Plus,
  Trash2,
  Clock,
  Send,
  Pill,
  MapPin,
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
  Download,
  Upload,
  Copy,
  AlertTriangle,
  Home,
  Sparkles,
  Smartphone,
  Database,
} from 'lucide-react';
import { useAppStorage } from './services/storage';
import { useUpdateChecker } from './services/updater';
import { Button, Input, NavigationBar, ScreenLayout } from './components/UI';
import { AppData, Medicine, DAYS_OF_WEEK } from './types';

enum Screen {
  WELCOME,
  MENU,
  PROFILE_CHOICE,
  INTRO_USER,
  REG_NAME,
  INTRO_DOCTOR,
  REG_DOCTOR,
  REG_MEDS,
  HOME,
  SELECTION,
  EDIT_USER,
  EDIT_DOCTOR,
  MENU_SETTINGS,
}

type BackupMode = 'none' | 'export' | 'import';

const App: React.FC = () => {
  const { data, saveData, updateField, loaded } = useAppStorage();
  const { updateInfo, dismissUpdate } = useUpdateChecker();
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.WELCOME);

  const [regStep, setRegStep] = useState(0);
  const [welcomeName, setWelcomeName] = useState('');

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

  const [backupMode, setBackupMode] = useState<BackupMode>('none');
  const [importText, setImportText] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const medsEndRef = useRef<HTMLDivElement>(null);
  const historyInitialized = useRef(false);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (backupMode === 'none') setImportText('');
  }, [backupMode]);

  useEffect(() => {}, []);

  useEffect(() => {
    if (loaded) {
      setTempUser(data.user);
      setTempDoctor(data.doctor);
      setTempMeds(data.medicines);
      if (!historyInitialized.current) {
        const startScreen = data.hasCompletedWelcome ? Screen.MENU : Screen.WELCOME;
        setCurrentScreen(startScreen);
        window.history.replaceState({ screen: startScreen }, '');
        historyInitialized.current = true;
      }
    }
  }, [loaded, data]);

  useEffect(() => {
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

  useEffect(() => {
    if (inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [regStep, currentScreen]);

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

  if (!loaded) return (
    <div className="h-[100dvh] flex items-center justify-center bg-teal-50">
      <div className="text-teal-700 text-2xl font-bold">Caricamento...</div>
    </div>
  );

  const goToScreen = (screen: Screen, startStep?: number) => {
    setRegStep(startStep ?? 0);
    window.history.pushState({ screen }, '');
    setCurrentScreen(screen);
  };

  const goBack = () => window.history.back();

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const capitalize = (str: string) => {
    if (!str) return '';
    return str.replace(/\b[\p{L}]/gu, l => l.toUpperCase());
  };

  const getStudioStatus = () => {
    if (!data.doctor.hours) return null;
    const now = new Date();
    const dayIndex = now.getDay();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    if (dayIndex === 0 || dayIndex === 6) {
      return { isOpen: false, label: 'CHIUSO', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100', icon: <Clock size={20} className="text-red-500" />, detail: 'Buon fine settimana' };
    }
    const arrayIndex = dayIndex - 1;
    const dayName = DAYS_OF_WEEK[arrayIndex];
    const hours = data.doctor.hours[dayName];
    if (!hours || hours.closed) {
      return { isOpen: false, label: 'CHIUSO', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100', icon: <Clock size={20} className="text-red-500" />, detail: 'Oggi chiuso' };
    }
    const [startH, startM] = hours.start.split(':').map(Number);
    const [endH, endM] = hours.end.split(':').map(Number);
    const startMins = startH * 60 + startM;
    const endMins = endH * 60 + endM;
    if (currentMinutes >= startMins && currentMinutes < endMins) {
      return { isOpen: true, label: 'APERTO', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100', icon: <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />, detail: `Fino alle ${hours.end}` };
    } else if (currentMinutes < startMins) {
      return { isOpen: false, label: 'CHIUSO', color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100', icon: <Clock size={20} className="text-orange-500" />, detail: `Apre alle ${hours.start}` };
    } else {
      return { isOpen: false, label: 'CHIUSO', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100', icon: <Clock size={20} className="text-red-500" />, detail: 'A domani' };
    }
  };

  // --- HANDLERS ---
  const handleWelcomeComplete = () => {
    if (!welcomeName.trim()) { alert('Per favore, inserisci il tuo nome'); return; }
    const name = capitalize(welcomeName.trim());
    updateField('profileName', name);
    updateField('user', { ...data.user, firstName: name });
    updateField('hasCompletedWelcome', true);
    goToScreen(Screen.MENU);
  };

  const handleUserStepNext = () => {
    if (regStep === 0) {
      if (tempUser.firstName.trim()) setRegStep(1);
      else alert('Inserisci il nome');
    } else if (regStep === 1) {
      if (tempUser.lastName.trim()) {
        updateField('user', tempUser);
        goToScreen(Screen.INTRO_DOCTOR);
      } else alert('Inserisci il cognome');
    }
  };

  const handleUserStepBack = () => {
    if (regStep === 0) {
      if (currentScreen === Screen.REG_NAME) goBack();
    } else if (regStep === 1 && data.user.firstName.trim()) {
      goBack();
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
      case 7: return true;
      default: return false;
    }
  };

  const handleDoctorStepNext = () => {
    if (!validateDoctorStep()) {
      if (regStep === 6) alert('Inserisci almeno un numero di telefono');
      else if (regStep === 2) alert('Email non valida');
      else if (regStep === 5) alert('CAP non valido (5 cifre)');
      else alert('Compila il campo per continuare');
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
    if (regStep === 0) goToScreen(Screen.INTRO_DOCTOR);
    else setRegStep(regStep - 1);
  };

  const handleSaveEditUser = () => {
    if (!tempUser.firstName.trim() || !tempUser.lastName.trim()) {
      alert('Nome e Cognome sono obbligatori');
      return;
    }
    updateField('user', tempUser);
    goBack();
  };

  const handleSaveEditDoctor = () => {
    if (!tempDoctor.lastName.trim()) { alert('Il cognome è obbligatorio'); return; }
    if (!isValidEmail(tempDoctor.email)) { alert('Email non valida'); return; }
    if (tempDoctor.address.trim().length < 3) { alert('Indirizzo troppo corto'); return; }
    if (!tempDoctor.city.trim()) { alert('Città obbligatoria'); return; }
    if (!/^\d{5}$/.test(tempDoctor.cap)) { alert('CAP non valido (5 cifre)'); return; }
    if (tempDoctor.landlines.length === 0 && tempDoctor.mobiles.length === 0) { alert('Inserisci almeno un telefono'); return; }
    updateField('doctor', tempDoctor);
    goBack();
  };

  const handleAddMed = () => {
    if (!medInput.trim()) return;
    const newMed: Medicine = { id: Date.now().toString(), name: medInput.trim(), type: medType };
    const updated = [...tempMeds, newMed];
    setTempMeds(updated);
    updateField('medicines', updated);
    setMedInput('');
    setTimeout(() => medsEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
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
    } else alert('Il numero fisso deve essere di 9 cifre');
  };

  const addMobile = () => {
    const val = mobileInput.trim();
    if (val && val.length === 10) {
      setTempDoctor({ ...tempDoctor, mobiles: [...(tempDoctor.mobiles || []), val] });
      setMobileInput('');
    } else alert('Il numero di cellulare deve essere di 10 cifre');
  };

  const updateDoctorHour = (day: string, field: 'start' | 'end' | 'closed', value: any) => {
    setTempDoctor(prev => ({
      ...prev,
      hours: { ...prev.hours, [day]: { ...prev.hours[day], [field]: value } }
    }));
  };

  const generateMailto = () => {
    const isMorning = new Date().getHours() < 13;
    const greetingTime = isMorning ? 'Buongiorno' : 'Buonasera';
    const title = data.doctor.gender === 'F' ? 'Dott.ssa' : 'Dr.';
    const selectedItems = data.medicines.filter(m => selectedMeds.has(m.id));
    const medsOnly = selectedItems.filter(m => m.type === 'farmaco');
    const visitsOnly = selectedItems.filter(m => m.type === 'visita');
    let itemsBody = '';
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

  const handleCopyBackup = () => {
    navigator.clipboard.writeText(JSON.stringify(data)).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleRestoreBackup = () => {
    try {
      if (!importText.trim()) return;
      const parsed = JSON.parse(importText);
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

  // ============ WELCOME SCREEN ============
  if (currentScreen === Screen.WELCOME) {
    return (
      <div className="h-[100dvh] bg-gradient-to-b from-teal-600 to-teal-800 flex flex-col items-center justify-center p-8 relative overflow-hidden screen-enter">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-20 -right-20"><Stethoscope size={200} /></div>
          <div className="absolute -bottom-10 -left-10"><Sparkles size={150} /></div>
        </div>
        <div className="z-10 flex flex-col items-center text-center space-y-8 w-full max-w-sm">
          <div className="bg-white/20 backdrop-blur-sm p-8 rounded-full shadow-lg">
            <Stethoscope size={72} className="text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white mb-3">Sintesi</h1>
            <p className="text-xl text-teal-100 font-medium">Ciao! Come ti chiami?</p>
          </div>
          <div className="w-full">
            <input
              ref={inputRef}
              type="text"
              placeholder="Il tuo nome..."
              value={welcomeName}
              onChange={e => setWelcomeName(capitalize(e.target.value))}
              onKeyDown={e => e.key === 'Enter' && handleWelcomeComplete()}
              className="w-full text-center text-3xl py-5 px-6 rounded-2xl bg-white/90 backdrop-blur-sm border-2 border-white/50 focus:border-white outline-none font-bold text-gray-900 placeholder:text-gray-400 shadow-xl"
            />
          </div>
          <button
            onClick={handleWelcomeComplete}
            className="w-full bg-white text-teal-700 py-5 px-8 rounded-2xl text-2xl font-black shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            Continua <ArrowRight size={28} />
          </button>
        </div>
      </div>
    );
  }

  // ============ MENU SCREEN ============
  if (currentScreen === Screen.MENU) {
    const hasProfile = data.isRegistered && data.doctor.lastName;
    return (
      <div className="h-[100dvh] bg-gray-50 flex flex-col relative overflow-hidden screen-enter">
        <div className="bg-teal-700 text-white rounded-b-[3rem] shadow-lg pt-8 pb-16 flex flex-col px-6 shrink-0 z-10 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute -top-10 -right-10"><Stethoscope size={200} /></div>
          </div>
          <div className="text-center w-full z-10">
            <p className="text-teal-200 font-medium text-lg mb-1">Bentornato</p>
            <h1 className="text-4xl font-black">
              {data.profileName || 'Ospite'}
            </h1>
          </div>
        </div>

        <div className="px-6 -mt-10 flex-1 flex flex-col relative z-20 min-h-0 overflow-y-auto no-scrollbar pb-8">
          <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 p-6 flex flex-col gap-4">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest px-1">Cosa vuoi fare?</p>

            <button
              onClick={() => {
                if (hasProfile) {
                  goToScreen(Screen.SELECTION);
                } else {
                  goToScreen(Screen.INTRO_USER);
                }
              }}
              className="w-full flex items-center gap-5 p-6 bg-gradient-to-r from-teal-50 to-teal-100 border-2 border-teal-200 rounded-2xl active:scale-95 transition-all shadow-sm"
            >
              <div className="bg-teal-600 p-4 rounded-2xl text-white shadow-md">
                <Pill size={32} />
              </div>
              <div className="text-left flex-1">
                <h3 className="text-2xl font-black text-gray-900">Ricetta Facile</h3>
                <p className="text-base text-gray-500 font-medium">Gestisci le tue ricette mediche</p>
              </div>
              <ChevronRight size={28} className="text-teal-400" />
            </button>

            {hasProfile && (
              <button
                onClick={() => {
                  setTempUser(data.user);
                  setTempDoctor(data.doctor);
                  goToScreen(Screen.HOME);
                }}
                className="w-full flex items-center gap-5 p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl active:scale-95 transition-all shadow-sm"
              >
                <div className="bg-blue-600 p-4 rounded-2xl text-white shadow-md">
                  <Stethoscope size={32} />
                </div>
                <div className="text-left flex-1">
                  <h3 className="text-2xl font-black text-gray-900">Il Mio Medico</h3>
                  <p className="text-base text-gray-500 font-medium">Vedi info e stato studio</p>
                </div>
                <ChevronRight size={28} className="text-blue-400" />
              </button>
            )}
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 px-6 pt-3 pb-4 bg-white/90 backdrop-blur-sm border-t border-gray-100 z-30">
          <div className="flex gap-3">
            <button onClick={() => setBackupMode('export')} className="flex-1 bg-gray-100 py-4 rounded-2xl flex flex-col items-center gap-1 active:scale-95 transition-all">
              <Download size={24} className="text-gray-600" />
              <span className="font-bold text-gray-600 text-sm">Backup</span>
            </button>
            <button onClick={() => setBackupMode('import')} className="flex-1 bg-gray-100 py-4 rounded-2xl flex flex-col items-center gap-1 active:scale-95 transition-all">
              <Upload size={24} className="text-gray-600" />
              <span className="font-bold text-gray-600 text-sm">Ripristina</span>
            </button>
          </div>
        </div>

        {backupMode !== 'none' && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6 animate-fade-in backdrop-blur-sm">
            <div className="bg-white w-full rounded-3xl p-6 shadow-2xl relative animate-slide-up">
              <button onClick={() => setBackupMode('none')} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full"><X size={24}/></button>
              {backupMode === 'export' ? (
                <div className="text-center">
                  <div className="bg-teal-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><Database size={32} className="text-teal-600" /></div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">Salva i tuoi dati</h3>
                  <p className="text-gray-500 mb-6 leading-relaxed">Copia questo codice e incollalo sull'altro telefono.</p>
                  <div className="bg-gray-100 p-4 rounded-xl mb-4 text-left cursor-pointer" onClick={handleCopyBackup}>
                    <code className="text-sm text-gray-600 break-all line-clamp-4 font-mono">{JSON.stringify(data)}</code>
                  </div>
                  <Button fullWidth onClick={handleCopyBackup} icon={copySuccess ? <Check size={20}/> : <Copy size={20}/>} className={copySuccess ? '!bg-green-600' : ''}>
                    {copySuccess ? 'Copiato!' : 'Copia Codice'}
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="bg-orange-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={32} className="text-orange-500" /></div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">Ripristina dati</h3>
                  <p className="text-gray-500 mb-2 leading-relaxed">Incolla qui il codice dal vecchio telefono.</p>
                  <p className="text-orange-600 font-bold text-sm mb-4">Attenzione: i dati attuali verranno persi.</p>
                  <textarea className="w-full h-32 bg-gray-50 border-2 border-gray-200 rounded-xl p-3 text-sm font-mono outline-none focus:border-teal-500 transition-colors mb-4 resize-none" placeholder='Incolla qui il codice...' value={importText} onChange={e => setImportText(e.target.value)} />
                  <Button fullWidth onClick={handleRestoreBackup} icon={<Upload size={20}/>}>Carica Dati</Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ============ PROFILE CHOICE ============
  if (currentScreen === Screen.PROFILE_CHOICE) {
    return (
      <div className="h-[100dvh] bg-gradient-to-b from-blue-600 to-blue-800 flex flex-col items-center justify-center p-8 relative overflow-hidden screen-enter">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-20 -right-20"><Stethoscope size={200} /></div>
        </div>
        <div className="z-10 flex flex-col items-center text-center space-y-8 w-full max-w-sm">
          <div className="bg-white/20 backdrop-blur-sm p-8 rounded-full shadow-lg">
            <Stethoscope size={72} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white mb-3">Ricetta Facile</h1>
            <p className="text-xl text-blue-100 font-medium">Cosa vuoi fare?</p>
          </div>
          <div className="w-full space-y-4">
            <button
              onClick={() => goToScreen(Screen.HOME)}
              className="w-full bg-white text-blue-700 py-5 px-8 rounded-2xl text-2xl font-black shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <Check size={28} /> Ripristina Profilo
            </button>
            <button
              onClick={() => goToScreen(Screen.INTRO_USER)}
              className="w-full bg-white/20 backdrop-blur-sm text-white border-2 border-white/40 py-5 px-8 rounded-2xl text-2xl font-black shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <Plus size={28} /> Profilo Nuovo
            </button>
            <button onClick={goBack} className="text-white/70 font-bold text-lg">
              Torna Indietro
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============ INTRO USER ============
  if (currentScreen === Screen.INTRO_USER) {
    return (
      <div className="h-[100dvh] bg-gradient-to-b from-teal-600 to-teal-800 flex flex-col items-center justify-center p-8 relative overflow-hidden screen-enter">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-20 -right-20"><User size={200} /></div>
        </div>
        <div className="z-10 flex flex-col items-center text-center space-y-8 w-full max-w-sm">
          <div className="bg-white p-8 rounded-full shadow-lg">
            <User size={72} className="text-teal-600" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white mb-3">Benvenuto!</h1>
            <p className="text-xl text-teal-100 font-medium">Creiamo il tuo profilo medico.</p>
          </div>
          <div className="w-full space-y-4">
            <button onClick={() => goToScreen(Screen.REG_NAME, data.user.firstName.trim() ? 1 : 0)} className="w-full bg-white text-teal-700 py-5 px-8 rounded-2xl text-2xl font-black shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3">
              Inizia Ora <ArrowRight size={28} />
            </button>
            <button onClick={goBack} className="text-white/70 font-bold text-lg">Torna Indietro</button>
          </div>
        </div>
      </div>
    );
  }

  // ============ REG NAME ============
  if (currentScreen === Screen.REG_NAME) {
    return (
      <ScreenLayout
        title={regStep === 0 ? 'Come ti chiami?' : 'Il tuo cognome?'}
        subtitle={regStep === 0 ? 'Inserisci il tuo nome' : 'Inserisci il tuo cognome'}
      >
        <div className="flex flex-col h-full justify-center pb-20">
          {regStep === 0 && (
            <div className="animate-fade-in">
              <Input ref={inputRef} label="" placeholder="Mario" value={tempUser.firstName} onChange={e => setTempUser({...tempUser, firstName: capitalize(e.target.value)})} onKeyDown={e => e.key === 'Enter' && handleUserStepNext()} className="text-center text-3xl py-5 font-bold border-2 border-teal-100 focus:border-teal-500 rounded-2xl" />
            </div>
          )}
          {regStep === 1 && (
            <div className="animate-fade-in">
              <Input ref={inputRef} label="" placeholder="Rossi" value={tempUser.lastName} onChange={e => setTempUser({...tempUser, lastName: capitalize(e.target.value)})} onKeyDown={e => e.key === 'Enter' && handleUserStepNext()} className="text-center text-3xl py-5 font-bold border-2 border-teal-100 focus:border-teal-500 rounded-2xl" />
            </div>
          )}
        </div>
        <NavigationBar onBack={handleUserStepBack} onNext={handleUserStepNext} />
      </ScreenLayout>
    );
  }

  // ============ INTRO DOCTOR ============
  if (currentScreen === Screen.INTRO_DOCTOR) {
    return (
      <div className="h-[100dvh] bg-gradient-to-b from-blue-600 to-blue-800 flex flex-col items-center justify-center p-8 relative overflow-hidden screen-enter">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-20 -right-20"><Stethoscope size={200} /></div>
        </div>
        <div className="z-10 flex flex-col items-center text-center space-y-8 w-full max-w-sm">
          <div className="bg-white p-8 rounded-full shadow-lg">
            <Stethoscope size={72} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white mb-3">Ottimo!</h1>
            <p className="text-xl text-blue-100 font-medium">Adesso inseriamo i dati del tuo dottore.</p>
          </div>
          <div className="w-full space-y-4">
            <button onClick={() => goToScreen(Screen.REG_DOCTOR)} className="w-full bg-white text-blue-700 py-5 px-8 rounded-2xl text-2xl font-black shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3">
              Continua <ArrowRight size={28} />
            </button>
            <button onClick={goBack} className="text-white/70 font-bold text-lg">Torna Indietro</button>
          </div>
        </div>
      </div>
    );
  }

  // ============ REG DOCTOR (WIZARD) ============
  if (currentScreen === Screen.REG_DOCTOR) {
    let title = '', subtitle = '', content = null;

    switch (regStep) {
      case 0:
        title = 'Il tuo Dottore';
        subtitle = 'Uomo o donna?';
        content = (
          <div className="flex flex-col gap-5 animate-fade-in justify-center h-full pb-20">
            <button onClick={() => setTempDoctor({...tempDoctor, gender: 'M'})} className={`relative w-full p-7 rounded-2xl border-2 transition-all active:scale-95 flex items-center gap-5 shadow-sm ${tempDoctor.gender === 'M' ? 'bg-blue-50 border-blue-600' : 'bg-white border-gray-200'}`}>
              <div className={`p-5 rounded-full ${tempDoctor.gender === 'M' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}><User size={36} /></div>
              <div className="text-left flex-1">
                <span className={`block text-2xl font-black ${tempDoctor.gender === 'M' ? 'text-blue-900' : 'text-gray-500'}`}>Il Dottore</span>
                <span className="text-lg font-semibold text-gray-400">(DR.)</span>
              </div>
              {tempDoctor.gender === 'M' && <Check size={28} className="text-blue-600" />}
            </button>
            <button onClick={() => setTempDoctor({...tempDoctor, gender: 'F'})} className={`relative w-full p-7 rounded-2xl border-2 transition-all active:scale-95 flex items-center gap-5 shadow-sm ${tempDoctor.gender === 'F' ? 'bg-pink-50 border-pink-500' : 'bg-white border-gray-200'}`}>
              <div className={`p-5 rounded-full ${tempDoctor.gender === 'F' ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-400'}`}><User size={36} /></div>
              <div className="text-left flex-1">
                <span className={`block text-2xl font-black ${tempDoctor.gender === 'F' ? 'text-pink-900' : 'text-gray-500'}`}>La Dottoressa</span>
                <span className="text-lg font-semibold text-gray-400">(DOTT.SSA)</span>
              </div>
              {tempDoctor.gender === 'F' && <Check size={28} className="text-pink-600" />}
            </button>
          </div>
        );
        break;
      case 1:
        title = 'Cognome?';
        subtitle = 'Inserisci il cognome del medico';
        content = (
          <div className="flex flex-col h-full justify-center pb-20 animate-fade-in">
            <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"><Stethoscope size={40} className="text-blue-600" /></div>
            <Input ref={inputRef} label="" placeholder="Bianchi" value={tempDoctor.lastName} onChange={e => setTempDoctor({...tempDoctor, lastName: capitalize(e.target.value)})} onKeyDown={e => e.key === 'Enter' && handleDoctorStepNext()} className="text-center text-3xl py-5 font-bold border-2 border-blue-100 focus:border-blue-500 rounded-2xl" />
          </div>
        );
        break;
      case 2:
        title = 'Email?';
        subtitle = 'Per inviare le ricette';
        content = (
          <div className="flex flex-col h-full justify-center pb-20 animate-fade-in">
            <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"><Send size={40} className="text-blue-600" /></div>
            <Input ref={inputRef} label="" type="email" placeholder="medico@posta.it" value={tempDoctor.email} onChange={e => setTempDoctor({...tempDoctor, email: e.target.value})} onKeyDown={e => e.key === 'Enter' && handleDoctorStepNext()} className="text-center text-2xl py-5 font-medium border-2 border-blue-100 focus:border-blue-500 rounded-2xl" />
          </div>
        );
        break;
      case 3:
        title = 'Indirizzo?';
        subtitle = 'Dove si trova lo studio';
        content = (
          <div className="flex flex-col h-full justify-center pb-20 animate-fade-in">
            <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"><MapPin size={40} className="text-blue-600" /></div>
            <Input ref={inputRef} label="" placeholder="Via Roma 10" value={tempDoctor.address} onChange={e => setTempDoctor({...tempDoctor, address: capitalize(e.target.value)})} onKeyDown={e => e.key === 'Enter' && handleDoctorStepNext()} className="text-center text-3xl py-5 font-bold border-2 border-blue-100 focus:border-blue-500 rounded-2xl" />
          </div>
        );
        break;
      case 4:
        title = 'Città?';
        subtitle = 'In che comune?';
        content = (
          <div className="flex flex-col h-full justify-center pb-20 animate-fade-in">
            <Input ref={inputRef} label="" placeholder="Roma" value={tempDoctor.city} onChange={e => setTempDoctor({...tempDoctor, city: capitalize(e.target.value)})} onKeyDown={e => e.key === 'Enter' && handleDoctorStepNext()} className="text-center text-3xl py-5 font-bold border-2 border-blue-100 focus:border-blue-500 rounded-2xl" />
          </div>
        );
        break;
      case 5:
        title = 'CAP?';
        subtitle = 'Codice Postale (5 numeri)';
        content = (
          <div className="flex flex-col h-full justify-center pb-20 animate-fade-in">
            <Input ref={inputRef} label="" placeholder="00100" maxLength={5} value={tempDoctor.cap} onChange={e => setTempDoctor({...tempDoctor, cap: e.target.value.replace(/\D/g, '')})} onKeyDown={e => e.key === 'Enter' && handleDoctorStepNext()} className="text-center text-3xl py-5 font-bold border-2 border-blue-100 focus:border-blue-500 rounded-2xl" />
          </div>
        );
        break;
      case 6:
        title = 'Contatti?';
        subtitle = 'Dove possiamo chiamarlo?';
        content = (
          <div className="flex flex-col h-full justify-start pt-2 pb-20 animate-fade-in overflow-y-auto px-1">
            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 px-1">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Phone size={20} /></div>
                  <label className="text-lg font-bold text-gray-800">Telefono Fisso</label>
                </div>
                <div className={`bg-white p-2 pr-2 rounded-xl border-2 transition-all flex items-center shadow-sm w-full ${landlineInput.length === 9 ? 'border-blue-500 ring-2 ring-blue-50' : 'border-gray-200 focus-within:border-blue-400'}`}>
                  <input ref={inputRef} className="flex-1 pl-4 py-2 text-xl font-bold text-gray-900 outline-none bg-transparent placeholder:text-gray-300 tracking-wider min-w-0" placeholder="06..." value={landlineInput} onChange={e => setLandlineInput(e.target.value.replace(/\D/g, ''))} type="tel" maxLength={9} />
                  <button onClick={addLandline} disabled={landlineInput.length !== 9} className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 flex-shrink-0 ${landlineInput.length === 9 ? 'bg-blue-600 text-white shadow-md scale-100' : 'bg-gray-100 text-gray-300 scale-95'}`}><Plus size={24}/></button>
                </div>
                {tempDoctor.landlines.length > 0 && (
                  <div className="grid gap-2 animate-fade-in">
                    {tempDoctor.landlines.map((num, i) => (
                      <div key={i} className="flex justify-between items-center p-3 pl-4 bg-blue-50 border border-blue-100 rounded-xl">
                        <span className="font-bold text-lg text-blue-900 tracking-wider">{num}</span>
                        <button onClick={() => {const l=[...tempDoctor.landlines];l.splice(i,1);setTempDoctor({...tempDoctor,landlines:l})}} className="w-10 h-10 flex items-center justify-center bg-white text-red-500 rounded-lg shadow-sm active:scale-95"><Trash2 size={18}/></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="w-full h-px bg-gray-100 my-2"></div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 px-1">
                  <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Smartphone size={20} /></div>
                  <label className="text-lg font-bold text-gray-800">Cellulare</label>
                </div>
                <div className={`bg-white p-2 pr-2 rounded-xl border-2 transition-all flex items-center shadow-sm w-full ${mobileInput.length === 10 ? 'border-green-500 ring-2 ring-green-50' : 'border-gray-200 focus-within:border-green-400'}`}>
                  <input className="flex-1 pl-4 py-2 text-xl font-bold text-gray-900 outline-none bg-transparent placeholder:text-gray-300 tracking-wider min-w-0" placeholder="333..." value={mobileInput} onChange={e => setMobileInput(e.target.value.replace(/\D/g, ''))} type="tel" maxLength={10} />
                  <button onClick={addMobile} disabled={mobileInput.length !== 10} className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 flex-shrink-0 ${mobileInput.length === 10 ? 'bg-green-600 text-white shadow-md scale-100' : 'bg-gray-100 text-gray-300 scale-95'}`}><Plus size={24}/></button>
                </div>
                {tempDoctor.mobiles.length > 0 && (
                  <div className="grid gap-2 animate-fade-in">
                    {tempDoctor.mobiles.map((num, i) => (
                      <div key={i} className="flex justify-between items-center p-3 pl-4 bg-green-50 border border-green-100 rounded-xl">
                        <span className="font-bold text-lg text-green-900 tracking-wider">{num}</span>
                        <button onClick={() => {const m=[...tempDoctor.mobiles];m.splice(i,1);setTempDoctor({...tempDoctor,mobiles:m})}} className="w-10 h-10 flex items-center justify-center bg-white text-red-500 rounded-lg shadow-sm active:scale-95"><Trash2 size={18}/></button>
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
        title = 'Orari?';
        subtitle = 'Quando è aperto lo studio?';
        content = (
          <div className="flex flex-col h-full justify-start pt-2 pb-24 animate-fade-in overflow-y-auto px-1 no-scrollbar">
            <div className="bg-blue-50 p-4 rounded-2xl mb-4 border border-blue-100 flex items-start gap-3">
              <Clock className="text-blue-600 shrink-0 mt-1" size={20} />
              <p className="text-base text-blue-900 leading-snug font-medium">Imposta gli orari di apertura e chiusura per ogni giorno.</p>
            </div>
            <div className="space-y-3">
              {DAYS_OF_WEEK.map(day => {
                const isOpen = !tempDoctor.hours[day]?.closed;
                return (
                  <div key={day} className={`p-4 rounded-2xl border-2 transition-all ${!isOpen ? 'bg-gray-50 border-gray-100' : 'bg-white border-teal-500 shadow-sm'}`}>
                    <div className="flex justify-between items-center mb-3">
                      <span className={`font-bold text-xl ${!isOpen ? 'text-gray-400' : 'text-teal-900'}`}>{day}</span>
                      <button onClick={() => updateDoctorHour(day, 'closed', isOpen)} className={`relative h-9 w-24 rounded-full transition-colors flex items-center p-1 ${!isOpen ? 'bg-gray-200' : 'bg-teal-600'}`}>
                        <div className={`w-7 h-7 rounded-full bg-white shadow-sm transition-transform duration-200 ${!isOpen ? 'translate-x-0' : 'translate-x-14'}`} />
                        <span className={`absolute text-xs font-bold ${!isOpen ? 'right-3 text-gray-500' : 'left-2 text-white'}`}>{!isOpen ? 'OFF' : 'ON'}</span>
                      </button>
                    </div>
                    {isOpen && (
                      <div className="flex items-center gap-3 animate-fade-in">
                        <div className="flex-1 bg-gray-50 rounded-xl border border-gray-200 px-2 py-2 flex flex-col items-center">
                          <span className="text-[10px] uppercase font-bold text-gray-400 mb-1">Apre</span>
                          <input type="time" value={tempDoctor.hours[day]?.start || '09:00'} onChange={e => updateDoctorHour(day, 'start', e.target.value)} className="bg-transparent font-bold text-gray-900 text-lg outline-none text-center w-full p-0" />
                        </div>
                        <div className="text-gray-300 font-bold text-xl">-</div>
                        <div className="flex-1 bg-gray-50 rounded-xl border border-gray-200 px-2 py-2 flex flex-col items-center">
                          <span className="text-[10px] uppercase font-bold text-gray-400 mb-1">Chiude</span>
                          <input type="time" value={tempDoctor.hours[day]?.end || '18:00'} onChange={e => updateDoctorHour(day, 'end', e.target.value)} className="bg-transparent font-bold text-gray-900 text-lg outline-none text-center w-full p-0" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
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

  // ============ REG MEDS ============
  if (currentScreen === Screen.REG_MEDS) {
    const filteredMedsList = tempMeds.filter(med => med.type === medType);
    return (
      <ScreenLayout title="Farmaci e Visite" subtitle="Aggiungi ciò che ti serve" headerAction={<button onClick={goBack} className="bg-gray-100 p-2 rounded-full"><X size={24} /></button>}>
        <div className="bg-teal-50 p-5 rounded-3xl border border-teal-100 mb-6">
          <div className="flex gap-3 mb-4">
            <button onClick={() => setMedType('farmaco')} className={`flex-1 py-4 rounded-xl text-xl font-bold border-2 transition-all ${medType === 'farmaco' ? 'bg-orange-500 border-orange-600 text-white shadow-md' : 'bg-white text-gray-400 border-gray-200'}`}>Farmaco</button>
            <button onClick={() => setMedType('visita')} className={`flex-1 py-4 rounded-xl text-xl font-bold border-2 transition-all ${medType === 'visita' ? 'bg-blue-600 border-blue-700 text-white shadow-md' : 'bg-white text-gray-400 border-gray-200'}`}>Visita</button>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-base font-bold text-gray-700 ml-1">{medType === 'farmaco' ? 'Nome Farmaco' : 'Tipo Visita'}</label>
            <div className="flex items-center gap-3 w-full">
              <input ref={inputRef} className="flex-1 p-4 rounded-xl border border-gray-300 text-xl font-bold bg-white outline-none focus:border-teal-500 placeholder:text-gray-300 min-w-0" placeholder={medType === 'farmaco' ? 'Es. Aspirina...' : 'Es. Controllo...'} value={medInput} onChange={e => setMedInput(e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && handleAddMed()} />
              <button onClick={handleAddMed} disabled={!medInput.trim()} className="w-16 h-16 bg-teal-600 text-white rounded-xl shadow-md flex items-center justify-center active:scale-95 disabled:opacity-50 shrink-0">
                <Plus size={32} />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-3 pb-24">
          <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Lista {medType === 'farmaco' ? 'Farmaci' : 'Visite'} ({filteredMedsList.length})</h3>
          {filteredMedsList.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl">
              <p className="text-gray-400 italic text-lg">Lista Vuota</p>
            </div>
          ) : (
            filteredMedsList.map(med => (
              <div key={med.id} className="bg-white border border-gray-100 p-5 rounded-2xl flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={`flex-shrink-0 p-3 rounded-full ${med.type === 'farmaco' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                    {med.type === 'farmaco' ? <Pill size={24}/> : <Stethoscope size={24}/>}
                  </div>
                  <span className="text-xl font-bold text-gray-900 leading-tight break-words pr-2">{med.name}</span>
                </div>
                <button onClick={() => {const updated = tempMeds.filter(m => m.id !== med.id); setTempMeds(updated); updateField('medicines', updated);}} className="flex-shrink-0 text-red-500 bg-red-50 p-3 rounded-xl hover:bg-red-100 transition-colors">
                  <Trash2 size={24}/>
                </button>
              </div>
            ))
          )}
          <div ref={medsEndRef} />
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-5 bg-white border-t border-gray-100 z-30 flex justify-center">
          <button onClick={handleCompleteRegistration} className="w-full px-8 py-5 bg-teal-600 text-white font-bold text-2xl rounded-2xl shadow-lg flex items-center justify-center gap-3 active:scale-95 transition-transform">
            <CheckCircle2 size={32} /> Salva e Esci
          </button>
        </div>
      </ScreenLayout>
    );
  }

  // ============ HOME ============
  if (currentScreen === Screen.HOME) {
    const hasDoctor = !!data.doctor.lastName;
    const studioStatus = getStudioStatus();

    return (
      <div className="h-[100dvh] bg-gray-50 flex flex-col relative overflow-hidden screen-enter">
        <div className="bg-teal-700 text-white rounded-b-[3rem] shadow-lg pt-8 pb-16 flex flex-col px-6 shrink-0 z-10 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute -top-10 -right-10"><Stethoscope size={200} /></div>
          </div>
          <div className="w-full flex justify-between items-center mb-6 mt-2 z-10">
            <button onClick={() => goToScreen(Screen.MENU)} className="bg-white/10 backdrop-blur-sm px-5 py-3 rounded-2xl border border-white/20 flex items-center gap-2 active:scale-95 transition-transform">
              <Home size={22} className="text-teal-100" />
              <span className="text-sm font-bold uppercase tracking-wide">Menu</span>
            </button>
            <button onClick={() => goToScreen(Screen.MENU_SETTINGS)} className="bg-white/10 backdrop-blur-sm px-5 py-3 rounded-2xl border border-white/20 flex items-center gap-2 active:scale-95 transition-transform">
              <Settings size={22} className="text-teal-100" />
              <span className="text-sm font-bold uppercase tracking-wide">Impostazioni</span>
            </button>
          </div>
          <div className="text-center w-full z-10">
            <h1 className="text-3xl font-black mb-1">{data.user.firstName ? `Ciao ${data.user.firstName}` : 'Benvenuto'}</h1>
            <p className="text-teal-100 font-medium text-lg">Cosa facciamo oggi?</p>
          </div>
        </div>

        <div className="px-5 -mt-10 flex-1 flex flex-col relative z-20 min-h-0 overflow-y-auto no-scrollbar pb-8">
          <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-gray-100 min-h-full flex flex-col justify-center items-center w-full">
            {!hasDoctor ? (
              <div className="text-center flex flex-col items-center justify-center h-full">
                <p className="text-gray-500 font-bold mb-6 text-xl max-w-[280px]">Tocca il tasto Impostazioni per inserire i dati del medico!</p>
                <div className="p-8 bg-gray-50 rounded-full inline-block text-gray-300 border-4 border-dashed border-gray-200"><Stethoscope size={64}/></div>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center justify-between h-full py-2">
                <div className="flex flex-col items-center gap-3 flex-1 justify-center w-full">
                  <div className="bg-teal-50 p-5 rounded-full text-teal-600 shadow-sm border border-teal-100"><Stethoscope size={44} /></div>
                  <div className="text-center w-full">
                    <p className="text-sm font-bold text-teal-600 uppercase tracking-widest mb-1">Il tuo medico</p>
                    <h2 className="text-3xl font-black text-gray-900 leading-tight">
                      {data.doctor.gender === 'F' ? 'Dott.ssa' : 'Dr.'} <br/>
                      <span className="text-teal-700">{data.doctor.lastName}</span>
                    </h2>
                  </div>
                  {studioStatus && (
                    <div className={`mt-2 px-6 py-3 rounded-2xl ${studioStatus.bg} ${studioStatus.border} border-2 flex items-center justify-center gap-3 animate-fade-in shadow-sm w-full max-w-[280px] mx-auto`}>
                      <div className="shrink-0">{studioStatus.icon}</div>
                      <div className="flex flex-col text-left leading-none">
                        <span className={`font-black text-xl ${studioStatus.color}`}>{studioStatus.label}</span>
                        <span className="text-sm text-gray-600 font-semibold">{studioStatus.detail}</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="pt-5 border-t border-gray-100 grid grid-cols-2 gap-4 w-full mt-3 shrink-0">
                  <button onClick={() => setShowStudioDetails(true)} className="bg-gray-50 p-4 rounded-2xl flex flex-col items-center gap-2 active:scale-95 border border-gray-200 hover:bg-gray-100 transition-colors">
                    <MapPin size={32} className="text-blue-600"/>
                    <span className="font-bold text-gray-700 text-base">Studio</span>
                  </button>
                  <button onClick={() => setShowCallMenu(true)} className="bg-gray-50 p-4 rounded-2xl flex flex-col items-center gap-2 active:scale-95 border border-gray-200 hover:bg-gray-100 transition-colors">
                    <Phone size={32} className="text-green-600"/>
                    <span className="font-bold text-gray-700 text-base">Chiama</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 z-30 flex justify-center">
          <button onClick={() => goToScreen(Screen.SELECTION)} disabled={!hasDoctor} className={`w-full py-5 bg-teal-600 text-white font-black text-2xl rounded-2xl shadow-lg flex items-center justify-center gap-3 ${!hasDoctor ? 'opacity-50 grayscale' : 'active:scale-95 shadow-teal-100'} transition-all`}>
            <Send size={28} /> INVIA RICETTE
          </button>
        </div>

        {showStudioDetails && (
          <div className="fixed inset-0 bg-white z-50 flex flex-col overflow-hidden animate-fade-in">
            <div className="pt-8 pb-4 px-6 bg-white shrink-0 border-b border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">Il Tuo Studio</h2>
                  <p className="text-gray-500 font-medium text-base">Dove e Quando</p>
                </div>
                <button onClick={() => setShowStudioDetails(false)} className="bg-gray-100 p-3 rounded-full"><X size={24}/></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
              <div className="bg-white rounded-3xl border border-gray-200 shadow-lg overflow-hidden mb-8">
                <div className="relative h-52 bg-gray-200 w-full group cursor-pointer" onClick={() => window.open(`https://maps.google.com/?q=${data.doctor.address}, ${data.doctor.city}`, '_blank')}>
                  <iframe width="100%" height="100%" frameBorder="0" scrolling="no" marginHeight={0} marginWidth={0} src={`https://maps.google.com/maps?q=${encodeURIComponent(data.doctor.address + ', ' + data.doctor.city)}&t=&z=15&ie=UTF8&iwloc=&output=embed`} className="pointer-events-none"></iframe>
                  <div className="absolute inset-0 bg-black/5 group-active:bg-black/10 transition-colors flex items-center justify-center">
                    <div className="bg-white/90 p-3 rounded-full shadow-lg backdrop-blur-sm"><Navigation size={28} className="text-blue-600 fill-blue-600" /></div>
                  </div>
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{data.doctor.address}</h3>
                  <p className="text-gray-500 font-medium mb-6 text-lg">{data.doctor.city}, {data.doctor.cap}</p>
                  <a href={`https://maps.google.com/?q=${data.doctor.address}, ${data.doctor.city}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-100 active:scale-95 transition-transform text-lg">
                    <Navigation size={20} className="fill-white"/> Naviga
                  </a>
                </div>
              </div>
              <div className="space-y-3 pb-8">
                <div className="flex items-center gap-2 mb-2 px-1">
                  <CalendarDays size={24} className="text-teal-600" />
                  <h3 className="text-lg font-bold text-gray-900">Orari Settimanali</h3>
                </div>
                {DAYS_OF_WEEK.map((day, idx) => {
                  const isToday = new Date().getDay() === (idx + 1);
                  const hours = data.doctor.hours[day];
                  return (
                    <div key={day} className={`p-4 rounded-2xl flex justify-between items-center transition-all ${isToday ? 'bg-teal-50 border-2 border-teal-500 shadow-md scale-[1.02]' : 'bg-white border border-gray-100'}`}>
                      <span className={`font-bold text-lg ${isToday ? 'text-teal-900' : 'text-gray-500'}`}>
                        {day} {isToday && <span className="text-xs bg-teal-600 text-white px-2 py-1 rounded-md ml-2 font-black tracking-wider uppercase">Oggi</span>}
                      </span>
                      <div className={`font-bold text-lg ${hours?.closed ? 'text-red-500' : 'text-gray-800'}`}>
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
                <h3 className="text-2xl font-black text-gray-900">Chiama Ora</h3>
                <button onClick={() => setShowCallMenu(false)} className="bg-gray-100 p-3 rounded-full"><X size={24}/></button>
              </div>
              <div className="space-y-4">
                {[...data.doctor.landlines, ...data.doctor.mobiles].map((num, i) => (
                  <a key={i} href={`tel:${num}`} className="flex items-center gap-4 p-5 rounded-2xl bg-teal-50 border border-teal-100 active:scale-95 transition-all">
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

  // ============ SELECTION ============
  if (currentScreen === Screen.SELECTION) {
    const filteredMeds = data.medicines.filter(m => m.type === selectionTab);
    return (
      <ScreenLayout title="Cosa ti serve?" subtitle="Seleziona dalla lista" headerAction={<button onClick={goBack} className="text-gray-500 bg-gray-100 p-2 rounded-full"><X size={24} /></button>}>
        <div className="flex gap-3 mb-6">
          <button onClick={() => setSelectionTab('farmaco')} className={`flex-1 py-4 rounded-xl text-xl font-bold border transition-all ${selectionTab === 'farmaco' ? 'bg-orange-500 border-orange-600 text-white shadow-md' : 'bg-white border-gray-200 text-gray-400'}`}>Farmaci</button>
          <button onClick={() => setSelectionTab('visita')} className={`flex-1 py-4 rounded-xl text-xl font-bold border transition-all ${selectionTab === 'visita' ? 'bg-blue-600 border-blue-700 text-white shadow-md' : 'bg-white border-gray-200 text-gray-400'}`}>Visite</button>
        </div>
        <div className="space-y-3 pb-32">
          {filteredMeds.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl">
              <p className="text-xl font-medium text-gray-400">Lista Vuota</p>
              <button onClick={() => goToScreen(Screen.REG_MEDS)} className="mt-3 text-teal-600 font-bold underline text-lg">Aggiungi ora</button>
            </div>
          ) : (
            filteredMeds.map(med => {
              const isSelected = selectedMeds.has(med.id);
              return (
                <div key={med.id} onClick={() => toggleSelection(med.id)} className={`p-5 rounded-2xl border transition-all active:scale-95 cursor-pointer flex items-center justify-between shadow-sm ${isSelected ? 'bg-teal-50 border-teal-500' : 'bg-white border-gray-100'}`}>
                  <span className={`text-xl font-bold leading-tight flex-1 pr-4 break-words ${isSelected ? 'text-teal-900' : 'text-gray-900'}`}>{med.name}</span>
                  <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-teal-600 border-teal-600' : 'border-gray-300 bg-gray-50'}`}>
                    {isSelected && <Check size={22} className="text-white" />}
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 z-40 flex justify-center">
          <button onClick={handleSendClick} disabled={selectedMeds.size === 0} className={`w-full bg-teal-600 text-white font-black text-2xl py-5 rounded-2xl shadow-lg flex items-center justify-center gap-3 ${selectedMeds.size === 0 ? 'opacity-50 grayscale cursor-not-allowed' : 'active:scale-95 shadow-teal-200'} transition-all`}>
            <Send size={28} /> Invia Ora
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

  // ============ EDIT USER ============
  if (currentScreen === Screen.EDIT_USER) {
    return (
      <ScreenLayout title="Modifica Profilo" headerAction={<button onClick={goBack} className="bg-gray-100 text-gray-600 p-2 rounded-full"><X size={24} /></button>}>
        <div className="flex flex-col gap-4 pt-2">
          <Input label="Il Tuo Nome" placeholder="Mario" value={tempUser.firstName} onChange={e => setTempUser({...tempUser, firstName: capitalize(e.target.value)})} />
          <Input label="Il Tuo Cognome" placeholder="Rossi" value={tempUser.lastName} onChange={e => setTempUser({...tempUser, lastName: capitalize(e.target.value)})} />
          <div className="mt-4">
            <Button fullWidth onClick={handleSaveEditUser} icon={<Save size={20}/>}>Salva Modifiche</Button>
          </div>
        </div>
      </ScreenLayout>
    );
  }

  // ============ EDIT DOCTOR ============
  if (currentScreen === Screen.EDIT_DOCTOR) {
    return (
      <ScreenLayout title="Modifica Dottore" headerAction={<button onClick={goBack} className="bg-gray-100 text-gray-600 p-2 rounded-full"><X size={24} /></button>}>
        <div className="flex flex-col gap-6 pb-20">
          <div className="flex gap-3">
            <button onClick={() => setTempDoctor({...tempDoctor, gender: 'M'})} className={`flex-1 p-5 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${tempDoctor.gender === 'M' ? 'bg-blue-50 border-blue-500 text-blue-900' : 'bg-white border-gray-200 text-gray-500'}`}>
              <User size={32} /><span className="font-bold text-lg">Il Dottore</span>
            </button>
            <button onClick={() => setTempDoctor({...tempDoctor, gender: 'F'})} className={`flex-1 p-5 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${tempDoctor.gender === 'F' ? 'bg-pink-50 border-pink-500 text-pink-900' : 'bg-white border-gray-200 text-gray-500'}`}>
              <User size={32} /><span className="font-bold text-lg">La Dottoressa</span>
            </button>
          </div>
          <div className="space-y-3">
            <Input label="Cognome Medico" placeholder="Bianchi" value={tempDoctor.lastName} onChange={e => setTempDoctor({...tempDoctor, lastName: capitalize(e.target.value)})} />
            <Input label="Email per Ricette" type="email" placeholder="medico@posta.it" value={tempDoctor.email} onChange={e => setTempDoctor({...tempDoctor, email: e.target.value})} />
            <Input label="Indirizzo Studio" placeholder="Via Roma 10" value={tempDoctor.address} onChange={e => setTempDoctor({...tempDoctor, address: capitalize(e.target.value)})} />
            <div className="flex gap-3">
              <div className="flex-1"><Input label="Città" placeholder="Roma" value={tempDoctor.city} onChange={e => setTempDoctor({...tempDoctor, city: capitalize(e.target.value)})} /></div>
              <div className="w-28"><Input label="CAP" placeholder="00100" maxLength={5} value={tempDoctor.cap} onChange={e => setTempDoctor({...tempDoctor, cap: e.target.value.replace(/\D/g, '')})} className="text-center" /></div>
            </div>
          </div>
          <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
            <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2"><Phone size={20}/> Contatti</h3>
            <div className="mb-4 w-full">
              <label className="block text-base font-semibold text-gray-600 mb-2">Telefono Fisso</label>
              <div className="flex gap-2 mb-2 w-full">
                <input className="flex-1 p-3 rounded-xl border border-gray-300 font-bold text-lg bg-white text-gray-900 outline-none focus:border-blue-500 min-w-0" placeholder="06..." value={landlineInput} onChange={e => setLandlineInput(e.target.value.replace(/\D/g, ''))} maxLength={9} />
                <button onClick={addLandline} className="bg-blue-600 text-white p-3 rounded-xl shadow-sm shrink-0 flex items-center justify-center"><Plus size={24}/></button>
              </div>
              {tempDoctor.landlines.map((num, i) => (
                <div key={i} className="flex justify-between items-center bg-white p-3 rounded-xl border border-blue-100 mb-2">
                  <span className="font-bold text-gray-800 text-lg">{num}</span>
                  <button onClick={() => {const l=[...tempDoctor.landlines];l.splice(i,1);setTempDoctor({...tempDoctor,landlines:l})}} className="text-red-500 p-1"><Trash2 size={20}/></button>
                </div>
              ))}
            </div>
            <div className="w-full">
              <label className="block text-base font-semibold text-gray-600 mb-2">Cellulare</label>
              <div className="flex gap-2 mb-2 w-full">
                <input className="flex-1 p-3 rounded-xl border border-gray-300 font-bold text-lg bg-white text-gray-900 outline-none focus:border-blue-500 min-w-0" placeholder="333..." value={mobileInput} onChange={e => setMobileInput(e.target.value.replace(/\D/g, ''))} maxLength={10} />
                <button onClick={addMobile} className="bg-blue-600 text-white p-3 rounded-xl shadow-sm shrink-0 flex items-center justify-center"><Plus size={24}/></button>
              </div>
              {tempDoctor.mobiles.map((num, i) => (
                <div key={i} className="flex justify-between items-center bg-white p-3 rounded-xl border border-blue-100 mb-2">
                  <span className="font-bold text-gray-800 text-lg">{num}</span>
                  <button onClick={() => {const m=[...tempDoctor.mobiles];m.splice(i,1);setTempDoctor({...tempDoctor,mobiles:m})}} className="text-red-500 p-1"><Trash2 size={20}/></button>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gray-100 p-5 rounded-2xl border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Clock size={20}/> Orari Studio</h3>
            <div className="space-y-3">
              {DAYS_OF_WEEK.map(day => (
                <div key={day} className={`p-3 rounded-xl border bg-white ${tempDoctor.hours[day]?.closed ? 'opacity-60 border-gray-200' : 'border-teal-100'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-gray-900 text-lg">{day}</span>
                    <button onClick={() => updateDoctorHour(day, 'closed', !tempDoctor.hours[day]?.closed)} className={`px-4 py-2 rounded-lg font-bold text-sm ${tempDoctor.hours[day]?.closed ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-800'}`}>
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
            <Button fullWidth onClick={handleSaveEditDoctor} icon={<Save size={20}/>}>Salva Modifiche</Button>
          </div>
        </div>
      </ScreenLayout>
    );
  }

  // ============ MENU SETTINGS ============
  if (currentScreen === Screen.MENU_SETTINGS) {
    return (
      <div className="h-[100dvh] bg-white flex flex-col relative overflow-hidden screen-enter">
        <div className="pt-8 pb-4 px-6 bg-white shrink-0 z-10 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-black text-gray-900">Impostazioni</h1>
            <button onClick={goBack} className="bg-gray-100 p-3 rounded-full"><X size={24} /></button>
          </div>
        </div>
        <div className="flex-1 px-6 py-4 flex flex-col gap-4 overflow-y-auto no-scrollbar pb-24">
          <button onClick={() => goToScreen(Screen.EDIT_USER)} className="w-full flex items-center gap-5 p-6 bg-white border border-gray-200 rounded-2xl shadow-sm active:scale-95 transition-all group">
            <div className="bg-teal-50 p-4 rounded-full text-teal-600"><User size={28} /></div>
            <div className="text-left flex-1">
              <h3 className="text-xl font-black text-gray-900">Profilo personale</h3>
              <p className="text-base text-gray-400 font-medium">Modifica il tuo nome</p>
            </div>
            <ChevronRight size={24} className="text-gray-300" />
          </button>
          <button onClick={() => goToScreen(Screen.EDIT_DOCTOR)} className="w-full flex items-center gap-5 p-6 bg-white border border-gray-200 rounded-2xl shadow-sm active:scale-95 transition-all group">
            <div className="bg-blue-50 p-4 rounded-full text-blue-600"><Stethoscope size={28} /></div>
            <div className="text-left flex-1">
              <h3 className="text-xl font-black text-gray-900">Profilo dottore</h3>
              <p className="text-base text-gray-400 font-medium">Orari, indirizzi e contatti</p>
            </div>
            <ChevronRight size={24} className="text-gray-300" />
          </button>
          <button onClick={() => goToScreen(Screen.REG_MEDS)} className="w-full flex items-center gap-5 p-6 bg-white border border-gray-200 rounded-2xl shadow-sm active:scale-95 transition-all group">
            <div className="bg-orange-50 p-4 rounded-full text-orange-600"><Pill size={28} /></div>
            <div className="text-left flex-1">
              <h3 className="text-xl font-black text-gray-900">Farmaci e visite</h3>
              <p className="text-base text-gray-400 font-medium">Gestisci la tua lista</p>
            </div>
            <ChevronRight size={24} className="text-gray-300" />
          </button>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Gestione Dati</h4>
            <div className="flex gap-3">
              <button onClick={() => setBackupMode('export')} className="flex-1 bg-gray-50 border border-gray-200 p-5 rounded-xl flex flex-col items-center gap-2 active:scale-95 transition-all hover:bg-gray-100">
                <Download size={24} className="text-gray-600" />
                <span className="font-bold text-gray-700 text-sm">Backup</span>
              </button>
              <button onClick={() => setBackupMode('import')} className="flex-1 bg-gray-50 border border-gray-200 p-5 rounded-xl flex flex-col items-center gap-2 active:scale-95 transition-all hover:bg-gray-100">
                <Upload size={24} className="text-gray-600" />
                <span className="font-bold text-gray-700 text-sm">Ripristina</span>
              </button>
            </div>
          </div>
        </div>
        <div className="px-6 pt-3 bg-white shrink-0 z-30 border-t border-gray-100">
          <Button fullWidth onClick={goBack} variant="secondary">Torna alla Home</Button>
        </div>

        {backupMode !== 'none' && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6 animate-fade-in backdrop-blur-sm">
            <div className="bg-white w-full rounded-3xl p-6 shadow-2xl relative animate-slide-up">
              <button onClick={() => setBackupMode('none')} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full"><X size={24}/></button>
              {backupMode === 'export' ? (
                <div className="text-center">
                  <div className="bg-teal-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><Database size={32} className="text-teal-600" /></div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">Salva i tuoi dati</h3>
                  <p className="text-gray-500 mb-6 leading-relaxed">Copia questo codice e incollalo sull'altro telefono.</p>
                  <div className="bg-gray-100 p-4 rounded-xl mb-4 text-left cursor-pointer" onClick={handleCopyBackup}>
                    <code className="text-sm text-gray-600 break-all line-clamp-4 font-mono">{JSON.stringify(data)}</code>
                  </div>
                  <Button fullWidth onClick={handleCopyBackup} icon={copySuccess ? <Check size={20}/> : <Copy size={20}/>} className={copySuccess ? '!bg-green-600' : ''}>
                    {copySuccess ? 'Copiato!' : 'Copia Codice'}
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="bg-orange-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={32} className="text-orange-500" /></div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">Ripristina dati</h3>
                  <p className="text-gray-500 mb-2 leading-relaxed">Incolla qui il codice dal vecchio telefono.</p>
                  <p className="text-orange-600 font-bold text-sm mb-4">Attenzione: i dati attuali verranno persi.</p>
                  <textarea className="w-full h-32 bg-gray-50 border-2 border-gray-200 rounded-xl p-3 text-sm font-mono outline-none focus:border-teal-500 transition-colors mb-4 resize-none" placeholder='Incolla qui il codice...' value={importText} onChange={e => setImportText(e.target.value)} />
                  <Button fullWidth onClick={handleRestoreBackup} icon={<Upload size={20}/>}>Carica Dati</Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {updateInfo && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-6 animate-fade-in backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative animate-slide-up">
            <div className="bg-teal-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Download size={32} className="text-teal-600" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 text-center mb-2">Aggiornamento disponibile</h3>
            <p className="text-gray-500 text-center mb-2 leading-relaxed">
              Versione <span className="font-bold text-teal-700">{updateInfo.latestVersion}</span> disponibile.
            </p>
            {updateInfo.body && (
              <p className="text-sm text-gray-400 text-center mb-6 leading-relaxed line-clamp-3">{updateInfo.body}</p>
            )}
            {!updateInfo.body && <div className="mb-6" />}
            <div className="flex gap-3">
              <button
                onClick={() => dismissUpdate(updateInfo.latestVersion)}
                className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-2xl font-bold text-lg active:scale-95 transition-transform"
              >
                Salta
              </button>
              <a
                href={updateInfo.downloadUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 bg-teal-600 text-white py-4 rounded-2xl font-bold text-lg text-center active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                <Download size={22} /> Aggiorna
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default App;
