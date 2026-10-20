import { basename, extname } from 'node:path';
import { uploadToBunny } from './bunny.ts';
import { createDraft } from './cms.ts';
import type { Config } from './config.ts';
import { isStable, scan, type VideoFile } from './scan.ts';
import { loadState, saveState } from './state.ts';

export interface Deps {
  fetch?: typeof fetch;
  now?: () => number;
  log?: (msg: string) => void;
}

/** Título legible a partir del nombre del archivo: "noticiero_2026-10-20.mp4" → "noticiero 2026-10-20". */
export function titleFromFile(path: string): string {
  return basename(path, extname(path)).replace(/[_]+/g, ' ').trim();
}

/** Una pasada: sube los videos nuevos o modificados que ya terminaron de copiarse. */
export async function runOnce(config: Config, deps: Deps = {}): Promise<string[]> {
  const log = deps.log ?? console.log;
  const now = deps.now ?? Date.now;
  const state = await loadState(config.stateFile);
  const pending = (await scan(config.watchDir, config.extensions)).filter((f) => isNew(f, state[f.path]));
  const uploaded: string[] = [];

  for (const file of pending) {
    if (!isStable(file, config.stableSec, now())) {
      log(`Esperando a que termine de copiarse: ${file.path}`);
      continue;
    }
    const title = titleFromFile(file.path);
    try {
      log(`Subiendo ${file.path} (${(file.size / 1e9).toFixed(2)} GB)`);
      const bunnyVideoId = await uploadToBunny(config.bunny, file, title, deps.fetch);
      state[file.path] = { bunnyVideoId, size: file.size, mtimeMs: file.mtimeMs, uploadedAt: new Date(now()).toISOString() };
      await saveState(config.stateFile, state);
      uploaded.push(file.path);
      log(`Listo: ${file.path} → ${bunnyVideoId}`);

      if (config.cms.url && config.cms.token) {
        await createDraft(config.cms, { titulo: title, bunnyVideoId }, deps.fetch).catch((err: Error) =>
          log(`Subido, pero no se pudo crear el borrador en el CMS: ${err.message}`),
        );
      }
    } catch (err) {
      // Se reintenta en la próxima pasada.
      log(`Error con ${file.path}: ${(err as Error).message}`);
    }
  }
  return uploaded;
}

function isNew(file: VideoFile, previous?: { size: number; mtimeMs: number }): boolean {
  return !previous || previous.size !== file.size || previous.mtimeMs !== file.mtimeMs;
}
