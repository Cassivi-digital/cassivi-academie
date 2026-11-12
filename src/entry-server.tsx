import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';

/** Rendu statique de la page, appelé au build par `scripts/prerender.mjs`. */
export function render(): string {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
