import { useCallback, useEffect, useState } from 'react';
import { exitApp, isBackKey, registerTvKeys } from './keys';
import { Detail } from './screens/Detail';
import { Home } from './screens/Home';
import { Player } from './screens/Player';

export type Route = { name: 'home' } | { name: 'detail'; id: string } | { name: 'player'; id: string };

export type Navigate = (route: Route) => void;

export function App() {
  const [stack, setStack] = useState<Route[]>([{ name: 'home' }]);
  const route = stack[stack.length - 1];

  const navigate = useCallback<Navigate>((r) => setStack((s) => [...s, r]), []);
  const back = useCallback(() => {
    setStack((s) => {
      if (s.length > 1) return s.slice(0, -1);
      exitApp();
      return s;
    });
  }, []);

  useEffect(() => {
    registerTvKeys();
    const onKey = (e: KeyboardEvent) => {
      if (isBackKey(e)) {
        e.preventDefault();
        back();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [back]);

  switch (route.name) {
    case 'home':
      return <Home navigate={navigate} />;
    case 'detail':
      return <Detail key={route.id} id={route.id} navigate={navigate} />;
    case 'player':
      return <Player key={route.id} id={route.id} onExit={back} />;
  }
}
