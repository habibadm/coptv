import type { Content, EpgEntry } from '@coptv/shared';

// Catálogo de ejemplo. Se reemplaza por el CMS (Strapi o Sanity) en el siguiente paso.

const art = (seed: string) => ({
  landscape: `https://picsum.photos/seed/coptv-${seed}/1280/720`,
  poster: `https://picsum.photos/seed/coptv-${seed}/480/720`,
});

export const catalog: Content[] = [
  {
    id: 'coptv-en-vivo',
    kind: 'live',
    title: 'COPTV en vivo',
    description: 'La señal de COPTV las 24 horas.',
    artwork: art('live'),
    access: 'free',
    genres: ['En vivo'],
  },
  {
    id: 'noticiero-central',
    kind: 'series',
    title: 'Noticiero Central',
    description: 'Las noticias del día con el equipo de COPTV.',
    artwork: art('noticiero'),
    access: 'free',
    genres: ['Noticias'],
  },
  ...[1, 2, 3].map(
    (n): Content => ({
      id: `noticiero-central-e${n}`,
      kind: 'episode',
      title: `Edición ${n}`,
      description: `Edición ${n} del Noticiero Central.`,
      artwork: art(`noticiero-e${n}`),
      access: 'free',
      genres: ['Noticias'],
      seriesId: 'noticiero-central',
      season: 1,
      episode: n,
      durationSec: 1800,
    }),
  ),
  {
    id: 'deportes-semana',
    kind: 'series',
    title: 'La Semana Deportiva',
    description: 'Resúmenes, entrevistas y análisis.',
    artwork: art('deportes'),
    access: 'free',
    genres: ['Deportes'],
  },
  {
    id: 'deportes-semana-e1',
    kind: 'episode',
    title: 'Programa 1',
    description: 'Primer programa de la temporada.',
    artwork: art('deportes-e1'),
    access: 'free',
    genres: ['Deportes'],
    seriesId: 'deportes-semana',
    season: 1,
    episode: 1,
    durationSec: 3600,
  },
  {
    id: 'documental-raices',
    kind: 'movie',
    title: 'Raíces',
    description: 'Documental sobre la cultura y la historia de nuestra tierra.',
    artwork: art('raices'),
    access: 'free',
    genres: ['Documentales'],
    durationSec: 5400,
    year: 2025,
  },
  {
    id: 'especial-aniversario',
    kind: 'movie',
    title: 'Especial Aniversario',
    description: 'Lo mejor de la historia de COPTV.',
    artwork: art('aniversario'),
    access: 'free',
    genres: ['Especiales'],
    durationSec: 4200,
    year: 2026,
  },
];

export const homeLayout = [
  { id: 'destacado', title: 'Destacado', style: 'hero' as const, ids: ['coptv-en-vivo', 'documental-raices'] },
  { id: 'en-vivo', title: 'En vivo', style: 'live' as const, ids: ['coptv-en-vivo'] },
  { id: 'programas', title: 'Programas', style: 'poster' as const, ids: ['noticiero-central', 'deportes-semana'] },
  {
    id: 'recientes',
    title: 'Agregados recientemente',
    style: 'landscape' as const,
    ids: ['noticiero-central-e3', 'deportes-semana-e1', 'especial-aniversario', 'documental-raices'],
  },
];

/** Guía de programación de ejemplo: bloques de una hora a partir de la hora actual. */
export function buildEpg(now = new Date()): EpgEntry[] {
  const titles = ['Noticiero Central', 'La Semana Deportiva', 'Raíces', 'Música en COPTV'];
  const start = new Date(now);
  start.setMinutes(0, 0, 0);
  return titles.map((title, i) => ({
    id: `epg-${i}`,
    channelId: 'coptv-en-vivo',
    title,
    startsAt: new Date(start.getTime() + i * 3600_000).toISOString(),
    endsAt: new Date(start.getTime() + (i + 1) * 3600_000).toISOString(),
  }));
}
