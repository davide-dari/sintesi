export interface ExtraField {
  key: string;
  label: string;
  placeholder?: string;
  type?: 'text' | 'date' | 'email' | 'tel';
}

export const EXTRAS_BY_PROVIDER: Record<string, ExtraField[]> = {
  tim: [
    { key: 'birthPlace', label: 'Nato/a a (luogo di nascita)', placeholder: 'Es. Roma' },
    { key: 'birthDate', label: 'Data di nascita', type: 'date' },
    { key: 'recapito', label: 'Recapito alternativo', type: 'tel' },
    { key: 'legalRepName', label: 'Legale rappresentante - Nome e cognome', placeholder: 'Solo se azienda' },
    { key: 'legalRepResidenza', label: 'Legale rappresentante - Residenza', placeholder: 'Via...' },
    { key: 'legalRepEmail', label: 'Legale rappresentante - E-mail', type: 'email' },
    { key: 'legalRepRecapito', label: 'Legale rappresentante - Recapito alternativo', type: 'tel' },
  ],
  'tim-fisso': [],
  vodafone: [{ key: 'birthDate', label: 'Data di nascita', type: 'date' }],
  'vodafone-fisso': [{ key: 'birthDate', label: 'Data di nascita', type: 'date' }],
  windtre: [
    { key: 'idType', label: 'Tipo documento d\'identità', placeholder: 'Es. Carta di identità' },
    { key: 'idNumber', label: 'Numero documento', placeholder: 'Es. AB1234567' },
    { key: 'addressNumber', label: 'Numero civico', placeholder: 'Es. 10' },
    { key: 'phone', label: 'Recapito telefonico alternativo', type: 'tel' },
  ],
  'windtre-fisso': [
    { key: 'idType', label: 'Tipo documento d\'identità', placeholder: 'Es. Carta di identità' },
    { key: 'idNumber', label: 'Numero documento', placeholder: 'Es. AB1234567' },
    { key: 'addressNumber', label: 'Numero civico', placeholder: 'Es. 10' },
    { key: 'phone', label: 'Recapito telefonico alternativo', type: 'tel' },
  ],
  iliad: [],
  postemobile: [
    { key: 'birthPlace', label: 'Nato/a a (luogo di nascita)', placeholder: 'Es. Roma' },
    { key: 'birthDate', label: 'Data di nascita', type: 'date' },
    { key: 'idType', label: 'Tipo documento d\'identità', placeholder: 'Es. Carta di identità' },
    { key: 'idNumber', label: 'Numero documento', placeholder: 'Es. AB1234567' },
    { key: 'email', label: 'E-mail', type: 'email' },
    { key: 'motivo', label: 'Motivazione del recesso', placeholder: 'Es. Ho cambiato operatore' },
    { key: 'iban', label: 'IBAN per rimborso', placeholder: 'IT60X0542811101000000123456' },
  ],
  plenitude: [],
  sky: [
    { key: 'email', label: 'E-mail', type: 'email' },
    { key: 'phone', label: 'Telefono', type: 'tel' },
    { key: 'cellulare', label: 'Cellulare', type: 'tel' },
  ],
};

export function getExtrasForProvider(providerId: string | null): ExtraField[] {
  if (!providerId) return [];
  return EXTRAS_BY_PROVIDER[providerId] || [];
}