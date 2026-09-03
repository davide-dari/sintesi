
export const APP_VERSION = '1.3';

export interface Medicine {
  id: string;
  name: string;
  type: 'farmaco' | 'visita';
  selected?: boolean; // Used in selection screen
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
    [key: string]: DoctorHours; // 'Lun', 'Mar', etc.
  };
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  // Email removed
}

export interface AppData {
  isRegistered: boolean;
  user: UserProfile;
  doctor: DoctorProfile;
  medicines: Medicine[];
}

export const DAYS_OF_WEEK = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì'];

export const INITIAL_DATA: AppData = {
  isRegistered: false,
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
};
