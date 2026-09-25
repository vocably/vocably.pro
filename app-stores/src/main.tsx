import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/merriweather/700.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/700.css';
import { App } from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
