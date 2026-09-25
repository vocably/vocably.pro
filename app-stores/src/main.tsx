import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/ruda/400.css';
import '@fontsource/ruda/600.css';
import '@fontsource/ruda/700.css';
import { App } from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
