import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {BrowserRouter} from 'react-router-dom'
import AppContextProvider from './context/AppContext.jsx'
import Ll from './Ll.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <AppContextProvider>
    <Ll />
  </AppContextProvider>
  </BrowserRouter>,
)