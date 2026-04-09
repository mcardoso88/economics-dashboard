import { useEffect, useMemo, useRef, useState } from 'react'

/**
 * Searchable combobox for picking a field of study.
 *
 * Props:
 *   - degrees: [{ code, name }]
 *   - value:   currently selected code (or null)
 *   - onChange: (code) => void
 *   - label:   string label above the input
 *   - accent:  'red' | 'navy' — border color when selected
 *   - placeholder: string
 *   - allowClear: boolean
 */
export default function DegreePicker({
  degrees,
  value,
  onChange,
  label,
  accent = 'red',
  placeholder = 'Search degrees…',
  allowClear = false,
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const wrapRef = useRef(null)

  const selected = degrees.find((d) => d.code === value) || null

  // Close on outside click
  useEffect(() => {
    function handle(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const filtered = useMemo(() => {
    if (!query) return degrees
    const q = query.toLowerCase()
    return degrees.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q)
    )
  }, [degrees, query])

  const accentRing =
    accent === 'red'
      ? 'focus-within:ring-brock-red focus-within:border-brock-red'
      : 'focus-within:ring-brock-navy focus-within:border-brock-navy'

  const accentDot =
    accent === 'red' ? 'bg-brock-red' : 'bg-brock-navy'

  return (
    <div ref={wrapRef} className="relative">
      {label && (
        <div className="flex items-center gap-2 mb-1.5">
          <span className={`h-2 w-2 rounded-full ${accentDot}`} />
          <span className="section-title">{label}</span>
        </div>
      )}
      <div
        className={`flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 shadow-sm focus-within:ring-1 ${accentRing}`}
      >
        <input
          type="text"
          className="flex-1 bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
          placeholder={selected ? selected.name : placeholder}
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
        />
        {allowClear && selected && (
          <button
            type="button"
            className="text-slate-400 hover:text-slate-600"
            onClick={() => {
              onChange(null)
              setQuery('')
            }}
            aria-label="Clear selection"
          >
            ×
          </button>
        )}
        <button
          type="button"
          className="text-slate-400 hover:text-slate-600"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle list"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {open && (
        <div className="absolute z-20 mt-1 w-full max-h-72 overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg">
          {filtered.length === 0 ? (
            <div className="px-3 py-3 text-sm text-slate-500">No matches</div>
          ) : (
            filtered.map((d) => (
              <button
                key={d.code}
                type="button"
                onClick={() => {
                  onChange(d.code)
                  setQuery('')
                  setOpen(false)
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 border-b border-slate-100 last:border-0 flex items-start gap-2 ${
                  d.code === value
                    ? 'bg-slate-50 font-semibold'
                    : ''
                }`}
              >
                <span className="font-mono text-xs text-slate-400 w-12 shrink-0 pt-0.5">
                  {d.code}
                </span>
                <span className="text-slate-800">{d.name}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
