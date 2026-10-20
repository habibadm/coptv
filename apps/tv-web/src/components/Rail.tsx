import { FocusContext, useFocusable } from '@noriginmedia/norigin-spatial-navigation';
import type { Content, Rail as RailData } from '@coptv/shared';
import { Focusable } from './Focusable';

interface Props {
  rail: RailData;
  onSelect: (item: Content) => void;
  onFocusItem?: (item: Content) => void;
}

export function Rail({ rail, onSelect, onFocusItem }: Props) {
  const { ref, focusKey } = useFocusable({ saveLastFocusedChild: true });
  return (
    <FocusContext.Provider value={focusKey}>
      <section className="rail" ref={ref}>
        <h2>{rail.title}</h2>
        <div className={`rail-items rail-${rail.style}`}>
          {rail.items.map((item) => (
            <Focusable key={item.id} className="card" onEnter={() => onSelect(item)} onFocus={() => onFocusItem?.(item)}>
              <img
                src={rail.style === 'poster' ? (item.artwork.poster ?? item.artwork.landscape) : item.artwork.landscape}
                alt=""
              />
              {rail.style === 'live' && <span className="badge-live">EN VIVO</span>}
              <span className="card-title">{item.title}</span>
            </Focusable>
          ))}
        </div>
      </section>
    </FocusContext.Provider>
  );
}
