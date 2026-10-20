import { init } from '@noriginmedia/norigin-spatial-navigation';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles.css';

// Navegación con las flechas del control remoto.
init({ shouldFocusDOMNode: true });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
