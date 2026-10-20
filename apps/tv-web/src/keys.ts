// Códigos de la tecla "atrás" en cada plataforma.
const BACK_KEYS = new Set([
  8, // Backspace (navegador)
  27, // Escape (navegador)
  461, // LG webOS
  10009, // Samsung Tizen
]);

export function isBackKey(e: KeyboardEvent): boolean {
  return BACK_KEYS.has(e.keyCode) || e.key === 'GoBack' || e.key === 'BrowserBack';
}

/** En Tizen hay que pedir permiso para recibir las teclas multimedia del control. */
export function registerTvKeys() {
  const tizen = (window as unknown as { tizen?: { tvinputdevice?: { registerKeyBatch(keys: string[]): void } } }).tizen;
  tizen?.tvinputdevice?.registerKeyBatch(['MediaPlayPause', 'MediaPlay', 'MediaPause', 'MediaFastForward', 'MediaRewind']);
}

/** Cierra la app al apretar "atrás" en la pantalla de inicio. */
export function exitApp() {
  const w = window as unknown as {
    tizen?: { application?: { getCurrentApplication(): { exit(): void } } };
    webOS?: { platformBack(): void };
  };
  if (w.tizen?.application) w.tizen.application.getCurrentApplication().exit();
  else if (w.webOS) w.webOS.platformBack();
}
