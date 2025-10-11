import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from "./components/Navbar";
import ProductDetail from "./views/ProductDetail";
import Cart from "./views/Cart";
import Indumentaria from "./views/Indumentaria"
import "./styles.css";
import MainPage from './views/MainPage';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/indumentaria" element={<Indumentaria />} />
        <Route path="/product/:id" element={<ProductDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;