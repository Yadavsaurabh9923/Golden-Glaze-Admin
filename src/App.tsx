// App.tsx
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { StyledEngineProvider } from '@mui/material/styles';
import Dashboard from './Dashboard';
import { BrowserRouter } from 'react-router-dom'; // Add this

ReactDOM.createRoot(document.querySelector("#root")!).render(
  <React.StrictMode>
    <StyledEngineProvider injectFirst>
      {/* Wrap Dashboard with BrowserRouter */}
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    </StyledEngineProvider>
  </React.StrictMode>
);