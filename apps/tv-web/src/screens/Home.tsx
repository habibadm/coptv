import { FocusContext, useFocusable } from '@noriginmedia/norigin-spatial-navigation';
import type { Content } from '@coptv/shared';
import { useEffect, useState } from 'react';
import type { Navigate } from '../App';
import { api } from '../api';
import { Rail } from '../components/Rail';
import { useAsync } from '../useAsync';

export function Home({ navigate }: { navigate: Navigate }) {
  const { data, error } = useAsync(() => api.home(), []);
  const { ref, focusKey, focusSelf } = useFocusable();
  const [featured, setFeatured] = useState<Content>();

  useEffect(() => {
    if (data) focusSelf();
  }, [data, focusSelf]);

  if (error) return <div className="message">No se pudo cargar la portada.</div>;
  if (!data) return <div className="message">Cargando…</div>;

  const hero = featured ?? data.rails[0]?.items[0];
  const open = (item: Content) => navigate(item.kind === 'live' ? { name: 'player', id: item.id } : { name: 'detail', id: item.id });

  return (
    <FocusContext.Provider value={focusKey}>
      <main className="home" ref={ref}>
        {hero && (
          <header className="hero" style={{ backgroundImage: `url(${hero.artwork.landscape})` }}>
            <div className="hero-text">
              <img className="brand" src="./logo.svg" alt="COPTV" />
              <h1>{hero.title}</h1>
              <p>{hero.description}</p>
            </div>
          </header>
        )}
        {data.rails.map((rail) => (
          <Rail key={rail.id} rail={rail} onSelect={open} onFocusItem={setFeatured} />
        ))}
      </main>
    </FocusContext.Provider>
  );
}
