import request from 'supertest'
import { app } from '../server.js'

describe('Journey Plans API', () => {
  let planId
  let visitId1
  let visitId2

  test('POST /api/journey-plans — creates a plan', async () => {
    const res = await request(app)
      .post('/api/journey-plans')
      .send({ rep_id: 'rep-42', date: '2024-07-01', territory: 'Midlands' })

    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({
      rep_id: 'rep-42',
      date: '2024-07-01',
      territory: 'Midlands',
      status: 'draft',
      visits: [],
    })
    expect(typeof res.body.id).toBe('number')
    planId = res.body.id
  })

  test('POST /api/journey-plans — 400 when rep_id missing', async () => {
    const res = await request(app)
      .post('/api/journey-plans')
      .send({ date: '2024-07-01' })
    expect(res.status).toBe(400)
  })

  test('POST /api/journey-plans/:id/visits — adds first store', async () => {
    const res = await request(app)
      .post(`/api/journey-plans/${planId}/visits`)
      .send({ store_id: 4, sequence_order: 1 })

    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({ store_id: 4, sequence_order: 1, status: 'planned' })
    expect(res.body.store).toMatchObject({ id: 4, name: 'Metro Express' })
    visitId1 = res.body.id
  })

  test('POST /api/journey-plans/:id/visits — adds second store (auto sequence)', async () => {
    const res = await request(app)
      .post(`/api/journey-plans/${planId}/visits`)
      .send({ store_id: 12 })

    expect(res.status).toBe(201)
    expect(res.body.sequence_order).toBe(2)
    visitId2 = res.body.id
  })

  test('POST /api/journey-plans/:id/visits — 404 for unknown store', async () => {
    const res = await request(app)
      .post(`/api/journey-plans/${planId}/visits`)
      .send({ store_id: 999 })
    expect(res.status).toBe(404)
  })

  test('GET /api/journey-plans/:id — returns plan with visits and store details in sequence order', async () => {
    const res = await request(app).get(`/api/journey-plans/${planId}`)

    expect(res.status).toBe(200)
    expect(res.body.id).toBe(planId)
    expect(res.body.visits).toHaveLength(2)
    expect(res.body.visits[0].sequence_order).toBeLessThan(res.body.visits[1].sequence_order)
    expect(res.body.visits[0].store).toHaveProperty('name')
  })

  test('PUT /api/journey-plans/:id/visits/:visitId — reorders a visit', async () => {
    const res = await request(app)
      .put(`/api/journey-plans/${planId}/visits/${visitId2}`)
      .send({ sequence_order: 0 })

    expect(res.status).toBe(200)
    expect(res.body.sequence_order).toBe(0)
  })

  test('GET /api/journey-plans/:id — visits returned in updated sequence order', async () => {
    const res = await request(app).get(`/api/journey-plans/${planId}`)
    expect(res.status).toBe(200)
    // visitId2 was moved to sequence_order 0, should now be first
    expect(res.body.visits[0].id).toBe(visitId2)
  })

  test('PUT /api/journey-plans/:id/visits/:visitId — updates visit status', async () => {
    const res = await request(app)
      .put(`/api/journey-plans/${planId}/visits/${visitId1}`)
      .send({ status: 'visited' })

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('visited')
  })

  test('PUT /api/journey-plans/:id/visits/:visitId — 400 for invalid status', async () => {
    const res = await request(app)
      .put(`/api/journey-plans/${planId}/visits/${visitId1}`)
      .send({ status: 'bogus' })
    expect(res.status).toBe(400)
  })

  test('PUT /api/journey-plans/:id — updates plan status', async () => {
    const res = await request(app)
      .put(`/api/journey-plans/${planId}`)
      .send({ status: 'active' })

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('active')
  })

  test('PUT /api/journey-plans/:id — 400 for invalid status', async () => {
    const res = await request(app)
      .put(`/api/journey-plans/${planId}`)
      .send({ status: 'nonexistent' })
    expect(res.status).toBe(400)
  })

  test('GET /api/journey-plans — lists all plans', async () => {
    const res = await request(app).get('/api/journey-plans')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThanOrEqual(1)
  })

  test('GET /api/journey-plans?rep_id=rep-42 — filters by rep', async () => {
    const res = await request(app).get('/api/journey-plans?rep_id=rep-42')
    expect(res.status).toBe(200)
    expect(res.body.every((p) => p.rep_id === 'rep-42')).toBe(true)
  })

  test('GET /api/journey-plans?territory=Midlands — filters by territory', async () => {
    const res = await request(app).get('/api/journey-plans?territory=Midlands')
    expect(res.status).toBe(200)
    expect(res.body.every((p) => p.territory === 'Midlands')).toBe(true)
  })

  test('DELETE /api/journey-plans/:id/visits/:visitId — removes a visit', async () => {
    const res = await request(app)
      .delete(`/api/journey-plans/${planId}/visits/${visitId1}`)
    expect(res.status).toBe(204)

    const plan = await request(app).get(`/api/journey-plans/${planId}`)
    expect(plan.body.visits).toHaveLength(1)
    expect(plan.body.visits.find((v) => v.id === visitId1)).toBeUndefined()
  })

  test('GET /api/journey-plans/:id — 404 for unknown plan', async () => {
    const res = await request(app).get('/api/journey-plans/99999')
    expect(res.status).toBe(404)
  })

  test('DELETE /api/journey-plans/:id/visits/:visitId — 404 for unknown visit', async () => {
    const res = await request(app)
      .delete(`/api/journey-plans/${planId}/visits/99999`)
    expect(res.status).toBe(404)
  })
})
