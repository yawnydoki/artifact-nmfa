import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { LanguageProvider } from './LanguageContext.jsx' 
import { DataProvider } from './DataContext.jsx' 
import { GatepassProvider } from './GatepassContext.jsx' 
import InstallGate from './InstallGate.jsx' 

ReactDOM.createRoot(document.getElementById('root')).render(
  <LanguageProvider> 
    <GatepassProvider> 
      <DataProvider>
        <InstallGate>
          <App />
        </InstallGate>
      </DataProvider>
    </GatepassProvider>
  </LanguageProvider>
)