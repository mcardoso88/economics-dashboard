import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { COLORS } from '../lib/config'
import { rankByMetric, fmt } from '../lib/data'

/**
 * Shared horizontal bar chart used by Income and Employment rankings.
 *
 * Props:
 *   - filtered:     currently-filtered rows (one per degree)
 *   - metric:       field key (e.g. 'Median_Income')
 *   - direction:    'desc' | 'asc' — how to rank (defaults to desc)
 *   - title:        chart title
 *   - subtitle:     chart subtitle
 *   - formatValue:  (v) => string
 *   - axisFormat:   (v) => string (for x-axis ticks)
 *   - selectedCode: highlighted code (red)
 *   - compareCode:  second highlighted code (navy), or null
 */
export default function RankedBarChart({
  filtered,
  metric,
  direction = 'desc',
  title,
  subtitle,
  formatValue,
  axisFormat,
  selectedCode,
  compareCode,
}) {
  const ranked = rankByMetric(filtered, metric, direction)

  // Build chart data — show rank + short name so Y axis stays readable
  const data = ranked.map((r) => ({
    code: String(r.Major_Field_code),
    label: `${r.rank}. ${fmt.shortName(r.Major_Field_description, 42)}`,
    fullName: r.Major_Field_description,
    value: Number(r[metric]),
    rank: r.rank,
  }))

  const colorFor = (code) => {
    if (String(code) === String(selectedCode)) return COLORS.red
    if (compareCode && String(code) === String(compareCode)) return COLORS.navy
    return COLORS.grey
  }

  // Height scales with number of bars so they stay readable
  const height = Math.max(420, data.length * 22 + 40)

  return (
    <div className="card p-5 sm:p-6">
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      </div>
      {subtitle && (
        <p className="text-xs text-slate-500 mb-4">{subtitle}</p>
      )}

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 24, bottom: 4, left: 8 }}
            barCategoryGap={2}
          >
            <CartesianGrid
              horizontal={false}
              stroke="#E2E8F0"
              strokeDasharray="2 4"
            />
            <XAxis
              type="number"
              tickFormatter={axisFormat}
              tick={{ fill: COLORS.greyText, fontSize: 11 }}
              axisLine={{ stroke: '#CBD5E1' }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="label"
              tick={{ fill: COLORS.greyDark, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={260}
              interval={0}
            />
            <Tooltip
              cursor={{ fill: 'rgba(0,0,102,0.04)' }}
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null
                const d = payload[0].payload
                return (
                  <div className="bg-white rounded-lg border border-slate-200 shadow-lg px-3 py-2 text-xs">
                    <div className="font-semibold text-slate-900 mb-0.5">
                      {d.fullName}
                    </div>
                    <div className="text-slate-600">
                      Rank <span className="font-semibold">#{d.rank}</span> of{' '}
                      {data.length}
                    </div>
                    <div className="text-slate-900 font-semibold tabular-nums">
                      {formatValue(d.value)}
                    </div>
                  </div>
                )
              }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} isAnimationActive={false}>
              {data.map((d) => (
                <Cell key={d.code} fill={colorFor(d.code)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
