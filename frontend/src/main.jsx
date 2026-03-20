import React from 'react'
import ReactDOM from 'react-dom/client'
import { RecoilRoot } from 'recoil'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './styles/index.css'

window.addEventListener('error', (e) => {
  document.body.innerHTML += `<div style="background:red;color:white;padding:20px;position:fixed;top:0;left:0;z-index:9999;width:100%">${e.error?.stack || e.message}</div>`;
});
window.addEventListener('unhandledrejection', (e) => {
  document.body.innerHTML += `<div style="background:red;color:white;padding:20px;position:fixed;top:0;left:0;z-index:9999;width:100%">Promise: ${e.reason?.stack || e.reason}</div>`;
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RecoilRoot>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </RecoilRoot>
  </React.StrictMode>,
)
