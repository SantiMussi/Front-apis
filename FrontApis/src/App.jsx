import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from "./components/Navbar";
import ProductDetail from "./views/ProductDetail";
import CartView from "./views/CartView";
import CheckoutView from './views/CheckoutView/CheckoutView';
import Indumentaria from "./views/Indumentaria"
import "./styles.css";
import MainPage from './views/MainPage';
import VirtualFitter from './components/OutfitBuilder/VirtualFitter'
import LoginPage from './views/LoginPage'
import RegisterPage from './views/RegisterPage'
import RequireRole from './components/RequireRole';
import SellerView from './views/SellerView';
import THEGODPAGE from './views/THEGODPAGE';
import Footer from "./components/Footer/Footer"
import UserOrdersPage from "./views/Order/UserOrdersPage"
import NotFoundView from './views/NotFoundView';

import Terms from "./components/Footer/Terms.jsx";
import Privacy from "./components/Footer/Privacy.jsx";
function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<MainPage />} />

        {/* Rutas protegidas para USER */}
        <Route
          path="/orders"
          element={
            <RequireRole roles={['USER']}>
              <UserOrdersPage />
            </RequireRole>
          }
        />
        <Route
          path="/cart"
          element={
            <RequireRole roles={['USER']}>
              <CartView />
            </RequireRole>
          }
        />
        <Route
          path="/checkout"
          element={
            <RequireRole roles={['USER']}>
              <CheckoutView />
            </RequireRole>
          }
        />
        <Route path="/indumentaria" element={<Indumentaria />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/virtual-fitter" element={<VirtualFitter />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/terminos" element={<Terms />} />
        <Route path="/privacidad" element={<Privacy/>} />

        {/*Ruta solo para admins */}
        <Route
          path="/admin/*"
          element={
            <RequireRole roles={['ADMIN']}>
              <THEGODPAGE />
            </RequireRole>
          }
        />

        <Route
          path="/seller/*"
          element={
            <RequireRole roles={['SELLER']}>
              <SellerView />
            </RequireRole>
          } />

          <Route path="*" element={<NotFoundView />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;