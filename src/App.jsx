import { useEffect, useMemo, useState } from 'react'
import Header from './components/Header'
import FilterBar from './components/FilterBar'
import Overview from './components/Overview'
import Explorer from './components/Explorer'
import Notes from './components/Notes'
import { loadData, filterRows, getDegreeList } from './lib/data'
import { DEFAULT_FILTERS, FEATURED_CODE } from './lib/config'

export default function App() {
  const [rows, setRows] = useState(null)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState(DEFAULT_FILTERS)

  // Selected degrees for the Explorer section
  const [selectedCode, setSelectedCode] = useState(FEATURED_CODE)
  const [compareCode, setCompareCode] = useState(null)
  const [compareMode, setCompareMode] = useState(false)

  // Load CSV once on mount
  useEffect(() => {
    let alive = true
    loadData()
      .then((data) => {
        if (alive) setRows(data)
      })
      .catch((err) => {
        console.error(err)
        if (alive) setError(err.message || 'Failed to load data')
      })
    return () => {
      alive = false
    }
  }, [])

  // Current filtered slice (50 rows — one per degree)
  const filtered = useMemo(
    () => (rows ? filterRows(rows, filters) : []),
    [rows, filters]
  )

  // Cross-gender slice: same Geo + Age + Degree level, but ALL genders
  // (150 rows). Used by the GenderPayGap chart which always needs
  // Men+/Women+ regardless of the current Gender filter.
  const crossGender = useMemo(() => {
    if (!rows) return []
    return rows.filter(
      (r) =>
        r.Geo === filters.geo &&
        r.Age === filters.age &&
        r.Highest_Degree === filters.degree
    )
  }, [rows, filters.geo, filters.age, filters.degree])

  // The 50 fields differ by degree level but not by Geo / Age / Gender
  const degrees = useMemo(
    () => (rows ? getDegreeList(rows, filters.degree) : []),
    [rows, filters.degree]
  )

  // Switching degree level can drop the selected field(s) from the list.
  // Fall back to the featured degree (or the most common field) if so.
  useEffect(() => {
    if (!degrees.length) return
    const has = (code) => degrees.some((d) => d.code === String(code))
    if (!has(selectedCode)) {
      setSelectedCode(has(FEATURED_CODE) ? FEATURED_CODE : degrees[0].code)
    }
    if (compareCode && !has(compareCode)) setCompareCode(null)
  }, [degrees]) // eslint-disable-line react-hooks/exhaustive-deps

  // When exiting compare mode, clear the second selection
  const handleCompareModeChange = (on) => {
    setCompareMode(on)
    if (!on) setCompareCode(null)
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="card p-8 max-w-md">
          <h2 className="text-lg font-semibold text-brock-red mb-2">
            Couldn't load data
          </h2>
          <p className="text-sm text-slate-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!rows) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-500 text-sm">Loading data…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <FilterBar filters={filters} onChange={setFilters} />

        <Overview
          filtered={filtered}
          allRows={rows}
          filters={filters}
        />

        <Explorer
          filtered={filtered}
          crossGender={crossGender}
          degrees={degrees}
          selectedCode={selectedCode}
          compareCode={compareCode}
          compareMode={compareMode}
          onSelect={setSelectedCode}
          onCompareSelect={setCompareCode}
          onCompareModeChange={handleCompareModeChange}
        />

        <Notes />
      </main>
    </div>
  )
}
