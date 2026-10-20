import { describe, expect, it } from 'vitest';
import type { HomeScreen, Playback } from '@coptv/shared';
import { buildApp } from '../src/app';
import { loadConfig } from '../src/config';

const app = buildApp(loadConfig({}));

describe('API', () => {
  it('arma la portada con carriles y contenido', async () => {
    const res = await app.inject('/v1/home');
    const home = res.json<HomeScreen>();
    expect(res.statusCode).toBe(200);
    expect(home.rails.map((r) => r.id)).toContain('en-vivo');
    expect(home.rails.every((r) => r.items.length > 0)).toBe(true);
  });

  it('lista episodios en orden', async () => {
    const res = await app.inject('/v1/content/noticiero-central/episodes');
    expect(res.json().map((e: { episode: number }) => e.episode)).toEqual([1, 2, 3]);
  });

  it('entrega la señal en vivo sin anuncios mientras estén apagados', async () => {
    const res = await app.inject('/v1/playback/coptv-en-vivo');
    const playback = res.json<Playback>();
    expect(playback.isLive).toBe(true);
    expect(playback.url).toMatch(/\.m3u8$/);
    expect(playback.adBreaks).toEqual([]);
  });

  it('agrega pre-roll al VOD cuando se activan los anuncios', async () => {
    const withAds = buildApp(loadConfig({ ADS_ENABLED: 'true', AD_TAG_URL: 'https://ads.example/vast' }));
    const res = await withAds.inject('/v1/playback/documental-raices');
    expect(res.json<Playback>().adBreaks).toEqual([{ offsetSec: 0, vastUrl: 'https://ads.example/vast' }]);
  });

  it('responde 404 para contenido que no existe', async () => {
    const res = await app.inject('/v1/content/no-existe');
    expect(res.statusCode).toBe(404);
  });

  it('busca por título', async () => {
    const res = await app.inject('/v1/search?q=raíc');
    expect(res.json().map((c: { id: string }) => c.id)).toEqual(['documental-raices']);
  });
});
