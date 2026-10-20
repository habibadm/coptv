import { readdir, stat } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';

export interface VideoFile {
  /** Ruta relativa a la carpeta vigilada; es la clave del estado. */
  path: string;
  absolutePath: string;
  size: number;
  mtimeMs: number;
}

/** Lista los videos de la carpeta y sus subcarpetas, ignorando archivos ocultos y de sistema del NAS. */
export async function scan(root: string, extensions: string[]): Promise<VideoFile[]> {
  const found: VideoFile[] = [];
  async function walk(dir: string) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      // .snapshot, @eaDir (Synology/Asustor), @Recycle (QNAP), #recycle, etc.
      if (/^[.@#]/.test(entry.name)) continue;
      const absolutePath = join(dir, entry.name);
      if (entry.isDirectory()) await walk(absolutePath);
      else if (entry.isFile() && extensions.includes(extname(entry.name).slice(1).toLowerCase())) {
        const info = await stat(absolutePath);
        found.push({ path: relative(root, absolutePath), absolutePath, size: info.size, mtimeMs: info.mtimeMs });
      }
    }
  }
  await walk(root);
  return found.sort((a, b) => a.path.localeCompare(b.path));
}

/** Un archivo está listo si no cambió en los últimos `stableSec` segundos. */
export function isStable(file: VideoFile, stableSec: number, now = Date.now()): boolean {
  return now - file.mtimeMs >= stableSec * 1000;
}
