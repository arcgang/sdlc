import { useState } from 'react'
import Navbar from './components/Navbar'
import ProductList from './components/ProductList'
import CartDrawer from './components/CartDrawer'

export default function App() {
  const [cartOpen, setCartOpen] = useState(false)
  const [cartVersion, setCartVersion] = useState(0)

  function refreshCart() {
    setCartVersion((v) => v + 1)
  }

  return (
    <>
      <Navbar onCartClick={() => setCartOpen(true)} />
      <main style={{ padding: '2rem', maxWidth: 960, margin: '0 auto' }}>
        <h1 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Products</h1>
        <ProductList onItemAdded={refreshCart} />
      </main>
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cartVersion={cartVersion}
      />
    </>
  )
}
