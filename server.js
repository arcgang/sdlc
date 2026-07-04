import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

// In-memory stores (same data as existing store list)
const stores = [
  { id: 1, name: 'Central Supermart', address: '12 High Street, London, EC1A 1BB', channel: 'supermarket', territory: 'London North', priority_tier: 1, last_visited_date: '2024-06-15', active: true },
  { id: 2, name: 'QuickStop Convenience', address: '45 Oxford Road, Manchester, M1 2FE', channel: 'convenience', territory: 'Manchester', priority_tier: 2, last_visited_date: '2024-05-30', active: true },
  { id: 3, name: 'Greenleaf Pharmacy', address: '8 Bridge Lane, Bristol, BS1 4RH', channel: 'pharmacy', territory: 'South West', priority_tier: 3, last_visited_date: '2024-04-20', active: true },
  { id: 4, name: 'Metro Express', address: '99 King Street, Birmingham, B1 1LT', channel: 'convenience', territory: 'Midlands', priority_tier: 1, last_visited_date: '2024-06-28', active: true },
  { id: 5, name: 'FreshMart Superstore', address: '3 Victoria Way, Leeds, LS1 5AA', channel: 'supermarket', territory: 'Yorkshire', priority_tier: 2, last_visited_date: '2024-06-01', active: true },
  { id: 6, name: 'HealthPlus Pharmacy', address: '17 Park Road, Edinburgh, EH1 3BQ', channel: 'pharmacy', territory: 'Scotland', priority_tier: 1, last_visited_date: null, active: true },
  { id: 7, name: 'Corner Shop Plus', address: '55 Castle Street, Cardiff, CF10 1BS', channel: 'convenience', territory: 'Wales', priority_tier: 3, last_visited_date: '2024-03-10', active: true },
  { id: 8, name: 'Northgate Supermarket', address: '2 Market Square, Newcastle, NE1 7RU', channel: 'supermarket', territory: 'North East', priority_tier: 1, last_visited_date: '2024-06-20', active: true },
  { id: 9, name: 'Riverside Pharmacy', address: '30 Waterfront, Liverpool, L1 8JQ', channel: 'pharmacy', territory: 'North West', priority_tier: 2, last_visited_date: '2024-05-12', active: true },
  { id: 10, name: 'South End Convenience', address: '7 Shore Lane, Brighton, BN1 2GH', channel: 'convenience', territory: 'South East', priority_tier: 3, last_visited_date: '2024-02-28', active: true },
  { id: 11, name: 'London South Supermart', address: '88 Borough High St, London, SE1 1LL', channel: 'supermarket', territory: 'London South', priority_tier: 2, last_visited_date: '2024-06-10', active: true },
  { id: 12, name: 'Peak District Store', address: '1 Dale Road, Matlock, DE4 3LU', channel: 'convenience', territory: 'Midlands', priority_tier: 3, last_visited_date: null, active: true },
]

// In-memory journey plan store
let nextPlanId = 1
let nextVisitId = 1
const journeyPlans = []

// Valid plan statuses
const PLAN_STATUSES = ['draft', 'active', 'completed', 'cancelled']
// Valid visit statuses
const VISIT_STATUSES = ['planned', 'visited', 'skipped']

// Helper: attach store details to each visit and sort by sequence_order
function buildPlanResponse(plan) {
  const visits = plan.visits
    .map((v) => {
      const store = stores.find((s) => s.id === v.store_id)
      return { ...v, store: store || null }
    })
    .sort((a, b) => a.sequence_order - b.sequence_order)
  return { ...plan, visits }
}

// POST /api/journey-plans — create a plan
app.post('/api/journey-plans', (req, res) => {
  const { rep_id, date, territory, notes } = req.body
  if (!rep_id || !date) {
    return res.status(400).json({ error: 'rep_id and date are required' })
  }
  const plan = {
    id: nextPlanId++,
    rep_id,
    date,
    territory: territory || null,
    notes: notes || null,
    status: 'draft',
    visits: [],
  }
  journeyPlans.push(plan)
  res.status(201).json(buildPlanResponse(plan))
})

// GET /api/journey-plans — list plans, filterable by rep_id or territory
app.get('/api/journey-plans', (req, res) => {
  const { rep_id, territory } = req.query
  let result = journeyPlans

  if (rep_id) {
    result = result.filter((p) => String(p.rep_id) === String(rep_id))
  }
  if (territory) {
    result = result.filter((p) => p.territory === territory)
  }

  res.json(result.map(buildPlanResponse))
})

// GET /api/journey-plans/:id — get a single plan with nested visits and store details
app.get('/api/journey-plans/:id', (req, res) => {
  const id = parseInt(req.params.id, 10)
  const plan = journeyPlans.find((p) => p.id === id)
  if (!plan) {
    return res.status(404).json({ error: 'Journey plan not found' })
  }
  res.json(buildPlanResponse(plan))
})

// PUT /api/journey-plans/:id — update plan status, notes, or date
app.put('/api/journey-plans/:id', (req, res) => {
  const id = parseInt(req.params.id, 10)
  const plan = journeyPlans.find((p) => p.id === id)
  if (!plan) {
    return res.status(404).json({ error: 'Journey plan not found' })
  }

  const { status, notes, date, territory } = req.body

  if (status !== undefined) {
    if (!PLAN_STATUSES.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${PLAN_STATUSES.join(', ')}` })
    }
    plan.status = status
  }
  if (notes !== undefined) plan.notes = notes
  if (date !== undefined) plan.date = date
  if (territory !== undefined) plan.territory = territory

  res.json(buildPlanResponse(plan))
})

// POST /api/journey-plans/:id/visits — add a store visit to a plan
app.post('/api/journey-plans/:id/visits', (req, res) => {
  const id = parseInt(req.params.id, 10)
  const plan = journeyPlans.find((p) => p.id === id)
  if (!plan) {
    return res.status(404).json({ error: 'Journey plan not found' })
  }

  const { store_id, sequence_order, notes } = req.body
  if (!store_id) {
    return res.status(400).json({ error: 'store_id is required' })
  }

  const store = stores.find((s) => s.id === store_id && s.active)
  if (!store) {
    return res.status(404).json({ error: 'Store not found' })
  }

  // Default sequence_order to end of list
  const order = sequence_order != null
    ? sequence_order
    : (plan.visits.length > 0 ? Math.max(...plan.visits.map((v) => v.sequence_order)) + 1 : 1)

  const visit = {
    id: nextVisitId++,
    plan_id: plan.id,
    store_id,
    sequence_order: order,
    status: 'planned',
    notes: notes || null,
  }
  plan.visits.push(visit)

  res.status(201).json({ ...visit, store })
})

// PUT /api/journey-plans/:id/visits/:visitId — update sequence_order or status
app.put('/api/journey-plans/:id/visits/:visitId', (req, res) => {
  const planId = parseInt(req.params.id, 10)
  const visitId = parseInt(req.params.visitId, 10)

  const plan = journeyPlans.find((p) => p.id === planId)
  if (!plan) {
    return res.status(404).json({ error: 'Journey plan not found' })
  }

  const visit = plan.visits.find((v) => v.id === visitId)
  if (!visit) {
    return res.status(404).json({ error: 'Visit not found' })
  }

  const { sequence_order, status, notes } = req.body

  if (sequence_order !== undefined) {
    visit.sequence_order = sequence_order
  }
  if (status !== undefined) {
    if (!VISIT_STATUSES.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${VISIT_STATUSES.join(', ')}` })
    }
    visit.status = status
  }
  if (notes !== undefined) visit.notes = notes

  const store = stores.find((s) => s.id === visit.store_id)
  res.json({ ...visit, store: store || null })
})

// DELETE /api/journey-plans/:id/visits/:visitId — remove a visit from a plan
app.delete('/api/journey-plans/:id/visits/:visitId', (req, res) => {
  const planId = parseInt(req.params.id, 10)
  const visitId = parseInt(req.params.visitId, 10)

  const plan = journeyPlans.find((p) => p.id === planId)
  if (!plan) {
    return res.status(404).json({ error: 'Journey plan not found' })
  }

  const index = plan.visits.findIndex((v) => v.id === visitId)
  if (index === -1) {
    return res.status(404).json({ error: 'Visit not found' })
  }

  plan.visits.splice(index, 1)
  res.status(204).end()
})

const PORT = 3001
// Only bind the port when running directly, not when imported by tests
if (process.argv[1] === new URL(import.meta.url).pathname) {
  app.listen(PORT, () => {
    console.log(`API server running at http://localhost:${PORT}`)
  })
}

export { app }
