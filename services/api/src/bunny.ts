import { createHash } from 'node:crypto';

// Integración con Bunny.net: Bunny Stream para el VOD y su CDN para entregar el vivo y el VOD.

export interface BunnyConfig {
  /** Hostname de la Pull Zone de la librería de Bunny Stream, p. ej. vz-abc123.b-cdn.net */
  streamHost: string;
  /** Clave de "Token Authentication" de la Pull Zone. Vacía = URLs sin firmar. */
  tokenKey: string;
  /** Vigencia de cada URL firmada, en segundos. */
  tokenTtlSec: number;
}

export function streamUrl(config: BunnyConfig, videoId: string, asset: 'playlist.m3u8' | 'thumbnail.jpg' | 'preview.webp') {
  return `https://${config.streamHost}/${videoId}/${asset}`;
}

/**
 * Firma una URL de la CDN de Bunny con un token de directorio, para que el manifiesto HLS
 * y todos sus segmentos (que viven en la misma carpeta) queden autorizados con un solo token.
 * Formato: https://host/bcdn_token=TOKEN&expires=EXP&token_path=DIR/ruta/al/archivo
 */
export function signUrl(url: string, tokenKey: string, expiresAt: number): string {
  const { protocol, host, pathname } = new URL(url);
  const tokenPath = pathname.slice(0, pathname.lastIndexOf('/') + 1);
  const hash = createHash('sha256')
    .update(tokenKey + tokenPath + expiresAt + `token_path=${tokenPath}`)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  return `${protocol}//${host}/bcdn_token=${hash}&expires=${expiresAt}&token_path=${encodeURIComponent(tokenPath)}${pathname}`;
}

/** Solo se firman URLs servidas por Bunny; una señal de otro proveedor se entrega tal cual. */
function isBunnyUrl(config: BunnyConfig, url: string): boolean {
  const { host } = new URL(url);
  return host === config.streamHost || host.endsWith('.b-cdn.net');
}

/** Devuelve la URL firmada si hay clave configurada y es de Bunny, o tal cual si no. */
export function deliver(config: BunnyConfig, url: string, now = Date.now()): string {
  if (!config.tokenKey || !isBunnyUrl(config, url)) return url;
  return signUrl(url, config.tokenKey, Math.floor(now / 1000) + config.tokenTtlSec);
}
