export interface ModuleField {
  key: string;
  label: string;
  type: 'text' | 'date' | 'email' | 'tel';
  page: number;
  x: number;
  y: number;
  size: number;
}

interface Rule {
  key: string;
  re: RegExp;
  type: 'text' | 'date' | 'email' | 'tel';
  label: string;
}

const CLIENT_RULES: Rule[] = [
  { key: 'fullName', re: /NOME E COGNOME|sottoscritto|Sottoscritto/, type: 'text', label: 'Nome e cognome' },
  { key: 'firstName', re: /^\s*NOME\b/, type: 'text', label: 'Nome' },
  { key: 'lastName', re: /^\s*COGNOME\b/, type: 'text', label: 'Cognome' },
  { key: 'cf', re: /CODICE FISCALE|C\.F\.|CODICE FISCALE\/P/, type: 'text', label: 'Codice Fiscale' },
  { key: 'birthDate', re: /DATA DI NASCITA|NATO A.*\bIL\b|\bIL\b.*\bCODICE FISCALE/, type: 'date', label: 'Data di nascita' },
  { key: 'birthPlace', re: /NATO A|Nato a/, type: 'text', label: 'Luogo di nascita' },
  { key: 'address', re: /INDIRIZZO|RESIDENZA|VIA, PIAZZA|Indirizzo di Residenza|Indirizzo/, type: 'text', label: 'Indirizzo' },
  { key: 'addressNumber', re: /NUMERO CIVICO|\bN°\b|Numero:|NUMERO:/, type: 'text', label: 'Numero civico' },
  { key: 'city', re: /LOCALITÀ|CITTÀ|COMUNE|Località|Comune/, type: 'text', label: 'Città' },
  { key: 'cap', re: /\bCAP\b/, type: 'text', label: 'CAP' },
  { key: 'province', re: /\bPROV\b|PROVINCIA/, type: 'text', label: 'Provincia' },
  { key: 'contractNumber', re: /NUMERO DEL TITOLARE|la cessazione del numero|Numero del Titolare|ID ORDINE|ID Utente|CODICE CLIENTE|Numero plico|Numero di linea|Numero del Cliente/, type: 'text', label: 'Numero contratto/linea' },
  { key: 'idType', re: /TIPO.*DOCUMENTO|DOCUMENTO.*TIPO|Tipo Documento/, type: 'text', label: 'Tipo documento' },
  { key: 'idNumber', re: /NUMERO DOCUMENTO|NUMERO:/, type: 'text', label: 'Numero documento' },
  { key: 'iban', re: /\bIBAN\b/, type: 'text', label: 'IBAN' },
  { key: 'motivo', re: /MOTIVAZIONE|Motivazione/, type: 'text', label: 'Motivazione del recesso' },
  { key: 'phone', re: /RECAPITO TELEFONICO|RECAPITO|TELEFONO|CELLULARE/, type: 'tel', label: 'Recapito telefonico' },
  { key: 'email', re: /E-MAIL|E-mail|EMAIL/, type: 'email', label: 'E-mail' },
];

const LEGAL_REP_RULES: Rule[] = [
  { key: 'legalRepName', re: /NOME E COGNOME/, type: 'text', label: 'Legale rappresentante - Nome e cognome' },
  { key: 'legalRepResidenza', re: /RESIDENZA|VIA, PIAZZA|VIA/, type: 'text', label: 'Legale rappresentante - Residenza' },
  { key: 'legalRepEmail', re: /E-MAIL|E-mail|EMAIL/, type: 'email', label: 'Legale rappresentante - E-mail' },
  { key: 'legalRepRecapito', re: /RECAPITO/, type: 'tel', label: 'Legale rappresentante - Recapito' },
];

const RESET_RE = /DICHIARA|CHIEDE|COMUNICA|dichiara|chiede|comunica|In quanto|in quanto|La presente richiesta|Il presente modulo|Per conoscere|Ai sensi|E RICHIEDE|CONFERMA/;

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

interface Line {
  text: string;
  x: number;
  y: number;
  size: number;
  page: number;
}

let pdfjsPromise: Promise<any> | null = null;

async function loadPdfjs(): Promise<any> {
  if (!pdfjsPromise) {
    pdfjsPromise = (async () => {
      const pdfjs = await import('pdfjs-dist');
      try {
        const workerMod = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
        const workerUrl = (workerMod as any).default || (workerMod as any);
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(workerUrl, window.location.href).toString();
      } catch (e) {
        console.warn('Worker setup failed', e);
      }
      return pdfjs;
    })();
  }
  return pdfjsPromise;
}

export async function detectModuleFields(base64: string): Promise<ModuleField[]> {
  let pdfjs;
  try {
    pdfjs = await loadPdfjs();
  } catch (e) {
    console.warn('pdfjs load failed', e);
    return [];
  }

  let doc: any;
  try {
    doc = await pdfjs.getDocument({ data: base64ToBytes(base64), disableFontFace: true }).promise;
  } catch (e) {
    console.warn('Module read error', e);
    return [];
  }

  const lines: Line[] = [];
  for (let p = 1; p <= doc.numPages; p++) {
    let page;
    try {
      page = await doc.getPage(p);
    } catch {
      continue;
    }
    const tc = await page.getTextContent();
    const grouped = new Map<string, Line>();
    for (const item of tc.items as any[]) {
      if (!item.str || !item.str.trim()) continue;
      const x = item.transform[4];
      const y = item.transform[5];
      const size = item.height || 10;
      const lineKey = `${p}:${Math.round(y / 3)}`;
      const existing = grouped.get(lineKey);
      if (existing) {
        existing.text += ' ' + item.str.trim();
        existing.x = Math.min(existing.x, x);
        existing.size = Math.max(existing.size, size);
      } else {
        grouped.set(lineKey, { text: item.str.trim(), x, y, size, page: p });
      }
    }
    lines.push(...grouped.values());
  }

  const fields: ModuleField[] = [];
  const seen = new Set<string>();
  let legalRep = false;

  for (const line of lines) {
    const text = line.text.toUpperCase();

    if (/LEGALE RAPPRESENTANTE|SUO DELEGATO|DELEGATO/.test(text)) {
      legalRep = true;
      continue;
    }
    if (legalRep && RESET_RE.test(text)) {
      legalRep = false;
    }

    const rules = legalRep ? LEGAL_REP_RULES : CLIENT_RULES;
    for (const rule of rules) {
      if (!rule.re.test(text)) continue;
      if (seen.has(rule.key)) break;
      const m = rule.re.exec(text);
      const labelEnd = m ? m[0].length : Math.min(text.length, 60);
      const valueX = line.x + labelEnd * line.size * 0.55;
      fields.push({
        key: rule.key,
        label: rule.label,
        type: rule.type,
        page: line.page,
        x: Math.round(valueX),
        y: Math.round(line.y),
        size: Math.round(line.size),
      });
      seen.add(rule.key);
      break;
    }
  }

  return fields;
}