import type { Config } from './config.ts';

/** Crea un borrador en el CMS para que el equipo complete título, imágenes y lo publique. */
export async function createDraft(
  config: Config['cms'],
  data: { titulo: string; bunnyVideoId: string },
  doFetch: typeof fetch = fetch,
): Promise<void> {
  const slug = `${slugify(data.titulo)}-${data.bunnyVideoId.slice(0, 8)}`;
  const res = await doFetch(`${config.url}/api/contenidos`, {
    method: 'POST',
    headers: { authorization: `Bearer ${config.token}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      data: { titulo: data.titulo, slug, tipo: 'movie', acceso: 'free', bunnyVideoId: data.bunnyVideoId },
    }),
  });
  if (!res.ok) throw new Error(`El CMS no creó el borrador (${res.status}): ${await res.text()}`);
}

export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
