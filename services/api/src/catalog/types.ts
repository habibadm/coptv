import type { Content, Rail } from '@coptv/shared';

/** Contenido con los datos internos que no se envían a las apps. */
export interface CatalogItem {
  content: Content;
  /** GUID del video en Bunny Stream. */
  bunnyVideoId?: string;
  /** URL HLS propia de una señal en vivo; si falta se usa LIVE_STREAM_URL. */
  liveUrl?: string;
}

export interface CatalogRail extends Omit<Rail, 'items'> {
  ids: string[];
}

export interface Catalog {
  items: CatalogItem[];
  home: CatalogRail[];
}

/** De dónde sale el catálogo: el CMS o los datos de ejemplo. */
export type CatalogSource = () => Promise<Catalog>;
