import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

// In-memory cart store
const cart = {
  items: [],
}

// Sample products
const products = [
  { id: 1, name: 'Wireless Headphones', price: 79.99 },
  { id: 2, name: 'Mechanical Keyboard', price: 129.99 },
  { id: 3, name: 'USB-C Hub', price: 49.99 },
]

app.get('/products', (req, res) => {
  res.json(products)
})

// GET /cart — returns current cart contents with line totals and grand total
app.get('/cart', (req, res) => {
  const items = cart.items.map((item) => {
    const product = products.find((p) => p.id === item.productId)
    return {
      productId: item.productId,
      name: product ? product.name : 'Unknown',
      unitPrice: product ? product.price : 0,
      quantity: item.quantity,
      lineTotal: product ? +(product.price * item.quantity).toFixed(2) : 0,
    }
  })
  const grandTotal = +items.reduce((sum, i) => sum + i.lineTotal, 0).toFixed(2)
  res.json({ items, grandTotal })
})

// POST /cart — add or update an item in the cart
app.post('/cart', (req, res) => {
  const { productId, quantity } = req.body
  if (!productId || quantity == null) {
    return res.status(400).json({ error: 'productId and quantity are required' })
  }
  const existing = cart.items.find((i) => i.productId === productId)
  if (existing) {
    existing.quantity += quantity
  } else {
    cart.items.push({ productId, quantity })
  }
  res.status(201).json({ message: 'Cart updated' })
})

// DELETE /cart/:productId — remove an item from the cart
app.delete('/cart/:productId', (req, res) => {
  const id = parseInt(req.params.productId, 10)
  cart.items = cart.items.filter((i) => i.productId !== id)
  res.json({ message: 'Item removed' })
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`)
})
