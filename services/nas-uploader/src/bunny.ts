import { createReadStream } from 'node:fs';
import { Readable } from 'node:stream';
import type { Config } from './config.ts';

/** Crea el video en la librería de Bunny Stream y sube el archivo. Devuelve el GUID. */
export async function uploadToBunny(
  config: Config['bunny'],
  file: { absolutePath: string; size: number },
  title: string,
  doFetch: typeof fetch = fetch,
): Promise<string> {
  const base = `${config.apiUrl}/library/${config.libraryId}/videos`;
  const headers = { AccessKey: config.apiKey, accept: 'application/json' };

  const created = await doFetch(base, {
    method: 'POST',
    headers: { ...headers, 'content-type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  if (!created.ok) throw new Error(`Bunny no creó el video (${created.status}): ${await created.text()}`);
  const { guid } = (await created.json()) as { guid: string };

  // El archivo se envía en streaming: no se carga entero en memoria aunque pese decenas de GB.
  const uploaded = await doFetch(`${base}/${guid}`, {
    method: 'PUT',
    headers: { ...headers, 'content-type': 'application/octet-stream', 'content-length': String(file.size) },
    body: Readable.toWeb(createReadStream(file.absolutePath)) as ReadableStream,
    duplex: 'half',
  } as RequestInit);
  if (!uploaded.ok) throw new Error(`Bunny rechazó la subida de ${guid} (${uploaded.status}): ${await uploaded.text()}`);
  return guid;
}
