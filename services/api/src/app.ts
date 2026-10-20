import cors from '@fastify/cors';
import Fastify from 'fastify';
import { checkAccess, type Content, type HomeScreen, type Playback, type User } from '@coptv/shared';
import { deliver, streamUrl } from './bunny';
import { createCmsSource } from './catalog/cms';
import { buildEpg, exampleSource } from './catalog/example-data';
import type { CatalogItem, CatalogSource } from './catalog/types';
import { TEST_STREAM, type Config } from './config';

// Sin cuentas todavía: todo visitante es anónimo. Aquí se validará el token de Auth0/Firebase.
function resolveUser(): User | null {
  return null;
}

function defaultSource(config: Config): CatalogSource {
  if (!config.cms.url) return exampleSource;
  return createCmsSource({ ...config.cms, bunnyStreamHost: config.bunny.streamHost });
}

export function buildApp(config: Config, source: CatalogSource = defaultSource(config)) {
  const app = Fastify({ logger: false });
  app.register(cors, { origin: true });

  async function find(id: string): Promise<CatalogItem | undefined> {
    return (await source()).items.find((i) => i.content.id === id);
  }

  app.get('/health', async () => ({ ok: true }));

  app.get('/v1/home', async (): Promise<HomeScreen> => {
    const { items, home } = await source();
    const byId = new Map(items.map((i) => [i.content.id, i.content]));
    return {
      rails: home
        .map(({ ids, ...rail }) => ({
          ...rail,
          items: ids.map((id) => byId.get(id)).filter((c): c is Content => !!c),
        }))
        .filter((rail) => rail.items.length > 0),
    };
  });

  app.get<{ Params: { id: string } }>('/v1/content/:id', async (req, reply) => {
    const item = await find(req.params.id);
    if (!item) return reply.code(404).send({ error: 'not_found' });
    return item.content;
  });

  app.get<{ Params: { id: string } }>('/v1/content/:id/episodes', async (req) =>
    (await source()).items
      .map((i) => i.content)
      .filter((c) => c.seriesId === req.params.id)
      .sort((a, b) => (a.season ?? 0) - (b.season ?? 0) || (a.episode ?? 0) - (b.episode ?? 0)),
  );

  app.get('/v1/epg', async () => buildEpg());

  app.get<{ Querystring: { q?: string } }>('/v1/search', async (req) => {
    const q = (req.query.q ?? '').trim().toLowerCase();
    if (!q) return [];
    return (await source()).items
      .map((i) => i.content)
      .filter((c) => c.kind !== 'episode' && c.title.toLowerCase().includes(q));
  });

  app.get<{ Params: { id: string } }>('/v1/playback/:id', async (req, reply) => {
    const item = await find(req.params.id);
    if (!item || item.content.kind === 'series') return reply.code(404).send({ error: 'not_found' });
    const { content, bunnyVideoId, liveUrl } = item;

    const denied = checkAccess(content, resolveUser());
    if (denied) return reply.code(403).send({ error: denied.reason });

    const isLive = content.kind === 'live';
    const streamSource = isLive
      ? liveUrl || config.liveStreamUrl
      : bunnyVideoId && config.bunny.streamHost
        ? streamUrl(config.bunny, bunnyVideoId, 'playlist.m3u8')
        : TEST_STREAM;
    const playback: Playback = {
      contentId: content.id,
      url: deliver(config.bunny, streamSource),
      isLive,
      adBreaks: config.adsEnabled && config.adTagUrl && !isLive ? [{ offsetSec: 0, vastUrl: config.adTagUrl }] : [],
    };
    return playback;
  });

  return app;
}
