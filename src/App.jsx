import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProductList from './components/ProductList'
import CartDrawer from './components/CartDrawer'
import StoreList from './components/StoreList'
import StoreDetail from './components/StoreDetail'

export default function App() {
  const [cartOpen, setCartOpen] = useState(false)
  const [cartVersion, setCartVersion] = useState(0)

  function refreshCart() {
    setCartVersion((v) => v + 1)
  }

  return (
    <BrowserRouter>
      <Navbar onCartClick={() => setCartOpen(true)} />
      <Routes>
        <Route
          path="/"
          element={
            <main style={{ padding: '2rem', maxWidth: 960, margin: '0 auto' }}>
              <h1 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Products</h1>
              <ProductList onItemAdded={refreshCart} />
            </main>
          }
        />
        <Route path="/stores" element={<StoreList />} />
        <Route path="/stores/:id" element={<StoreDetail />} />
      </Routes>
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cartVersion={cartVersion}
      />
    </BrowserRouter>
  )
}
