import type { Playback } from '@coptv/shared';
import Hls from 'hls.js';
import { useEffect, useRef, useState } from 'react';
import { api } from '../api';

const MESSAGES: Record<string, string> = {
  login_required: 'Inicia sesión para ver este contenido.',
  subscription_required: 'Este contenido es para suscriptores.',
};

export function Player({ id, onExit }: { id: string; onExit: () => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const [playback, setPlayback] = useState<Playback>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    api.playback(id).then(setPlayback, (e: { code?: string }) => setError(MESSAGES[e.code ?? ''] ?? 'No se pudo reproducir.'));
  }, [id]);

  useEffect(() => {
    const el = video.current;
    if (!el || !playback) return;
    // Los anuncios (playback.adBreaks) se reproducirán con Google IMA cuando se activen.
    if (Hls.isSupported()) {
      const hls = new Hls({ lowLatencyMode: playback.isLive });
      hls.loadSource(playback.url);
      hls.attachMedia(el);
      return () => hls.destroy();
    }
    // Safari y algunos televisores reproducen HLS de forma nativa.
    el.src = playback.url;
  }, [playback]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = video.current;
      if (!el) return;
      if (e.key === 'Enter' || e.key === 'MediaPlayPause' || e.keyCode === 10252) el.paused ? el.play() : el.pause();
      if (!playback?.isLive && (e.key === 'ArrowRight' || e.key === 'MediaFastForward')) el.currentTime += 10;
      if (!playback?.isLive && (e.key === 'ArrowLeft' || e.key === 'MediaRewind')) el.currentTime -= 10;
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [playback]);

  if (error)
    return (
      <div className="message" onClick={onExit}>
        {error}
      </div>
    );

  return (
    <div className="player">
      <video ref={video} autoPlay playsInline controls={false} />
      {playback?.isLive && <span className="badge-live player-badge">EN VIVO</span>}
    </div>
  );
}
