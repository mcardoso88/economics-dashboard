import RankedBarChart from './RankedBarChart'
import { fmt } from '../lib/data'

export default function IncomeBarChart({
  filtered,
  selectedCode,
  compareCode,
}) {
  return (
    <RankedBarChart
      filtered={filtered}
      metric="Median_Income"
      direction="desc"
      title="Median employment income"
      subtitle="Full-year, full-time workers in 2020 — ranked highest to lowest"
      formatValue={fmt.money0}
      axisFormat={fmt.money0short}
      selectedCode={selectedCode}
      compareCode={compareCode}
    />
  )
}
