// Señal de prueba pública de Mux hasta tener la de COPTV.
const TEST_STREAM = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';

export interface Config {
  port: number;
  liveStreamUrl: string;
  adsEnabled: boolean;
  adTagUrl: string;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  return {
    port: Number(env.PORT ?? 4000),
    liveStreamUrl: env.LIVE_STREAM_URL || TEST_STREAM,
    adsEnabled: env.ADS_ENABLED === 'true',
    adTagUrl: env.AD_TAG_URL ?? '',
  };
}

export { TEST_STREAM };
