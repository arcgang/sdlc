'use strict';

// In-memory store keyed by session id
const carts = new Map();

function getCart(sessionId) {
  if (!carts.has(sessionId)) {
    return { id: sessionId, items: [] };
  }
  return carts.get(sessionId);
}

function saveCart(cart) {
  carts.set(cart.id, cart);
}

module.exports = { getCart, saveCart };
