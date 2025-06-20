// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import ReactDOM from 'react-dom';
import './index.css';
import App from './App.jsx';
import Goods from './components/Goods.jsx';
import Cart from './components/Cart';
// import { TelegramWebAppProvider } from './context/TelegramContext';


createRoot(document.getElementById('root')).render(
  // <TelegramWebAppProvider>
    <BrowserRouter basename='/fastfront'>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/catalog/:categoryId/:selectedCity?" element={<Goods />} />
      <Route path="/cart" element={<Cart />} />
    </Routes>
  </BrowserRouter>
  // </TelegramWebAppProvider>
)

// ReactDOM.render(
//   <TelegramWebAppProvider>
//     <Goods />
//   </TelegramWebAppProvider>,
//   document.getElementById('root')
// );
