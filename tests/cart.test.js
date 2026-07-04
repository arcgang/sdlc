'use strict';

const request = require('supertest');
const app = require('../src/app');

// Helper: create an agent that persists cookies (session) across requests
function makeAgent() {
  return request.agent(app);
}

describe('GET /cart', () => {
  test('returns empty cart when no items have been added', async () => {
    const agent = makeAgent();
    const res = await agent.get('/cart');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ items: [], total: 0 });
    expect(typeof res.body.id).toBe('string');
  });

  test('reflects items added via POST /cart/items', async () => {
    const agent = makeAgent();
    await agent.post('/cart/items').send({
      product_id: 'p1',
      product_name: 'Widget',
      quantity: 2,
      unit_price: 9.99,
    });
    const res = await agent.get('/cart');
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0]).toMatchObject({
      product_id: 'p1',
      product_name: 'Widget',
      quantity: 2,
      unit_price: 9.99,
      line_total: 19.98,
    });
    expect(res.body.total).toBeCloseTo(19.98, 5);
  });

  test('line_total equals quantity * unit_price', async () => {
    const agent = makeAgent();
    await agent.post('/cart/items').send({ product_id: 'a', product_name: 'A', quantity: 3, unit_price: 5 });
    await agent.post('/cart/items').send({ product_id: 'b', product_name: 'B', quantity: 1, unit_price: 12.5 });
    const res = await agent.get('/cart');
    for (const item of res.body.items) {
      expect(item.line_total).toBeCloseTo(item.quantity * item.unit_price, 10);
    }
  });

  test('total equals sum of all line_totals', async () => {
    const agent = makeAgent();
    await agent.post('/cart/items').send({ product_id: 'x', product_name: 'X', quantity: 4, unit_price: 2.5 });
    await agent.post('/cart/items').send({ product_id: 'y', product_name: 'Y', quantity: 2, unit_price: 7 });
    const res = await agent.get('/cart');
    const expected = res.body.items.reduce((s, i) => s + i.line_total, 0);
    expect(res.body.total).toBeCloseTo(expected, 10);
  });

  test('carts are isolated per session', async () => {
    const agentA = makeAgent();
    const agentB = makeAgent();
    await agentA.post('/cart/items').send({ product_id: 'p', product_name: 'P', quantity: 1, unit_price: 1 });
    const resB = await agentB.get('/cart');
    expect(resB.body.items).toHaveLength(0);
  });
});
