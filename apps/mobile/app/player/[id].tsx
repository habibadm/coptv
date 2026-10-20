import type { Playback } from '@coptv/shared';
import { router, useLocalSearchParams } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { api } from '../../src/api';
import { colors } from '../../src/theme';

const MESSAGES: Record<string, string> = {
  login_required: 'Inicia sesión para ver este contenido.',
  subscription_required: 'Este contenido es para suscriptores.',
};

export default function Player() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [playback, setPlayback] = useState<Playback>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    api.playback(id).then(setPlayback, (e: { code?: string }) => setError(MESSAGES[e.code ?? ''] ?? 'No se pudo reproducir.'));
  }, [id]);

  // expo-video usa AVPlayer en iOS y Media3 en Android: HLS, AirPlay, Chromecast y DRM (FairPlay/Widevine).
  const player = useVideoPlayer(null, (p) => {
    p.staysActiveInBackground = true;
  });

  useEffect(() => {
    if (!playback) return;
    // Los anuncios (playback.adBreaks) se agregarán con Google IMA cuando se activen.
    player.replace({ uri: playback.url, contentType: 'hls' });
    player.play();
  }, [playback, player]);

  return (
    <View style={styles.screen}>
      {error ? (
        <Text style={styles.message}>{error}</Text>
      ) : (
        <VideoView player={player} style={StyleSheet.absoluteFill} nativeControls allowsPictureInPicture />
      )}
      {playback?.isLive && <Text style={styles.live}>EN VIVO</Text>}
      <Pressable style={styles.close} onPress={() => router.back()} hitSlop={16}>
        <Text style={styles.closeText}>✕</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000', justifyContent: 'center' },
  message: { color: colors.muted, textAlign: 'center', fontSize: 18 },
  live: {
    position: 'absolute',
    top: 56,
    left: 16,
    backgroundColor: colors.live,
    color: colors.text,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    overflow: 'hidden',
  },
  close: { position: 'absolute', top: 52, right: 20 },
  closeText: { color: colors.text, fontSize: 26 },
});
