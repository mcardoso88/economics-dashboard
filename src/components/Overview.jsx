import { useMemo } from 'react'
import {
  FEATURED_CODE,
  FEATURED_NAME,
  AGE_LABELS,
  GENDER_LABELS,
} from '../lib/config'
import { rankByMetric, findByCode, fmt } from '../lib/data'

// Overview section: rank callouts for the featured degree vs. all 50.
// Everything is computed from the currently-filtered slice so values update
// live when the user changes the Filter Bar.
export default function Overview({ filtered, filters }) {
  const insights = useMemo(() => {
    if (!filtered.length) return null
    const byMedian = rankByMetric(filtered, 'Median_Income', 'desc')
    const byAverage = rankByMetric(filtered, 'Average_Income', 'desc')
    const byEmp = rankByMetric(filtered, 'Employment_Rate', 'desc')
    const byUnemp = rankByMetric(filtered, 'Unemployment_Rate', 'asc')

    const featMedian = findByCode(byMedian, FEATURED_CODE)
    const featAverage = findByCode(byAverage, FEATURED_CODE)
    const featEmp = findByCode(byEmp, FEATURED_CODE)
    const featUnemp = findByCode(byUnemp, FEATURED_CODE)

    if (!featMedian) return null

    return {
      total: filtered.length,
      median: featMedian,
      average: featAverage,
      emp: featEmp,
      unemp: featUnemp,
    }
  }, [filtered])

  if (!insights) {
    return (
      <section className="mt-6">
        <div className="card p-6 text-sm text-slate-500">
          {FEATURED_NAME} not found in the current filter slice.
        </div>
      </section>
    )
  }

  const {
    total,
    median: m,
    average: a,
    emp: e,
    unemp: u,
  } = insights

  const scopeLabel = `${filters.geo} · ${AGE_LABELS[filters.age]} · ${
    GENDER_LABELS[filters.gender]
  }`

  return (
    <section className="mt-6">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="section-title">Overview — {FEATURED_NAME}</h2>
        <span className="text-xs text-slate-500">{scopeLabel}</span>
      </div>

      <div className="card p-6 sm:p-8">
        <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
          Among the {total} most popular bachelor's degrees,{' '}
          <span className="font-semibold text-brock-navy">{FEATURED_NAME}</span>{' '}
          ranks{' '}
          <RankPhrase rank={a.rank} total={total} metric="average income" />,{' '}
          <RankPhrase rank={m.rank} total={total} metric="median income" />,{' '}
          <RankPhrase rank={e.rank} total={total} metric="employment rate" />,
          {' '}and{' '}
          <RankPhrase
            rank={u.rank}
            total={total}
            metric="unemployment rate"
          />{' '}
          in {filters.geo}.
        </p>

        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <RankCard
            label="Average income"
            value={fmt.money0(a.Average_Income)}
            rank={a.rank}
            total={total}
            tone="red"
          />
          <RankCard
            label="Median income"
            value={fmt.money0(m.Median_Income)}
            rank={m.rank}
            total={total}
            tone="red"
          />
          <RankCard
            label="Unemployment rate"
            value={fmt.pct1(u.Unemployment_Rate)}
            rank={u.rank}
            total={total}
            tone="navy"
          />
          <RankCard
            label="Employment rate"
            value={fmt.pct1(e.Employment_Rate)}
            rank={e.rank}
            total={total}
            tone="navy"
          />
        </div>
      </div>
    </section>
  )
}

function RankPhrase({ rank, total, metric }) {
  return (
    <>
      <span className="font-semibold text-brock-red">
        #{rank} of {total}
      </span>{' '}
      in {metric}
    </>
  )
}

function RankCard({ label, value, rank, total, tone, rankSuffix = '' }) {
  const accent =
    tone === 'red'
      ? 'border-l-brock-red'
      : 'border-l-brock-navy'
  return (
    <div className={`rounded-lg bg-slate-50 border border-slate-200 border-l-4 ${accent} p-4`}>
      <div className="section-title">{label}</div>
      <div className="mt-2 text-2xl font-bold text-slate-900 tabular-nums">
        {value}
      </div>
      <div className="mt-1 text-xs text-slate-500">
        Rank <span className="font-semibold text-slate-700">#{rank}</span> of{' '}
        {total}
        {rankSuffix}
      </div>
    </div>
  )
}
