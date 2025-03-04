import React from 'react';
import { createRoot } from 'react-dom/client'; // Updated import
import App from './App';

const container = document.getElementById('root');
const root = createRoot(container!); // Create a root

root.render( // Use root.render instead of ReactDOM.render
  <React.StrictMode>
    <App />
  </React.StrictMode>
);