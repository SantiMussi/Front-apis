import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Products from "./components/Products"
import Cart from "./views/Cart";
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
              <Products />
            </>
          }
        />
        <Route path="/cart" element={<Cart />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;