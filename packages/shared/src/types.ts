// Modelo de datos común a la API y a todas las apps.

/** Nivel de acceso de un contenido. Hoy todo es "free"; cobrar es cambiar este valor. */
export type AccessTier = 'free' | 'registered' | 'premium';

export type ContentKind = 'live' | 'movie' | 'series' | 'episode' | 'clip';

export interface Artwork {
  /** Imagen horizontal 16:9 para carriles y fondo de detalle. */
  landscape: string;
  /** Imagen vertical 2:3 para carriles tipo póster. */
  poster?: string;
  /** Logo con transparencia para el banner principal. */
  logo?: string;
}

export interface Content {
  id: string;
  kind: ContentKind;
  title: string;
  description: string;
  artwork: Artwork;
  access: AccessTier;
  genres: string[];
  durationSec?: number;
  year?: number;
  rating?: string;
  seriesId?: string;
  season?: number;
  episode?: number;
}

export type RailStyle = 'hero' | 'landscape' | 'poster' | 'live';

/** Un "carril" horizontal de la portada, al estilo Disney+. */
export interface Rail {
  id: string;
  title: string;
  style: RailStyle;
  items: Content[];
}

export interface HomeScreen {
  rails: Rail[];
}

export interface EpgEntry {
  id: string;
  channelId: string;
  title: string;
  startsAt: string;
  endsAt: string;
  contentId?: string;
}

/** Pausa publicitaria. Se ignora mientras los anuncios estén desactivados. */
export interface AdBreak {
  /** Segundos desde el inicio; 0 = pre-roll. Para el vivo lo marca SCTE-35. */
  offsetSec: number;
  /** URL VAST/VMAP del servidor de anuncios. */
  vastUrl: string;
}

export interface Playback {
  contentId: string;
  /** Manifiesto HLS. */
  url: string;
  isLive: boolean;
  /** Presente solo cuando el contenido usa DRM. */
  drm?: {
    type: 'fairplay' | 'widevine' | 'playready';
    licenseUrl: string;
    certificateUrl?: string;
  };
  adBreaks: AdBreak[];
}

export interface User {
  id: string;
  /** Derechos que tiene el usuario, p. ej. ["premium"]. */
  entitlements: AccessTier[];
}

export type PlaybackDenied = {
  reason: 'login_required' | 'subscription_required';
};
