import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  LabelList,
} from 'recharts'
import { COLORS, AGE_LABELS } from '../lib/config'
import { fmt } from '../lib/data'

/**
 * Gender pay gap view.
 *
 * Props:
 *   - crossGender: rows for the current Geo + Age across ALL genders
 *                  (one row per field-of-study per gender).
 *   - selectedCode, compareCode: highlighted degree(s)
 */
export default function GenderPayGap({
  crossGender,
  selectedCode,
  compareCode,
}) {
  const chartData = useMemo(() => {
    const codes = [selectedCode, compareCode].filter(Boolean)
    return codes.map((code) => {
      const men = crossGender.find(
        (r) =>
          String(r.Major_Field_code) === String(code) && r.Gender === 'Men+'
      )
      const women = crossGender.find(
        (r) =>
          String(r.Major_Field_code) === String(code) && r.Gender === 'Women+'
      )
      const total = crossGender.find(
        (r) =>
          String(r.Major_Field_code) === String(code) &&
          r.Gender === 'Total - Gender'
      )
      const name = (men || women || total)?.Major_Field_description || code
      const menInc = Number(men?.Median_Income) || 0
      const womenInc = Number(women?.Median_Income) || 0
      const gap = menInc && womenInc ? (menInc - womenInc) / menInc : null
      return {
        code: String(code),
        name,
        short: fmt.shortName(name, 34),
        Men: menInc,
        Women: womenInc,
        gap,
      }
    })
  }, [crossGender, selectedCode, compareCode])

  const context = useMemo(() => {
    const r = crossGender?.[0]
    return r ? { geo: r.Geo, age: AGE_LABELS[r.Age] || r.Age } : null
  }, [crossGender])

  if (!chartData.length || !context) {
    return (
      <div className="card p-5 sm:p-6 text-sm text-slate-500">
        Pick a degree to see the gender pay gap.
      </div>
    )
  }

  return (
    <div className="card p-5 sm:p-6">
      <div className="flex items-baseline justify-between mb-1 gap-4 flex-wrap">
        <h3 className="text-sm font-semibold text-slate-900">
          Gender pay gap — median income
        </h3>
        <span className="text-xs text-slate-500">
          {context.geo} · {context.age}
        </span>
      </div>
      <p className="text-xs text-slate-500 mb-4">
        Men+ vs. Women+ median employment income (full-year full-time, 2020).
      </p>

      <div style={{ width: '100%', height: Math.max(220, chartData.length * 110) }}>
        <ResponsiveContainer>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 8, right: 60, bottom: 8, left: 8 }}
            barGap={4}
            barCategoryGap={24}
          >
            <CartesianGrid
              horizontal={false}
              stroke="#E2E8F0"
              strokeDasharray="2 4"
            />
            <XAxis
              type="number"
              tickFormatter={fmt.money0short}
              tick={{ fill: COLORS.greyText, fontSize: 11 }}
              axisLine={{ stroke: '#CBD5E1' }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="short"
              tick={{ fill: COLORS.greyDark, fontSize: 12, fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              width={220}
              interval={0}
            />
            <Tooltip
              cursor={{ fill: 'rgba(0,0,102,0.04)' }}
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null
                const d = payload[0].payload
                return (
                  <div className="bg-white rounded-lg border border-slate-200 shadow-lg px-3 py-2 text-xs">
                    <div className="font-semibold text-slate-900 mb-1">
                      {d.name}
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ background: COLORS.navy }}
                      />
                      Men+{' '}
                      <span className="font-semibold tabular-nums">
                        {fmt.money0(d.Men)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ background: COLORS.red }}
                      />
                      Women+{' '}
                      <span className="font-semibold tabular-nums">
                        {fmt.money0(d.Women)}
                      </span>
                    </div>
                    {d.gap != null && (
                      <div className="text-slate-500 mt-1">
                        Gap:{' '}
                        <span className="font-semibold text-slate-800">
                          {(d.gap * 100).toFixed(1)}%
                        </span>{' '}
                        lower for women
                      </div>
                    )}
                  </div>
                )
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 12 }}
              iconType="circle"
              formatter={(v) => (
                <span className="text-slate-700">{v === 'Men' ? 'Men+' : 'Women+'}</span>
              )}
            />
            <Bar
              dataKey="Men"
              fill={COLORS.navy}
              radius={[0, 4, 4, 0]}
              isAnimationActive={false}
            >
              <LabelList
                dataKey="Men"
                position="right"
                formatter={(v) => fmt.money0short(v)}
                style={{ fill: COLORS.navy, fontSize: 11, fontWeight: 600 }}
              />
            </Bar>
            <Bar
              dataKey="Women"
              fill={COLORS.red}
              radius={[0, 4, 4, 0]}
              isAnimationActive={false}
            >
              <LabelList
                dataKey="Women"
                position="right"
                formatter={(v) => fmt.money0short(v)}
                style={{ fill: COLORS.red, fontSize: 11, fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {chartData.length > 0 && (
        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          {chartData.map((d) => (
            <div
              key={d.code}
              className="rounded-lg bg-slate-50 border border-slate-200 p-3"
            >
              <div className="text-xs font-semibold text-slate-900 mb-1">
                {d.name}
              </div>
              {d.gap != null ? (
                <div className="text-xs text-slate-600">
                  Women+ earn{' '}
                  <span className="font-semibold text-brock-red">
                    {(d.gap * 100).toFixed(1)}%
                  </span>{' '}
                  less than Men+ (
                  <span className="tabular-nums">{fmt.money0(d.Men - d.Women)}</span>{' '}
                  difference)
                </div>
              ) : (
                <div className="text-xs text-slate-500">
                  Gender breakdown not available.
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
