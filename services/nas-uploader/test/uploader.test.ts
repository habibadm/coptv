import { mkdtemp, mkdir, readFile, utimes, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { slugify } from '../src/cms.ts';
import type { Config } from '../src/config.ts';
import { runOnce, titleFromFile } from '../src/uploader.ts';

let dir: string;
let config: Config;
const HOUR_AGO = (Date.now() - 3600_000) / 1000;

async function video(path: string, content = 'video', mtime = HOUR_AGO) {
  const full = join(dir, 'videos', path);
  await mkdir(join(full, '..'), { recursive: true });
  await writeFile(full, content);
  await utimes(full, mtime, mtime);
}

function fakeBunny() {
  let n = 0;
  return vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
    const u = String(url);
    if (init?.method === 'POST' && u.endsWith('/videos')) return Response.json({ guid: `guid-${++n}` });
    if (init?.method === 'PUT') {
      await new Response(init.body as ReadableStream).arrayBuffer(); // consume el archivo
      return Response.json({ success: true });
    }
    if (init?.method === 'POST' && u.endsWith('/api/contenidos')) return Response.json({ data: {} });
    return new Response('no', { status: 404 });
  });
}

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'nas-'));
  config = {
    watchDir: join(dir, 'videos'),
    stateFile: join(dir, 'data', 'estado.json'),
    extensions: ['mp4', 'mov'],
    scanIntervalSec: 60,
    stableSec: 120,
    bunny: { libraryId: '123', apiKey: 'k', apiUrl: 'https://video.test' },
    cms: { url: '', token: '' },
  };
  await mkdir(config.watchDir, { recursive: true });
});

describe('subida desde el NAS', () => {
  it('sube los videos nuevos, en subcarpetas, y recuerda lo subido', async () => {
    await video('noticiero_2026-10-20.mp4');
    await video('documentales/Raíces.MOV');
    await video('notas.txt');
    await video('@eaDir/miniatura.mp4');
    const fetch = fakeBunny();

    const uploaded = await runOnce(config, { fetch, log: () => {} });
    expect(uploaded).toEqual(['documentales/Raíces.MOV', 'noticiero_2026-10-20.mp4']);

    const state = JSON.parse(await readFile(config.stateFile, 'utf8'));
    expect(state['noticiero_2026-10-20.mp4'].bunnyVideoId).toBe('guid-2');
    const create = fetch.mock.calls.find(([, init]) => init?.method === 'POST');
    expect(create?.[0]).toBe('https://video.test/library/123/videos');
    expect(JSON.parse(String(create?.[1]?.body))).toEqual({ title: 'Raíces' });

    expect(await runOnce(config, { fetch, log: () => {} })).toEqual([]);
  });

  it('espera a que el archivo termine de copiarse', async () => {
    await video('copiando.mp4', 'parcial', Date.now() / 1000);
    expect(await runOnce(config, { fetch: fakeBunny(), log: () => {} })).toEqual([]);
  });

  it('vuelve a subir un archivo que cambió', async () => {
    await video('promo.mp4', 'v1');
    const fetch = fakeBunny();
    await runOnce(config, { fetch, log: () => {} });
    await video('promo.mp4', 'version 2', HOUR_AGO + 60);
    expect(await runOnce(config, { fetch, log: () => {} })).toEqual(['promo.mp4']);
  });

  it('reintenta en la próxima pasada si Bunny falla', async () => {
    await video('promo.mp4');
    const failing = vi.fn(async () => new Response('caído', { status: 500 }));
    expect(await runOnce(config, { fetch: failing, log: () => {} })).toEqual([]);
    expect(await runOnce(config, { fetch: fakeBunny(), log: () => {} })).toEqual(['promo.mp4']);
  });

  it('crea un borrador en el CMS si está configurado', async () => {
    await video('Especial Aniversario.mp4');
    const fetch = fakeBunny();
    await runOnce({ ...config, cms: { url: 'http://cms.test', token: 't' } }, { fetch, log: () => {} });
    const draft = fetch.mock.calls.find(([url]) => String(url) === 'http://cms.test/api/contenidos');
    expect(JSON.parse(String(draft?.[1]?.body)).data).toEqual({
      titulo: 'Especial Aniversario',
      slug: 'especial-aniversario-guid-1',
      tipo: 'movie',
      acceso: 'free',
      bunnyVideoId: 'guid-1',
    });
  });
});

describe('nombres', () => {
  it('arma títulos y slugs legibles', () => {
    expect(titleFromFile('carpeta/noticiero_central.mp4')).toBe('noticiero central');
    expect(slugify('Raíces: Año Nuevo')).toBe('raices-ano-nuevo');
  });
});
