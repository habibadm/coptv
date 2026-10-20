import { resolve } from 'node:path';
import type { BunnyConfig } from './bunny';

// Señal de prueba pública de Mux hasta tener la de COPTV.
const TEST_STREAM = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';

export interface Config {
  port: number;
  liveStreamUrl: string;
  adsEnabled: boolean;
  adTagUrl: string;
  bunny: BunnyConfig;
  cms: { url: string; token: string; cacheTtlMs: number; mediaUrl: string };
  /** Carpeta con la app de TV ya compilada, para servirla desde la misma dirección. */
  webDir: string;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const cmsUrl = normalizeUrl(env.CMS_URL ?? '');
  return {
    port: Number(env.PORT ?? 4000),
    liveStreamUrl: env.LIVE_STREAM_URL || TEST_STREAM,
    adsEnabled: env.ADS_ENABLED === 'true',
    adTagUrl: env.AD_TAG_URL ?? '',
    bunny: {
      streamHost: env.BUNNY_STREAM_HOST ?? '',
      tokenKey: env.BUNNY_TOKEN_KEY ?? '',
      tokenTtlSec: Number(env.BUNNY_TOKEN_TTL_SEC ?? 6 * 3600),
    },
    cms: {
      url: cmsUrl,
      token: env.CMS_TOKEN ?? '',
      cacheTtlMs: Number(env.CMS_CACHE_SEC ?? 60) * 1000,
      // Las imágenes del CMS se publican a través de esta API (/uploads), así el CMS puede quedar en la red interna.
      mediaUrl: (env.CMS_MEDIA_URL || env.PUBLIC_URL || env.RENDER_EXTERNAL_URL || cmsUrl).replace(/\/$/, ''),
    },
    webDir: env.WEB_DIR ? resolve(env.WEB_DIR) : '',
  };
}

// Acepta "host:puerto" (red interna de Render) además de una URL completa.
function normalizeUrl(url: string): string {
  if (!url) return '';
  return (url.includes('://') ? url : `http://${url}`).replace(/\/$/, '');
}

export { TEST_STREAM };
