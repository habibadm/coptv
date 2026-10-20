import { useFocusable } from '@noriginmedia/norigin-spatial-navigation';
import type { ReactNode } from 'react';

interface Props {
  className?: string;
  onEnter?: () => void;
  onFocus?: () => void;
  children: ReactNode;
}

/** Elemento que se puede seleccionar con el control remoto. */
export function Focusable({ className = '', onEnter, onFocus, children }: Props) {
  const { ref, focused } = useFocusable({
    onEnterPress: onEnter,
    onFocus: (layout) => {
      (layout.node as HTMLElement | undefined)?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      onFocus?.();
    },
  });
  return (
    <div ref={ref} className={`${className} ${focused ? 'focused' : ''}`} onClick={onEnter} tabIndex={-1}>
      {children}
    </div>
  );
}
