import { NavBar } from "./components/NavBar";
import { Routes, Route } from "react-router-dom";
import { Product } from "./components/Product";
import { AddProduct } from "./components/AddItem";

function App() {
  return (
    <div className='App'>
      <NavBar />
      <Routes>
        <Route path='product' element={<Product />} />
        <Route path='Additem' element={<AddProduct />} />
      </Routes>
    </div>
  );
}

export default App;
