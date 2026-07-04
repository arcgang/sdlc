import styles from './Navbar.module.css'

export default function Navbar({ onCartClick }) {
  return (
    <header className={styles.navbar} role="banner">
      <span className={styles.brand}>SDLC Shop</span>
      <button
        className={styles.cartBtn}
        onClick={onCartClick}
        aria-label="Open cart"
      >
        <CartIcon />
        <span>Cart</span>
      </button>
    </header>
  )
}

function CartIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  )
}
