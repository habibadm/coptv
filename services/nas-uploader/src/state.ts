import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

export interface Uploaded {
  bunnyVideoId: string;
  size: number;
  mtimeMs: number;
  uploadedAt: string;
}

export type State = Record<string, Uploaded>;

export async function loadState(file: string): Promise<State> {
  try {
    return JSON.parse(await readFile(file, 'utf8')) as State;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return {};
    throw err;
  }
}

/** Escribe a un archivo temporal y lo renombra, para no dejar el estado corrupto si se corta la luz. */
export async function saveState(file: string, state: State): Promise<void> {
  await mkdir(dirname(file), { recursive: true });
  await writeFile(`${file}.tmp`, JSON.stringify(state, null, 2));
  await rename(`${file}.tmp`, file);
}
