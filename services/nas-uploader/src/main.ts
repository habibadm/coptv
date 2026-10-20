import { loadConfig } from './config.ts';
import { runOnce } from './uploader.ts';

const config = loadConfig();
console.log(`Vigilando ${config.watchDir} cada ${config.scanIntervalSec} s`);

// Una pasada a la vez: si una subida grande tarda más que el intervalo, la siguiente espera.
async function loop() {
  try {
    await runOnce(config);
  } catch (err) {
    console.error('Error al revisar la carpeta:', (err as Error).message);
  }
  setTimeout(loop, config.scanIntervalSec * 1000);
}

loop();
