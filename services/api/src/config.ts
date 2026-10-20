import type { BunnyConfig } from './bunny';

// Señal de prueba pública de Mux hasta tener la de COPTV.
const TEST_STREAM = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';

export interface Config {
  port: number;
  liveStreamUrl: string;
  adsEnabled: boolean;
  adTagUrl: string;
  bunny: BunnyConfig;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
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
  };
}

export { TEST_STREAM };
