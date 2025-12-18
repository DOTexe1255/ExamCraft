import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import MyProvide from './context/MyProvide.jsx'

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <MyProvide>
    <App />
    </MyProvide>
  // </StrictMode>,
)
