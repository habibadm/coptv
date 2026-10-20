import type { Content, EpgEntry, HomeScreen, Playback } from './types';

export class ApiError extends Error {
  constructor(public status: number, public code: string) {
    super(`${status} ${code}`);
  }
}

/** Cliente de la API de COPTV, igual para móvil, TV y web. */
export function createApiClient(baseUrl: string, getToken?: () => string | null) {
  async function get<T>(path: string): Promise<T> {
    const token = getToken?.();
    const res = await fetch(`${baseUrl}${path}`, {
      headers: token ? { authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      throw new ApiError(res.status, body.error ?? 'unknown');
    }
    return (await res.json()) as T;
  }

  return {
    home: () => get<HomeScreen>('/v1/home'),
    content: (id: string) => get<Content>(`/v1/content/${encodeURIComponent(id)}`),
    episodes: (seriesId: string) => get<Content[]>(`/v1/content/${encodeURIComponent(seriesId)}/episodes`),
    epg: () => get<EpgEntry[]>('/v1/epg'),
    search: (q: string) => get<Content[]>(`/v1/search?q=${encodeURIComponent(q)}`),
    playback: (id: string) => get<Playback>(`/v1/playback/${encodeURIComponent(id)}`),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
