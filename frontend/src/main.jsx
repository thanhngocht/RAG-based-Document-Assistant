import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'

// custom modules
import router from './routers/routes.jsx'


import './index.css'
import SnackbarProvider from './contexts/SnackbarContext.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SnackbarProvider>
      <RouterProvider router={router} />
    </SnackbarProvider>
  </StrictMode>
);
