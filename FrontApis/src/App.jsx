import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from "./components/Navbar";
import ProductDetail from "./views/ProductDetail";
import CartView from "./views/CartView";
import Indumentaria from "./views/Indumentaria"
import "./styles.css";
import MainPage from './views/MainPage';
import VirtualFitter from './components/OutfitBuilder/VirtualFitter'
import LoginPage from './views/LoginPage'
import RegisterPage from './views/RegisterPage'
import RequireRole from './components/RequireRole';
import SellerView from './views/SellerView';
import THEGODPAGE from './views/THEGODPAGE';


function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/cart" element={<CartView />} />
        <Route path="/indumentaria" element={<Indumentaria />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/virtual-fitter" element={<VirtualFitter />}/>
        <Route path="/login" element={<LoginPage/>}/>
        <Route path="/register" element={<RegisterPage/>}/>
        {/*Ruta solo para admins */}
        <Route 
            path="/admin/*" 
            element={
            <RequireRole roles={['ADMIN']}> 
              <THEGODPAGE/> 
            </RequireRole>
            }
          />

        <Route
          path="/seller/*"
          element={
            <RequireRole roles={['SELLER']}>
              <SellerView />
            </RequireRole>
          }/>
      </Routes>
      
    </BrowserRouter>
  );
}

export default App;