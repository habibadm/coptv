import cors from '@fastify/cors';
import Fastify from 'fastify';
import { checkAccess, type Content, type HomeScreen, type Playback, type User } from '@coptv/shared';
import { deliver, streamUrl } from './bunny';
import { TEST_STREAM, type Config } from './config';
import { buildEpg, catalog, homeLayout, videoSources } from './data/catalog';

const byId = new Map(catalog.map((c) => [c.id, c]));

// Sin cuentas todavía: todo visitante es anónimo. Aquí se validará el token de Auth0/Firebase.
function resolveUser(): User | null {
  return null;
}

export function buildApp(config: Config, sources: Record<string, string> = videoSources) {
  const app = Fastify({ logger: false });
  app.register(cors, { origin: true });

  app.get('/health', async () => ({ ok: true }));

  app.get('/v1/home', async (): Promise<HomeScreen> => ({
    rails: homeLayout.map(({ ids, ...rail }) => ({
      ...rail,
      items: ids.map((id) => byId.get(id)).filter((c): c is Content => !!c),
    })),
  }));

  app.get<{ Params: { id: string } }>('/v1/content/:id', async (req, reply) => {
    const content = byId.get(req.params.id);
    if (!content) return reply.code(404).send({ error: 'not_found' });
    return content;
  });

  app.get<{ Params: { id: string } }>('/v1/content/:id/episodes', async (req) =>
    catalog
      .filter((c) => c.seriesId === req.params.id)
      .sort((a, b) => (a.season ?? 0) - (b.season ?? 0) || (a.episode ?? 0) - (b.episode ?? 0)),
  );

  app.get('/v1/epg', async () => buildEpg());

  app.get<{ Querystring: { q?: string } }>('/v1/search', async (req) => {
    const q = (req.query.q ?? '').trim().toLowerCase();
    if (!q) return [];
    return catalog.filter((c) => c.kind !== 'episode' && c.title.toLowerCase().includes(q));
  });

  app.get<{ Params: { id: string } }>('/v1/playback/:id', async (req, reply) => {
    const content = byId.get(req.params.id);
    if (!content || content.kind === 'series') return reply.code(404).send({ error: 'not_found' });

    const denied = checkAccess(content, resolveUser());
    if (denied) return reply.code(403).send({ error: denied.reason });

    const isLive = content.kind === 'live';
    const bunnyVideoId = sources[content.id];
    const source = isLive
      ? config.liveStreamUrl
      : bunnyVideoId && config.bunny.streamHost
        ? streamUrl(config.bunny, bunnyVideoId, 'playlist.m3u8')
        : TEST_STREAM;
    const playback: Playback = {
      contentId: content.id,
      url: deliver(config.bunny, source),
      isLive,
      adBreaks: config.adsEnabled && config.adTagUrl && !isLive ? [{ offsetSec: 0, vastUrl: config.adTagUrl }] : [],
    };
    return playback;
  });

  return app;
}
