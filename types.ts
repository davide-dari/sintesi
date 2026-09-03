
export const APP_VERSION = '2.1';

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
}

export interface AppData {
  hasCompletedWelcome: boolean;
  profileName: string;
  user: UserProfile;
  doctor: DoctorProfile;
  medicines: Medicine[];
  isRegistered: boolean;
}

export const DAYS_OF_WEEK = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì'];

export const INITIAL_DATA: AppData = {
  hasCompletedWelcome: false,
  profileName: '',
  user: { firstName: '', lastName: '' },
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
  isRegistered: false,
};
