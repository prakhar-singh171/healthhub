import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { BrowserRouter } from 'react-router-dom';

import AdminContextProvider from "./context/AdminContext.jsx";
import DoctorContextProvider from "./context/DoctorContext.jsx";
import AppContextProvider from "./context/AppContext.jsx";

import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AppContextProvider>
        <AdminContextProvider>
          <DoctorContextProvider>
            <App />
          </DoctorContextProvider>
        </AdminContextProvider>
      </AppContextProvider>
    </BrowserRouter>
  </StrictMode>
);
