import { useEffect, useRef, useState, useCallback } from 'react'
import styles from './CartDrawer.module.css'

const FOCUSABLE = 'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])'

export default function CartDrawer({ open, onClose, cartVersion }) {
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const closeBtnRef = useRef(null)
  const drawerRef = useRef(null)

  const fetchCart = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/cart')
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      const data = await res.json()
      setCart(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch cart whenever the drawer opens or the cart is mutated elsewhere
  useEffect(() => {
    if (open) fetchCart()
  }, [open, cartVersion, fetchCart])

  // Move focus into the drawer when it opens (WCAG 2.4.3)
  useEffect(() => {
    if (open && closeBtnRef.current) {
      closeBtnRef.current.focus()
    }
  }, [open])

  // Close on Escape key + trap focus inside the drawer
  useEffect(() => {
    if (!open) return

    function handleKey(e) {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return

      const drawer = drawerRef.current
      if (!drawer) return
      const focusable = Array.from(drawer.querySelectorAll(FOCUSABLE))
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  return (
    <>
      {/* Backdrop */}
      <div
        className={`${styles.backdrop} ${open ? styles.backdropVisible : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside
        ref={drawerRef}
        className={`${styles.drawer} ${open ? styles.drawerOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        <div className={styles.header}>
          <h2 className={styles.title}>Your Cart</h2>
          <button ref={closeBtnRef} className={styles.closeBtn} onClick={onClose} aria-label="Close cart">
            ✕
          </button>
        </div>

        <div className={styles.body}>
          {loading && <p className={styles.message}>Loading…</p>}
          {error && <p className={styles.message} role="alert">Error: {error}</p>}
          {!loading && !error && cart && (
            cart.items.length === 0
              ? <EmptyState />
              : <CartContents cart={cart} />
          )}
        </div>

        <div className={styles.footer}>
          <button
            className={styles.checkoutBtn}
            disabled={!cart || cart.items.length === 0}
            onClick={() => alert('Proceeding to checkout… (stub)')}
          >
            Proceed to Checkout
          </button>
        </div>
      </aside>
    </>
  )
}

function EmptyState() {
  return (
    <div className={styles.emptyState}>
      <svg
        aria-hidden="true"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#aaa"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      <p>Your cart is empty.</p>
    </div>
  )
}

function CartContents({ cart }) {
  return (
    <div className={styles.contents}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Product</th>
            <th scope="col" className={styles.numCol}>Qty</th>
            <th scope="col" className={styles.numCol}>Unit Price</th>
            <th scope="col" className={styles.numCol}>Line Total</th>
          </tr>
        </thead>
        <tbody>
          {cart.items.map((item) => (
            <tr key={item.productId}>
              <td>{item.name}</td>
              <td className={styles.numCol}>{item.quantity}</td>
              <td className={styles.numCol}>{fmt(item.unitPrice)}</td>
              <td className={styles.numCol}>{fmt(item.lineTotal)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className={styles.totalRow}>
            <th scope="row" colSpan={3}>Grand Total</th>
            <td className={styles.numCol}>{fmt(cart.grandTotal)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

function fmt(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}
