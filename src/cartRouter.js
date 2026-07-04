'use strict';

const express = require('express');
const { getCart, saveCart } = require('./store');

const router = express.Router();

function buildResponse(cart) {
  const items = cart.items.map(item => ({
    product_id: item.product_id,
    product_name: item.product_name,
    quantity: item.quantity,
    unit_price: item.unit_price,
    line_total: item.quantity * item.unit_price,
  }));
  const total = items.reduce((sum, i) => sum + i.line_total, 0);
  return { id: cart.id, items, total };
}

// GET /cart — return current cart
router.get('/', (req, res) => {
  const cart = getCart(req.session.id);
  res.json(buildResponse(cart));
});

// POST /cart/items — add item to cart (used by other tasks / tests)
router.post('/items', (req, res) => {
  const { product_id, product_name, quantity, unit_price } = req.body;
  if (!product_id || !product_name || quantity == null || unit_price == null) {
    return res.status(400).json({ error: 'product_id, product_name, quantity, and unit_price are required' });
  }
  const qty = Number(quantity);
  const price = Number(unit_price);
  if (!Number.isFinite(qty) || qty <= 0 || !Number.isFinite(price) || price < 0) {
    return res.status(400).json({ error: 'quantity must be a positive number and unit_price must be non-negative' });
  }

  const cart = getCart(req.session.id);
  const existing = cart.items.find(i => i.product_id === product_id);
  if (existing) {
    existing.quantity += qty;
  } else {
    cart.items.push({ product_id, product_name, quantity: qty, unit_price: price });
  }
  saveCart(cart);
  res.status(201).json(buildResponse(cart));
});

module.exports = router;
