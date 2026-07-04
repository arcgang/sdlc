import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import styles from './StoreDetail.module.css'

const TIER_LABELS = { 1: 'Tier 1', 2: 'Tier 2', 3: 'Tier 3' }
const TIER_CLASSES = { 1: styles.tierRed, 2: styles.tierAmber, 3: styles.tierGreen }

export default function StoreDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [store, setStore] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(`/stores/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error(r.status === 404 ? 'Store not found' : `Server error ${r.status}`)
        return r.json()
      })
      .then(setStore)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  return (
    <main className={styles.page}>
      <button className={styles.backBtn} onClick={() => navigate('/stores')} aria-label="Back to store list">
        ← Back to Stores
      </button>

      {loading && <p className={styles.status}>Loading…</p>}
      {error && <p className={styles.status} role="alert">Error: {error}</p>}

      {!loading && !error && store && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h1 className={styles.name}>{store.name}</h1>
            <span className={`${styles.tierBadge} ${TIER_CLASSES[store.priority_tier]}`}>
              {TIER_LABELS[store.priority_tier]}
            </span>
          </div>

          <dl className={styles.details}>
            <div className={styles.row}>
              <dt>Address</dt>
              <dd>{store.address}</dd>
            </div>
            <div className={styles.row}>
              <dt>Channel</dt>
              <dd className={styles.capitalize}>{store.channel}</dd>
            </div>
            <div className={styles.row}>
              <dt>Territory</dt>
              <dd>{store.territory}</dd>
            </div>
            <div className={styles.row}>
              <dt>Priority Tier</dt>
              <dd>
                <span className={`${styles.tierBadge} ${TIER_CLASSES[store.priority_tier]}`}>
                  {TIER_LABELS[store.priority_tier]}
                </span>
              </dd>
            </div>
            <div className={styles.row}>
              <dt>Last Visited</dt>
              <dd>{store.last_visited_date || <span className={styles.never}>Never visited</span>}</dd>
            </div>
            <div className={styles.row}>
              <dt>Active</dt>
              <dd>{store.active ? 'Yes' : 'No'}</dd>
            </div>
            {store.latitude != null && store.longitude != null && (
              <div className={styles.row}>
                <dt>Coordinates</dt>
                <dd>{store.latitude.toFixed(5)}, {store.longitude.toFixed(5)}</dd>
              </div>
            )}
          </dl>
        </div>
      )}
    </main>
  )
}
