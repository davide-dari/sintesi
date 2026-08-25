import { createWorker } from 'tesseract.js';

let worker: Awaited<ReturnType<typeof createWorker>> | null = null;

async function getWorker() {
  if (!worker) {
    worker = await createWorker('ita+eng', 1, {
      logger: () => {},
    });
  }
  return worker;
}

export async function scanMedicineFromImage(
  imageData: string
): Promise<string[]> {
  const w = await getWorker();
  const { data } = await w.recognize(imageData);
  const text = data.text;

  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 2);

  const medicineNames = extractMedicineNames(lines);
  return medicineNames;
}

function extractMedicineNames(lines: string[]): string[] {
  const skipWords = [
    'compresse', 'capsule', 'mg', 'ml', 'gocce', 'bustine', 'supposte',
    'crema', 'gel', 'unguento', 'spray', 'soluzione', 'sospensione',
    'farmaco', 'medicinale', 'medicamento', 'uso orale', 'per os',
    'periodo di validita', 'scadenza', 'conservare', 'tenere lontano',
    'ingredienti', 'composizione', 'principio attivo', 'componenti',
    'avvertenze', 'controindicazioni', 'effetti collaterali', 'dosaggio',
    'posologia', 'note legali', 'prodotto da', 'prodotto per',
    'codice a barre', 'batch', 'lotto', 'riferimento', 'classe',
    'ricetta medica', 'senza ricetta', 'otc', 'classe xx',
    'ait', 'a.i.c.', 'numero di registrazione',
    'www', 'http', 'email', 'tel', 'fax',
    'importato da', 'distribuito da', 'prodotto da',
    'confezione', 'formato', 'contiene',
  ];

  const scored = lines
    .filter((line) => {
      const lower = line.toLowerCase();
      return (
        !skipWords.some((w) => lower.includes(w)) &&
        line.length >= 3 &&
        line.length <= 60 &&
        !/^\d+$/.test(line) &&
        !/^[^\w]+$/?.test(line)
      );
    })
    .map((line) => {
      let score = 0;
      if (/^[A-ZÀ-Ú]/.test(line)) score += 2;
      if (line.length >= 5 && line.length <= 30) score += 2;
      if (/^[A-ZÀ-Ú\s\-]+$/.test(line)) score += 3;
      if (/[A-Z]{2,}/.test(line)) score += 1;
      if (/\d+\s*(mg|ml|g)\b/i.test(line)) score += 2;
      return { line, score };
    })
    .sort((a, b) => b.score - a.score);

  const seen = new Set<string>();
  const results: string[] = [];

  for (const { line, score } of scored) {
    if (score < 3) break;
    const normalized = line
      .replace(/\s+/g, ' ')
      .replace(/[^A-ZÀ-Úa-zà-ú0-9\s\-]/g, '')
      .trim();
    if (normalized.length < 3) continue;
    const lower = normalized.toLowerCase();
    if (seen.has(lower)) continue;
    seen.add(lower);
    results.push(capitalizeAll(normalized));
    if (results.length >= 3) break;
  }

  return results;
}

function capitalizeAll(str: string): string {
  return str.replace(/\b\p{L}/gu, (c) => c.toUpperCase());
}

export async function terminateWorker() {
  if (worker) {
    await worker.terminate();
    worker = null;
  }
}
