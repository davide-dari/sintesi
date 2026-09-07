import { Provider } from './providers';

export type OverlayFieldType =
  | 'fullName'
  | 'firstName'
  | 'lastName'
  | 'cf'
  | 'address'
  | 'cap'
  | 'city'
  | 'province'
  | 'contractNumber'
  | 'date'
  | 'firma'
  | 'check'
  | 'cfBoxes'
  | 'extra';

export interface OverlayField {
  type: OverlayFieldType;
  page: number;
  x: number;
  y: number;
  size: number;
  maxWidth?: number;
  boxW?: number;
  count?: number;
  extraKey?: string;
  width?: number;
  height?: number;
}

export interface FormOverlay {
  providerId: string;
  pageHeight: number;
  fields: OverlayField[];
}

export const FORM_OVERLAYS: FormOverlay[] = [
  {
    providerId: 'tim-fisso',
    pageHeight: 842.04,
    fields: [
      { type: 'contractNumber', page: 2, x: 120, y: 559, size: 11 },
      { type: 'fullName', page: 2, x: 195, y: 523, size: 11 },
      { type: 'cf', page: 2, x: 360, y: 523, size: 11 },
      { type: 'contractNumber', page: 2, x: 250, y: 498, size: 11 },
      { type: 'address', page: 2, x: 215, y: 473, size: 11 },
      { type: 'cap', page: 2, x: 470, y: 473, size: 11 },
      { type: 'city', page: 2, x: 130, y: 449, size: 11 },
      { type: 'date', page: 2, x: 310, y: 350, size: 11 },
      { type: 'date', page: 2, x: 155, y: 190, size: 11 },
      { type: 'firma', page: 2, x: 370, y: 190, size: 11, width: 200, height: 35 },
    ],
  },
  {
    providerId: 'tim',
    pageHeight: 842.04,
    fields: [
      { type: 'fullName', page: 1, x: 170, y: 655, size: 11 },
      { type: 'firstName', page: 1, x: 280, y: 636, size: 11 },
      { type: 'lastName', page: 1, x: 330, y: 612, size: 11 },
      { type: 'cf', page: 1, x: 230, y: 587, size: 11 },
      { type: 'address', page: 1, x: 250, y: 538, size: 11 },
      { type: 'city', page: 1, x: 120, y: 513, size: 11 },
      { type: 'cap', page: 1, x: 290, y: 513, size: 11 },
      { type: 'province', page: 1, x: 460, y: 513, size: 11 },
      { type: 'extra', extraKey: 'birthPlace', page: 1, x: 110, y: 563, size: 11 },
      { type: 'extra', extraKey: 'birthDate', page: 1, x: 435, y: 563, size: 11 },
      { type: 'extra', extraKey: 'recapito', page: 1, x: 160, y: 489, size: 11 },
      { type: 'extra', extraKey: 'legalRepName', page: 1, x: 160, y: 413, size: 11 },
      { type: 'extra', extraKey: 'legalRepResidenza', page: 1, x: 160, y: 389, size: 11 },
      { type: 'extra', extraKey: 'legalRepEmail', page: 1, x: 90, y: 364, size: 11 },
      { type: 'extra', extraKey: 'legalRepRecapito', page: 1, x: 160, y: 339, size: 11 },
      { type: 'contractNumber', page: 1, x: 200, y: 265, size: 11 },
      { type: 'date', page: 2, x: 100, y: 469, size: 11 },
      { type: 'firma', page: 2, x: 351, y: 431, size: 11, width: 200, height: 38 },
    ],
  },
  {
    providerId: 'vodafone',
    pageHeight: 841.89,
    fields: [
      { type: 'firstName', page: 1, x: 130, y: 735, size: 10 },
      { type: 'lastName', page: 1, x: 350, y: 735, size: 10 },
      { type: 'cf', page: 1, x: 170, y: 715, size: 10 },
      { type: 'extra', extraKey: 'birthDate', page: 1, x: 420, y: 715, size: 10 },
      { type: 'address', page: 1, x: 115, y: 695, size: 10 },
      { type: 'city', page: 1, x: 180, y: 675, size: 10 },
      { type: 'province', page: 1, x: 460, y: 675, size: 10 },
      { type: 'cap', page: 1, x: 510, y: 675, size: 10 },
      { type: 'check', page: 1, x: 33, y: 602, size: 11 },
      { type: 'date', page: 1, x: 80, y: 204, size: 10 },
      { type: 'firma', page: 1, x: 245, y: 136, size: 10, width: 200, height: 30 },
    ],
  },
  {
    providerId: 'vodafone-fisso',
    pageHeight: 841.89,
    fields: [
      { type: 'firstName', page: 1, x: 130, y: 735, size: 10 },
      { type: 'lastName', page: 1, x: 350, y: 735, size: 10 },
      { type: 'cf', page: 1, x: 170, y: 715, size: 10 },
      { type: 'extra', extraKey: 'birthDate', page: 1, x: 420, y: 715, size: 10 },
      { type: 'address', page: 1, x: 115, y: 695, size: 10 },
      { type: 'city', page: 1, x: 180, y: 675, size: 10 },
      { type: 'province', page: 1, x: 460, y: 675, size: 10 },
      { type: 'cap', page: 1, x: 510, y: 675, size: 10 },
      { type: 'check', page: 1, x: 33, y: 602, size: 11 },
      { type: 'date', page: 1, x: 80, y: 204, size: 10 },
      { type: 'firma', page: 1, x: 245, y: 136, size: 10, width: 200, height: 30 },
    ],
  },
  {
    providerId: 'windtre',
    pageHeight: 841.89,
    fields: [
      { type: 'fullName', page: 1, x: 200, y: 688, size: 10 },
      { type: 'cfBoxes', page: 1, x: 107, y: 667, size: 9, boxW: 12.65, count: 16 },
      { type: 'extra', extraKey: 'idType', page: 1, x: 185, y: 653, size: 10 },
      { type: 'extra', extraKey: 'idNumber', page: 1, x: 340, y: 653, size: 10 },
      { type: 'contractNumber', page: 1, x: 300, y: 639, size: 10 },
      { type: 'address', page: 1, x: 240, y: 625, size: 10 },
      { type: 'extra', extraKey: 'addressNumber', page: 1, x: 325, y: 625, size: 10 },
      { type: 'city', page: 1, x: 400, y: 625, size: 10 },
      { type: 'province', page: 1, x: 120, y: 611, size: 10 },
      { type: 'cap', page: 1, x: 330, y: 611, size: 10 },
      { type: 'extra', extraKey: 'phone', page: 1, x: 290, y: 597, size: 10 },
      { type: 'check', page: 1, x: 148, y: 513, size: 11 },
      { type: 'date', page: 1, x: 80, y: 221, size: 10 },
      { type: 'firma', page: 1, x: 245, y: 136, size: 10, width: 200, height: 30 },
    ],
  },
  {
    providerId: 'windtre-fisso',
    pageHeight: 841.89,
    fields: [
      { type: 'fullName', page: 1, x: 200, y: 688, size: 10 },
      { type: 'cfBoxes', page: 1, x: 107, y: 664, size: 9, boxW: 12.65, count: 16 },
      { type: 'extra', extraKey: 'idType', page: 1, x: 185, y: 652, size: 10 },
      { type: 'extra', extraKey: 'idNumber', page: 1, x: 340, y: 652, size: 10 },
      { type: 'contractNumber', page: 1, x: 300, y: 640, size: 10 },
      { type: 'address', page: 1, x: 240, y: 628, size: 10 },
      { type: 'extra', extraKey: 'addressNumber', page: 1, x: 325, y: 628, size: 10 },
      { type: 'city', page: 1, x: 400, y: 628, size: 10 },
      { type: 'province', page: 1, x: 120, y: 617, size: 10 },
      { type: 'cap', page: 1, x: 330, y: 617, size: 10 },
      { type: 'extra', extraKey: 'phone', page: 1, x: 290, y: 605, size: 10 },
      { type: 'check', page: 1, x: 148, y: 569, size: 11 },
      { type: 'date', page: 1, x: 80, y: 105, size: 10 },
      { type: 'firma', page: 1, x: 245, y: 63, size: 10, width: 200, height: 30 },
    ],
  },
  {
    providerId: 'iliad',
    pageHeight: 842.04,
    fields: [
      { type: 'firstName', page: 1, x: 120, y: 758, size: 10 },
      { type: 'lastName', page: 1, x: 360, y: 758, size: 10 },
      { type: 'cf', page: 1, x: 110, y: 744, size: 10 },
      { type: 'contractNumber', page: 1, x: 430, y: 744, size: 10 },
      { type: 'address', page: 1, x: 176, y: 702, size: 10 },
      { type: 'cap', page: 1, x: 455, y: 702, size: 10 },
      { type: 'city', page: 1, x: 130, y: 688, size: 10 },
      { type: 'province', page: 1, x: 455, y: 688, size: 10 },
      { type: 'check', page: 1, x: 78, y: 610, size: 11 },
      { type: 'date', page: 1, x: 120, y: 52, size: 10 },
      { type: 'firma', page: 1, x: 450, y: 22, size: 10, width: 130, height: 30 },
    ],
  },
  {
    providerId: 'postemobile',
    pageHeight: 841.89,
    fields: [
      { type: 'firstName', page: 1, x: 60, y: 656, size: 10 },
      { type: 'lastName', page: 1, x: 330, y: 656, size: 10 },
      { type: 'extra', extraKey: 'birthPlace', page: 1, x: 60, y: 642, size: 10 },
      { type: 'extra', extraKey: 'birthDate', page: 1, x: 315, y: 642, size: 10 },
      { type: 'cf', page: 1, x: 440, y: 642, size: 10 },
      { type: 'address', page: 1, x: 85, y: 628, size: 10 },
      { type: 'city', page: 1, x: 330, y: 628, size: 10 },
      { type: 'extra', extraKey: 'idType', page: 1, x: 205, y: 614, size: 10 },
      { type: 'extra', extraKey: 'idNumber', page: 1, x: 395, y: 614, size: 10 },
      { type: 'extra', extraKey: 'email', page: 1, x: 210, y: 600, size: 10 },
      { type: 'contractNumber', page: 1, x: 75, y: 558, size: 10 },
      { type: 'extra', extraKey: 'motivo', page: 1, x: 36, y: 515, size: 10 },
      { type: 'extra', extraKey: 'iban', page: 1, x: 110, y: 347, size: 10 },
      { type: 'city', page: 1, x: 60, y: 213, size: 10 },
      { type: 'date', page: 1, x: 235, y: 213, size: 10 },
      { type: 'firma', page: 1, x: 409, y: 183, size: 10, width: 150, height: 30 },
    ],
  },
  {
    providerId: 'plenitude',
    pageHeight: 842,
    fields: [
      { type: 'fullName', page: 1, x: 210, y: 659, size: 10 },
      { type: 'cf', page: 1, x: 150, y: 636, size: 10 },
      { type: 'contractNumber', page: 1, x: 170, y: 542, size: 10 },
      { type: 'address', page: 1, x: 160, y: 514, size: 10 },
      { type: 'date', page: 1, x: 130, y: 241, size: 10 },
      { type: 'firma', page: 1, x: 350, y: 163, size: 10, width: 200, height: 30 },
    ],
  },
  {
    providerId: 'sky',
    pageHeight: 841.89,
    fields: [
      { type: 'fullName', page: 1, x: 200, y: 694, size: 10 },
      { type: 'firstName', page: 1, x: 110, y: 669, size: 10 },
      { type: 'lastName', page: 1, x: 370, y: 669, size: 10 },
      { type: 'contractNumber', page: 1, x: 170, y: 639, size: 10 },
      { type: 'cf', page: 1, x: 420, y: 639, size: 10 },
      { type: 'address', page: 1, x: 130, y: 609, size: 10 },
      { type: 'city', page: 1, x: 110, y: 580, size: 10 },
      { type: 'extra', extraKey: 'email', page: 1, x: 340, y: 580, size: 10 },
      { type: 'extra', extraKey: 'phone', page: 1, x: 110, y: 550, size: 10 },
      { type: 'extra', extraKey: 'cellulare', page: 1, x: 350, y: 550, size: 10 },
      { type: 'date', page: 1, x: 80, y: 151, size: 10 },
      { type: 'firma', page: 1, x: 360, y: 121, size: 10, width: 200, height: 30 },
    ],
  },
];

export function getFormOverlay(providerId: string): FormOverlay | undefined {
  return FORM_OVERLAYS.find(o => o.providerId === providerId);
}

export function hasOverlay(p: Provider): boolean {
  return !!getFormOverlay(p.id);
}