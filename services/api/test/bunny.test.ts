import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import type { Playback } from '@coptv/shared';
import { buildApp } from '../src/app';
import { deliver, signUrl } from '../src/bunny';
import { exampleSource } from '../src/catalog/example-data';
import { loadConfig } from '../src/config';

const env = { BUNNY_STREAM_HOST: 'vz-test.b-cdn.net', BUNNY_TOKEN_KEY: 'clave-secreta' };

describe('Bunny', () => {
  it('firma con token de directorio para que valga para todos los segmentos HLS', () => {
    const signed = signUrl('https://vz-test.b-cdn.net/abc-123/playlist.m3u8', 'clave', 1_800_000_000);
    const expected = createHash('sha256')
      .update('clave/abc-123/1800000000token_path=/abc-123/')
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    expect(signed).toBe(
      `https://vz-test.b-cdn.net/bcdn_token=${expected}&expires=1800000000&token_path=%2Fabc-123%2F/abc-123/playlist.m3u8`,
    );
  });

  it('no firma URLs que no son de Bunny', () => {
    const { bunny } = loadConfig(env);
    expect(deliver(bunny, 'https://otra-cdn.example/live.m3u8')).toBe('https://otra-cdn.example/live.m3u8');
  });

  it('entrega el VOD desde Bunny Stream, firmado', async () => {
    const withVideo = async () => {
      const catalog = await exampleSource();
      return {
        ...catalog,
        items: catalog.items.map((i) => (i.content.id === 'documental-raices' ? { ...i, bunnyVideoId: 'abc-123' } : i)),
      };
    };
    const app = buildApp(loadConfig(env), withVideo);
    const playback = (await app.inject('/v1/playback/documental-raices')).json<Playback>();
    expect(playback.url).toMatch(/^https:\/\/vz-test\.b-cdn\.net\/bcdn_token=[\w-]+&expires=\d+&token_path=%2Fabc-123%2F\/abc-123\/playlist\.m3u8$/);
  });

  it('firma el vivo cuando también sale por Bunny', async () => {
    const app = buildApp(loadConfig({ ...env, LIVE_STREAM_URL: 'https://coptv-live.b-cdn.net/vivo/playlist.m3u8' }));
    const playback = (await app.inject('/v1/playback/coptv-en-vivo')).json<Playback>();
    expect(playback.url).toContain('https://coptv-live.b-cdn.net/bcdn_token=');
  });
});
