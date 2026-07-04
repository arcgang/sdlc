import { useEffect, useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import styles from './StoreList.module.css'

const TIER_LABELS = { 1: 'Tier 1', 2: 'Tier 2', 3: 'Tier 3' }
const TIER_CLASSES = { 1: styles.tierRed, 2: styles.tierAmber, 3: styles.tierGreen }

export default function StoreList() {
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [search, setSearch] = useState('')
  const [filterTerritory, setFilterTerritory] = useState('')
  const [filterChannel, setFilterChannel] = useState('')
  const [filterTiers, setFilterTiers] = useState([])

  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch('/stores')
      .then((r) => {
        if (!r.ok) throw new Error(`Server error ${r.status}`)
        return r.json()
      })
      .then(setStores)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const territories = useMemo(
    () => [...new Set(stores.map((s) => s.territory))].sort(),
    [stores]
  )
  const channels = useMemo(
    () => [...new Set(stores.map((s) => s.channel))].sort(),
    [stores]
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return stores.filter((s) => {
      if (filterTerritory && s.territory !== filterTerritory) return false
      if (filterChannel && s.channel !== filterChannel) return false
      if (filterTiers.length > 0 && !filterTiers.includes(s.priority_tier)) return false
      if (q) {
        const haystack = `${s.name} ${s.address} ${s.channel} ${s.territory}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [stores, search, filterTerritory, filterChannel, filterTiers])

  function toggleTier(tier) {
    setFilterTiers((prev) =>
      prev.includes(tier) ? prev.filter((t) => t !== tier) : [...prev, tier]
    )
  }

  function handleRowClick(id) {
    navigate(`/stores/${id}`)
  }

  return (
    <main className={styles.page}>
      <h1 className={styles.heading}>Stores</h1>

      <div className={styles.controls}>
        <input
          className={styles.searchInput}
          type="search"
          placeholder="Search by name, address, channel…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search stores"
        />

        <select
          className={styles.select}
          value={filterTerritory}
          onChange={(e) => setFilterTerritory(e.target.value)}
          aria-label="Filter by territory"
        >
          <option value="">All territories</option>
          {territories.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <select
          className={styles.select}
          value={filterChannel}
          onChange={(e) => setFilterChannel(e.target.value)}
          aria-label="Filter by channel"
        >
          <option value="">All channels</option>
          {channels.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <fieldset className={styles.tierFieldset}>
          <legend className={styles.tierLegend}>Priority tier</legend>
          {[1, 2, 3].map((tier) => (
            <label key={tier} className={styles.tierLabel}>
              <input
                type="checkbox"
                checked={filterTiers.includes(tier)}
                onChange={() => toggleTier(tier)}
              />
              <span className={`${styles.tierBadge} ${TIER_CLASSES[tier]}`}>
                {TIER_LABELS[tier]}
              </span>
            </label>
          ))}
        </fieldset>
      </div>

      {loading && <p className={styles.status}>Loading stores…</p>}
      {error && <p className={styles.status} role="alert">Error: {error}</p>}

      {!loading && !error && (
        <>
          <p className={styles.count}>
            {filtered.length} {filtered.length === 1 ? 'store' : 'stores'}
            {filtered.length !== stores.length && ` of ${stores.length}`}
          </p>

          <div className={styles.tableWrapper} role="region" aria-label="Store list">
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Store Name</th>
                  <th scope="col">Address</th>
                  <th scope="col">Channel</th>
                  <th scope="col">Territory</th>
                  <th scope="col">Priority</th>
                  <th scope="col">Last Visited</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={styles.empty}>No stores match the current filters.</td>
                  </tr>
                ) : (
                  filtered.map((store) => (
                    <tr
                      key={store.id}
                      className={styles.row}
                      onClick={() => handleRowClick(store.id)}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          handleRowClick(store.id)
                        }
                      }}
                    >
                      <td className={styles.nameCell}>
                        <Link to={`/stores/${store.id}`} className={styles.nameLink}>{store.name}</Link>
                      </td>
                      <td>{store.address}</td>
                      <td className={styles.capitalize}>{store.channel}</td>
                      <td>{store.territory}</td>
                      <td>
                        <span className={`${styles.tierBadge} ${TIER_CLASSES[store.priority_tier]}`}>
                          {TIER_LABELS[store.priority_tier]}
                        </span>
                      </td>
                      <td>{store.last_visited_date || <span className={styles.never}>Never</span>}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  )
}
