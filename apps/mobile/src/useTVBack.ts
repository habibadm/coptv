import { useEffect } from 'react';
import { Platform, TVEventControl } from 'react-native';

/**
 * En Apple TV el botón Menú cierra la app salvo que se active aquí. Se activa solo en pantallas
 * internas, así en la portada el Menú sigue saliendo de la app como espera Apple.
 */
export function useTVBack() {
  useEffect(() => {
    if (!(Platform.OS === 'ios' && Platform.isTV)) return;
    TVEventControl.enableTVMenuKey();
    return () => TVEventControl.disableTVMenuKey();
  }, []);
}
