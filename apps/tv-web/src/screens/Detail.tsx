import { FocusContext, useFocusable } from '@noriginmedia/norigin-spatial-navigation';
import { useEffect } from 'react';
import type { Navigate } from '../App';
import { api } from '../api';
import { Focusable } from '../components/Focusable';
import { useAsync } from '../useAsync';

export function Detail({ id, navigate }: { id: string; navigate: Navigate }) {
  const { data } = useAsync(async () => {
    const content = await api.content(id);
    const episodes = content.kind === 'series' ? await api.episodes(id) : [];
    return { content, episodes };
  }, [id]);
  const { ref, focusKey, focusSelf } = useFocusable();

  useEffect(() => {
    if (data) focusSelf();
  }, [data, focusSelf]);

  if (!data) return <div className="message">Cargando…</div>;
  const { content, episodes } = data;
  const playId = content.kind === 'series' ? episodes[0]?.id : content.id;

  return (
    <FocusContext.Provider value={focusKey}>
      <main className="detail" ref={ref} style={{ backgroundImage: `url(${content.artwork.landscape})` }}>
        <div className="detail-text">
          <h1>{content.title}</h1>
          <p className="meta">
            {[content.year, content.genres.join(' · '), content.durationSec && `${Math.round(content.durationSec / 60)} min`]
              .filter(Boolean)
              .join('  ·  ')}
          </p>
          <p>{content.description}</p>
          {playId && (
            <Focusable className="button" onEnter={() => navigate({ name: 'player', id: playId })}>
              ▶ Ver ahora
            </Focusable>
          )}
        </div>
        {episodes.length > 0 && (
          <section className="episodes">
            <h2>Episodios</h2>
            {episodes.map((ep) => (
              <Focusable key={ep.id} className="episode" onEnter={() => navigate({ name: 'player', id: ep.id })}>
                <img src={ep.artwork.landscape} alt="" />
                <div>
                  <strong>
                    T{ep.season} E{ep.episode} · {ep.title}
                  </strong>
                  <p>{ep.description}</p>
                </div>
              </Focusable>
            ))}
          </section>
        )}
      </main>
    </FocusContext.Provider>
  );
}
