import RankedBarChart from './RankedBarChart'
import { fmt } from '../lib/data'

export default function AverageIncomeBarChart({
  filtered,
  selectedCode,
  compareCode,
}) {
  return (
    <RankedBarChart
      filtered={filtered}
      metric="Average_Income"
      direction="desc"
      title="Average employment income"
      subtitle="Full-year, full-time workers in 2020 — ranked highest to lowest"
      formatValue={fmt.money0}
      axisFormat={fmt.money0short}
      selectedCode={selectedCode}
      compareCode={compareCode}
    />
  )
}
