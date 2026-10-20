import { describe, expect, it, vi } from 'vitest';
import type { Content, HomeScreen } from '@coptv/shared';
import { buildApp } from '../src/app';
import { createCmsSource, type CmsContenido } from '../src/catalog/cms';
import { loadConfig } from '../src/config';

const contenidos: CmsContenido[] = [
  {
    slug: 'raices',
    titulo: 'Raíces',
    tipo: 'movie',
    descripcion: 'Documental',
    acceso: 'free',
    generos: 'Documentales, Cultura',
    imagenHorizontal: { url: '/uploads/raices.jpg' },
    bunnyVideoId: 'vid-1',
  },
  { slug: 'noticiero', titulo: 'Noticiero', tipo: 'series', acceso: 'free', bunnyVideoId: null },
  { slug: 'noticiero-e1', titulo: 'Edición 1', tipo: 'episode', acceso: 'free', serie: { slug: 'noticiero' }, temporada: 1, episodio: 1 },
];

function fakeStrapi() {
  return vi.fn(async (url: string | URL | Request) => {
    const path = String(url);
    if (path.includes('/api/contenidos'))
      return Response.json({ data: contenidos, meta: { pagination: { page: 1, pageCount: 1 } } });
    if (path.includes('/api/portada'))
      return Response.json({
        data: { carriles: [{ titulo: 'Documentales', estilo: 'landscape', contenidos: [{ slug: 'raices' }, { slug: 'borrado' }] }] },
      });
    return new Response(null, { status: 404 });
  });
}

const options = { url: 'http://cms.local', token: 't', cacheTtlMs: 60_000, bunnyStreamHost: 'vz-test.b-cdn.net' };

describe('CMS', () => {
  it('convierte el contenido de Strapi al formato de las apps', async () => {
    const catalog = await createCmsSource({ ...options, fetch: fakeStrapi() })();
    const raices = catalog.items[0];
    expect(raices.content).toMatchObject({
      id: 'raices',
      kind: 'movie',
      genres: ['Documentales', 'Cultura'],
      artwork: { landscape: 'http://cms.local/uploads/raices.jpg' },
    });
    expect(raices.bunnyVideoId).toBe('vid-1');
    expect(catalog.items[2].content.seriesId).toBe('noticiero');
  });

  it('usa la miniatura de Bunny si no hay imagen', async () => {
    const sinImagen = { ...contenidos[0], imagenHorizontal: null };
    const fetch = vi.fn(async () => Response.json({ data: [sinImagen], meta: { pagination: { pageCount: 1 } } }));
    const catalog = await createCmsSource({ ...options, fetch })();
    expect(catalog.items[0].content.artwork.landscape).toBe('https://vz-test.b-cdn.net/vid-1/thumbnail.jpg');
  });

  it('guarda el catálogo en memoria', async () => {
    const fetch = fakeStrapi();
    const source = createCmsSource({ ...options, fetch });
    await source();
    await source();
    expect(fetch).toHaveBeenCalledTimes(2); // contenidos + portada, una sola vez
  });

  it('arma la portada y omite contenido que ya no existe', async () => {
    const app = buildApp(loadConfig({}), createCmsSource({ ...options, fetch: fakeStrapi() }));
    const home = (await app.inject('/v1/home')).json<HomeScreen>();
    expect(home.rails).toHaveLength(1);
    expect(home.rails[0].items.map((c: Content) => c.id)).toEqual(['raices']);
  });

  it('no expone datos internos al cliente', async () => {
    const app = buildApp(loadConfig({}), createCmsSource({ ...options, fetch: fakeStrapi() }));
    const content = (await app.inject('/v1/content/raices')).json();
    expect(content).not.toHaveProperty('bunnyVideoId');
  });
});
