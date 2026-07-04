import { useEffect, useState } from 'react'
import styles from './ProductList.module.css'

export default function ProductList({ onItemAdded }) {
  const [products, setProducts] = useState([])
  const [adding, setAdding] = useState(null)

  useEffect(() => {
    fetch('/products')
      .then((r) => r.json())
      .then(setProducts)
      .catch(console.error)
  }, [])

  async function addToCart(productId) {
    setAdding(productId)
    try {
      await fetch('/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 }),
      })
      onItemAdded()
    } catch (err) {
      console.error(err)
    } finally {
      setAdding(null)
    }
  }

  return (
    <ul className={styles.grid} role="list">
      {products.map((p) => (
        <li key={p.id} className={styles.card}>
          <span className={styles.name}>{p.name}</span>
          <span className={styles.price}>
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(p.price)}
          </span>
          <button
            className={styles.addBtn}
            onClick={() => addToCart(p.id)}
            disabled={adding === p.id}
            aria-label={`Add ${p.name} to cart`}
          >
            {adding === p.id ? 'Adding…' : 'Add to Cart'}
          </button>
        </li>
      ))}
    </ul>
  )
}
