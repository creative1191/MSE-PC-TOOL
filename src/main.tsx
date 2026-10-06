import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

// Guard against third-party or browser environment attempting to overwrite getter-only window.fetch
if (typeof window !== 'undefined') {
  window.addEventListener(
    'error',
    (e) => {
      if (e.message && e.message.includes('Cannot set property fetch')) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    },
    true
  );

  window.addEventListener('unhandledrejection', (e) => {
    if (e.reason && typeof e.reason.message === 'string' && e.reason.message.includes('Cannot set property fetch')) {
      e.preventDefault();
    }
  });
}

const rootElement = document.getElementById('root');

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
} else {
  console.error('[Runtime Error] Root DOM element not found');
}

