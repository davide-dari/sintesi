
export const APP_VERSION = '2.2';

export interface Medicine {
  id: string;
  name: string;
  type: 'farmaco' | 'visita';
}

export interface DoctorHours {
  start: string;
  end: string;
  closed: boolean;
}

export interface DoctorProfile {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  cap: string;
  email: string;
  gender: 'M' | 'F';
  landlines: string[];
  mobiles: string[];
  hours: {
    [key: string]: DoctorHours;
  };
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  address: string;
  cap: string;
  city: string;
  province: string;
  fiscalCode: string;
}

export interface Recesso {
  id: string;
  contractType: string;
  contractNumber: string;
  contractDate: string;
  companyName: string;
  companyAddress: string;
  companyPec: string;
}

export interface AppData {
  hasCompletedWelcome: boolean;
  profileName: string;
  user: UserProfile;
  doctor: DoctorProfile;
  medicines: Medicine[];
  recessi: Recesso[];
  isRegistered: boolean;
}

export const DAYS_OF_WEEK = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì'];

export const INITIAL_DATA: AppData = {
  hasCompletedWelcome: false,
  profileName: '',
  user: { firstName: '', lastName: '', address: '', cap: '', city: '', province: '', fiscalCode: '' },
  doctor: {
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    cap: '',
    email: '',
    gender: 'M',
    landlines: [],
    mobiles: [],
    hours: {
      'Lunedì': { start: '09:00', end: '18:00', closed: false },
      'Martedì': { start: '09:00', end: '18:00', closed: false },
      'Mercoledì': { start: '09:00', end: '18:00', closed: false },
      'Giovedì': { start: '09:00', end: '18:00', closed: false },
      'Venerdì': { start: '09:00', end: '18:00', closed: false },
    },
  },
  medicines: [],
  recessi: [],
  isRegistered: false,
};
