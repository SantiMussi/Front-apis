import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Products from "./components/Products"
import Cart from "./views/Cart";
import Indumentaria from "./views/Indumentaria"
import "./styles.css";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={
            <>
              <Hero />
              <About />
                <h2 className="productos-neon">
                <span>NUESTROS PRODUCTOS</span>
                </h2>
              <Products />
            </>
          }
        />
        <Route path="/cart" element={<Cart />} />
        <Route path="/indumentaria" element={<Indumentaria />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;