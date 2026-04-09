import { useEffect, useMemo, useState } from 'react'
import Header from './components/Header'
import FilterBar from './components/FilterBar'
import Overview from './components/Overview'
import Explorer from './components/Explorer'
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

  // Cross-gender slice: same Geo + Age, but ALL genders (150 rows).
  // Used by the GenderPayGap chart which always needs Men+/Women+
  // regardless of the current Gender filter.
  const crossGender = useMemo(() => {
    if (!rows) return []
    return rows.filter(
      (r) => r.Geo === filters.geo && r.Age === filters.age
    )
  }, [rows, filters.geo, filters.age])

  // Degree list is stable across filter changes (same 50 fields)
  const degrees = useMemo(
    () => (rows ? getDegreeList(rows) : []),
    [rows]
  )

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

        <footer className="mt-16 pt-8 border-t border-slate-200 text-xs text-slate-500">
          <p>
            Data source: Statistics Canada, 2021 Census of Population, Table{' '}
            <a
              href="https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=9810040901"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-brock-navy"
            >
              98-10-0409-01
            </a>
            . Income figures cover workers who worked full year, full time in 2020.
            Employment and unemployment rates cover all labour force participants
            with the specified credential.
          </p>
        </footer>
      </main>
    </div>
  )
}
