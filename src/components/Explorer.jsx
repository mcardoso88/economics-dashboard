import DegreePicker from './DegreePicker'
import AverageIncomeBarChart from './AverageIncomeBarChart'
import IncomeBarChart from './IncomeBarChart'
import UnemploymentBarChart from './UnemploymentBarChart'
import EmploymentBarChart from './EmploymentBarChart'
import GenderPayGap from './GenderPayGap'

export default function Explorer({
  filtered,
  crossGender,
  degrees,
  selectedCode,
  compareCode,
  compareMode,
  onSelect,
  onCompareSelect,
  onCompareModeChange,
}) {
  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="section-title">Field of Study Explorer</h2>
          <p className="mt-1 text-sm text-slate-600">
            Pick a degree to see where it stands. Toggle compare mode to
            measure one degree against another head-to-head.
          </p>
        </div>
        <ModeToggle mode={compareMode} onChange={onCompareModeChange} />
      </div>

      <div className="card p-5 sm:p-6">
        <div className={`grid gap-4 ${compareMode ? 'md:grid-cols-2' : ''}`}>
          <DegreePicker
            degrees={degrees}
            value={selectedCode}
            onChange={onSelect}
            label={compareMode ? 'Degree A' : 'Selected degree'}
            accent="red"
          />
          {compareMode && (
            <DegreePicker
              degrees={degrees}
              value={compareCode}
              onChange={onCompareSelect}
              label="Degree B"
              accent="navy"
              placeholder="Pick a degree to compare…"
              allowClear
            />
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AverageIncomeBarChart
          filtered={filtered}
          selectedCode={selectedCode}
          compareCode={compareMode ? compareCode : null}
        />
        <IncomeBarChart
          filtered={filtered}
          selectedCode={selectedCode}
          compareCode={compareMode ? compareCode : null}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UnemploymentBarChart
          filtered={filtered}
          selectedCode={selectedCode}
          compareCode={compareMode ? compareCode : null}
        />
        <EmploymentBarChart
          filtered={filtered}
          selectedCode={selectedCode}
          compareCode={compareMode ? compareCode : null}
        />
      </div>

      <div className="mt-6">
        <GenderPayGap
          crossGender={crossGender}
          selectedCode={selectedCode}
          compareCode={compareMode ? compareCode : null}
        />
      </div>
    </section>
  )
}

function ModeToggle({ mode, onChange }) {
  return (
    <div
      role="tablist"
      aria-label="View mode"
      className="inline-flex rounded-lg border border-slate-300 bg-white p-1 shadow-sm"
    >
      <button
        type="button"
        role="tab"
        aria-selected={!mode}
        onClick={() => onChange(false)}
        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
          !mode
            ? 'bg-brock-navy text-white'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        Highlight
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode}
        onClick={() => onChange(true)}
        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
          mode
            ? 'bg-brock-navy text-white'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        Compare two
      </button>
    </div>
  )
}
