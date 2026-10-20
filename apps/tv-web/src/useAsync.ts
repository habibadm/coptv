import { useEffect, useState } from 'react';

export function useAsync<T>(load: () => Promise<T>, deps: unknown[]) {
  const [state, setState] = useState<{ data?: T; error?: Error }>({});
  useEffect(() => {
    let alive = true;
    load().then(
      (data) => alive && setState({ data }),
      (error: Error) => alive && setState({ error }),
    );
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return state;
}
