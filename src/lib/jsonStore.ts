import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

// Lecture d'un fichier JSON de data/ ; renvoie la valeur par défaut s'il n'existe pas ou est illisible.
export function readJson<T>(file: string, fallback: T): T {
  try {
    const p = path.join(DATA_DIR, file);
    if (!fs.existsSync(p)) return fallback;
    return JSON.parse(fs.readFileSync(p, 'utf-8') || 'null') ?? fallback;
  } catch (e) {
    console.error(`Error reading ${file}:`, e);
    return fallback;
  }
}

// Écriture atomique (fichier temporaire puis renommage) pour ne jamais laisser un JSON à moitié écrit.
export function writeJson(file: string, value: unknown) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const p = path.join(DATA_DIR, file);
  const tmp = `${p}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(value, null, 2), 'utf-8');
  fs.renameSync(tmp, p);
}
