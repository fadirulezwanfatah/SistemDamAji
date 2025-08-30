
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initializeSecurity } from './utils/security';
import { initializeAccessibility } from './utils/accessibility';
import { i18n } from './utils/i18n';

// Initialize security measures
initializeSecurity();

// Initialize accessibility features
initializeAccessibility();

// Initialize internationalization
i18n.initialize();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
