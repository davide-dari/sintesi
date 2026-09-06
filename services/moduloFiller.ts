import { PDFDocument, PDFFont, StandardFonts, rgb } from 'pdf-lib';
import { FormOverlay, OverlayField } from '../data/formOverlays';

export interface OverlayData {
  fullName: string;
  firstName: string;
  lastName: string;
  cf: string;
  address: string;
  cap: string;
  city: string;
  province: string;
  contractNumber: string;
  date: string;
}

function getValue(f: OverlayField, data: OverlayData): string {
  switch (f.type) {
    case 'fullName': return data.fullName;
    case 'firstName': return data.firstName;
    case 'lastName': return data.lastName;
    case 'cf': return data.cf;
    case 'address': return data.address;
    case 'cap': return data.cap;
    case 'city': return data.city;
    case 'province': return data.province;
    case 'contractNumber': return data.contractNumber;
    case 'date': return data.date;
    case 'firma': return data.fullName;
    case 'cfBoxes': return data.cf;
    default: return '';
  }
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function drawCfBoxes(page: any, font: PDFFont, value: string, f: OverlayField) {
  const boxW = f.boxW || 12;
  const count = f.count || 16;
  const chars = value.toUpperCase().slice(0, count);
  for (let i = 0; i < chars.length; i++) {
    const cx = f.x + i * boxW + boxW / 2;
    const w = font.widthOfTextAtSize(chars[i], f.size);
    page.drawText(chars[i], { x: cx - w / 2, y: f.y, size: f.size, font, color: rgb(0, 0, 0) });
  }
}

export async function fillOfficialModule(
  base64: string,
  overlay: FormOverlay,
  data: OverlayData,
): Promise<string> {
  const doc = await PDFDocument.load(base64ToBytes(base64), { ignoreEncryption: true });
  const font = await doc.embedFont(StandardFonts.Helvetica);

  for (const f of overlay.fields) {
    const value = getValue(f, data);
    if (!value || !value.trim()) continue;
    const page = doc.getPage(f.page - 1);

    if (f.type === 'cfBoxes') {
      drawCfBoxes(page, font, value, f);
    } else if (f.type === 'check') {
      page.drawText('X', { x: f.x, y: f.y - 2, size: f.size, font, color: rgb(0, 0, 0) });
    } else {
      page.drawText(value, {
        x: f.x,
        y: f.y,
        size: f.size,
        font,
        color: rgb(0, 0, 0),
        maxWidth: f.maxWidth || 380,
      });
    }
  }

  const bytes = await doc.save();
  return bytesToBase64(bytes);
}