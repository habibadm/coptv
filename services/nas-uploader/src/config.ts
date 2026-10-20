export interface Config {
  /** Carpeta del NAS que se vigila (dentro del contenedor). */
  watchDir: string;
  /** Archivo donde se recuerda qué ya se subió. */
  stateFile: string;
  extensions: string[];
  scanIntervalSec: number;
  /** Segundos que un archivo debe quedar sin cambiar antes de subirse (evita subir copias a medias). */
  stableSec: number;
  bunny: { libraryId: string; apiKey: string; apiUrl: string };
  /** Opcional: crea un borrador en el CMS por cada video subido. */
  cms: { url: string; token: string };
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const required = (name: string) => {
    const value = env[name];
    if (!value) throw new Error(`Falta la variable ${name}`);
    return value;
  };
  return {
    watchDir: env.WATCH_DIR ?? '/videos',
    stateFile: env.STATE_FILE ?? '/data/estado.json',
    extensions: (env.EXTENSIONS ?? 'mp4,mov,mkv,mxf,m4v,avi,ts')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
    scanIntervalSec: Number(env.SCAN_INTERVAL_SEC ?? 60),
    stableSec: Number(env.STABLE_SEC ?? 120),
    bunny: {
      libraryId: required('BUNNY_LIBRARY_ID'),
      apiKey: required('BUNNY_STREAM_API_KEY'),
      apiUrl: env.BUNNY_STREAM_API_URL ?? 'https://video.bunnycdn.com',
    },
    cms: { url: (env.CMS_URL ?? '').replace(/\/$/, ''), token: env.CMS_WRITE_TOKEN ?? '' },
  };
}
