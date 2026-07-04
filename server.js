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

// Sample stores
const stores = [
  {
    id: 1,
    name: 'Central Supermart',
    address: '12 High Street, London, EC1A 1BB',
    channel: 'supermarket',
    territory: 'London North',
    priority_tier: 1,
    last_visited_date: '2024-06-15',
    active: true,
  },
  {
    id: 2,
    name: 'QuickStop Convenience',
    address: '45 Oxford Road, Manchester, M1 2FE',
    channel: 'convenience',
    territory: 'Manchester',
    priority_tier: 2,
    last_visited_date: '2024-05-30',
    active: true,
  },
  {
    id: 3,
    name: 'Greenleaf Pharmacy',
    address: '8 Bridge Lane, Bristol, BS1 4RH',
    channel: 'pharmacy',
    territory: 'South West',
    priority_tier: 3,
    last_visited_date: '2024-04-20',
    active: true,
  },
  {
    id: 4,
    name: 'Metro Express',
    address: '99 King Street, Birmingham, B1 1LT',
    channel: 'convenience',
    territory: 'Midlands',
    priority_tier: 1,
    last_visited_date: '2024-06-28',
    active: true,
  },
  {
    id: 5,
    name: 'FreshMart Superstore',
    address: '3 Victoria Way, Leeds, LS1 5AA',
    channel: 'supermarket',
    territory: 'Yorkshire',
    priority_tier: 2,
    last_visited_date: '2024-06-01',
    active: true,
  },
  {
    id: 6,
    name: 'HealthPlus Pharmacy',
    address: '17 Park Road, Edinburgh, EH1 3BQ',
    channel: 'pharmacy',
    territory: 'Scotland',
    priority_tier: 1,
    last_visited_date: null,
    active: true,
  },
  {
    id: 7,
    name: 'Corner Shop Plus',
    address: '55 Castle Street, Cardiff, CF10 1BS',
    channel: 'convenience',
    territory: 'Wales',
    priority_tier: 3,
    last_visited_date: '2024-03-10',
    active: true,
  },
  {
    id: 8,
    name: 'Northgate Supermarket',
    address: '2 Market Square, Newcastle, NE1 7RU',
    channel: 'supermarket',
    territory: 'North East',
    priority_tier: 1,
    last_visited_date: '2024-06-20',
    active: true,
  },
  {
    id: 9,
    name: 'Riverside Pharmacy',
    address: '30 Waterfront, Liverpool, L1 8JQ',
    channel: 'pharmacy',
    territory: 'North West',
    priority_tier: 2,
    last_visited_date: '2024-05-12',
    active: true,
  },
  {
    id: 10,
    name: 'South End Convenience',
    address: '7 Shore Lane, Brighton, BN1 2GH',
    channel: 'convenience',
    territory: 'South East',
    priority_tier: 3,
    last_visited_date: '2024-02-28',
    active: true,
  },
  {
    id: 11,
    name: 'London South Supermart',
    address: '88 Borough High St, London, SE1 1LL',
    channel: 'supermarket',
    territory: 'London South',
    priority_tier: 2,
    last_visited_date: '2024-06-10',
    active: true,
  },
  {
    id: 12,
    name: 'Peak District Store',
    address: '1 Dale Road, Matlock, DE4 3LU',
    channel: 'convenience',
    territory: 'Midlands',
    priority_tier: 3,
    last_visited_date: null,
    active: true,
  },
]

app.get('/products', (req, res) => {
  res.json(products)
})

// GET /stores — returns all active stores, supports ?territory=&channel=&priority_tier= filters
app.get('/stores', (req, res) => {
  const { territory, channel, priority_tier } = req.query
  let result = stores.filter((s) => s.active)

  if (territory) {
    result = result.filter((s) => s.territory === territory)
  }
  if (channel) {
    result = result.filter((s) => s.channel === channel)
  }
  if (priority_tier) {
    const tiers = priority_tier.split(',').map(Number)
    result = result.filter((s) => tiers.includes(s.priority_tier))
  }

  res.json(result)
})

// GET /stores/:id — returns a single store by id
app.get('/stores/:id', (req, res) => {
  const id = parseInt(req.params.id, 10)
  const store = stores.find((s) => s.id === id)
  if (!store) {
    return res.status(404).json({ error: 'Store not found' })
  }
  res.json(store)
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
