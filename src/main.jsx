import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { LanguageProvider } from './LanguageContext.jsx' 
import InstallGate from './InstallGate.jsx' 

ReactDOM.createRoot(document.getElementById('root')).render(
  <LanguageProvider> 
    {/*<InstallGate>*/}
      <App />
    {/*</InstallGate>*/}
  </LanguageProvider>
)