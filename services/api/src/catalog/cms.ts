import type { AccessTier, ContentKind, RailStyle } from '@coptv/shared';
import type { Catalog, CatalogItem, CatalogSource } from './types';

// Lee el catálogo del CMS (Strapi 5, API REST) y lo guarda en memoria unos segundos.

export interface CmsOptions {
  url: string;
  /** API token de solo lectura creado en Strapi (Configuración > API Tokens). */
  token: string;
  cacheTtlMs: number;
  /** Para armar la miniatura de Bunny cuando el contenido no tiene imagen propia. */
  bunnyStreamHost?: string;
  fetch?: typeof fetch;
}

interface CmsMedia {
  url: string;
}

export interface CmsContenido {
  slug: string;
  titulo: string;
  tipo: ContentKind;
  descripcion?: string | null;
  acceso: AccessTier;
  generos?: string | null;
  imagenHorizontal?: CmsMedia | null;
  imagenVertical?: CmsMedia | null;
  duracionSeg?: number | null;
  anio?: number | null;
  clasificacion?: string | null;
  serie?: { slug: string } | null;
  temporada?: number | null;
  episodio?: number | null;
  bunnyVideoId?: string | null;
  urlVivo?: string | null;
}

export interface CmsPortada {
  carriles: { titulo: string; estilo: RailStyle; contenidos: { slug: string }[] }[];
}

const CONTENIDOS_QUERY =
  'populate[imagenHorizontal][fields][0]=url&populate[imagenVertical][fields][0]=url' +
  '&populate[serie][fields][0]=slug&pagination[pageSize]=100';
const PORTADA_QUERY = 'populate[carriles][populate][contenidos][fields][0]=slug';

export function createCmsSource(options: CmsOptions): CatalogSource {
  const doFetch = options.fetch ?? fetch;
  let cached: { at: number; catalog: Promise<Catalog> } | undefined;

  async function get<T>(path: string): Promise<T> {
    const res = await doFetch(`${options.url}/api/${path}`, {
      headers: { authorization: `Bearer ${options.token}` },
    });
    if (!res.ok) throw new Error(`CMS ${path}: ${res.status}`);
    return (await res.json()) as T;
  }

  async function load(): Promise<Catalog> {
    const contenidos: CmsContenido[] = [];
    for (let page = 1, pageCount = 1; page <= pageCount; page++) {
      const res = await get<{ data: CmsContenido[]; meta: { pagination: { pageCount: number } } }>(
        `contenidos?${CONTENIDOS_QUERY}&pagination[page]=${page}`,
      );
      contenidos.push(...res.data);
      pageCount = res.meta.pagination.pageCount;
    }
    // La portada es opcional: sin ella la app muestra una portada vacía.
    const portada = await get<{ data: CmsPortada | null }>(`portada?${PORTADA_QUERY}`).catch(() => ({ data: null }));

    return {
      items: contenidos.map((c) => toItem(c, options)),
      home: (portada.data?.carriles ?? []).map((carril, i) => ({
        id: `carril-${i + 1}`,
        title: carril.titulo,
        style: carril.estilo,
        ids: carril.contenidos.map((c) => c.slug),
      })),
    };
  }

  return () => {
    const now = Date.now();
    if (!cached || now - cached.at > options.cacheTtlMs) {
      const catalog = load();
      cached = { at: now, catalog };
      // Si falla, no se guarda el error: el próximo pedido vuelve a intentar.
      catalog.catch(() => {
        if (cached?.catalog === catalog) cached = undefined;
      });
    }
    return cached.catalog;
  };
}

function toItem(c: CmsContenido, options: CmsOptions): CatalogItem {
  const media = (m?: CmsMedia | null) => (m ? new URL(m.url, options.url).toString() : undefined);
  const bunnyThumb =
    c.bunnyVideoId && options.bunnyStreamHost ? `https://${options.bunnyStreamHost}/${c.bunnyVideoId}/thumbnail.jpg` : undefined;

  return {
    content: {
      id: c.slug,
      kind: c.tipo,
      title: c.titulo,
      description: c.descripcion ?? '',
      artwork: {
        landscape: media(c.imagenHorizontal) ?? bunnyThumb ?? '',
        poster: media(c.imagenVertical),
      },
      access: c.acceso,
      genres: (c.generos ?? '').split(',').map((g) => g.trim()).filter(Boolean),
      durationSec: c.duracionSeg ?? undefined,
      year: c.anio ?? undefined,
      rating: c.clasificacion ?? undefined,
      seriesId: c.serie?.slug,
      season: c.temporada ?? undefined,
      episode: c.episodio ?? undefined,
    },
    bunnyVideoId: c.bunnyVideoId ?? undefined,
    liveUrl: c.urlVivo ?? undefined,
  };
}
