import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import './index.css';
import './design/fonts'; // Load web fonts
import App from './App.tsx';
import { ThemeProvider, DevThemePanel } from './design';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
      <DevThemePanel />
      <Analytics />
    </ThemeProvider>
  </StrictMode>
);
