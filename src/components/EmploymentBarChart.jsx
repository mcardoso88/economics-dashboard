import RankedBarChart from './RankedBarChart'
import { fmt } from '../lib/data'

export default function EmploymentBarChart({
  filtered,
  selectedCode,
  compareCode,
}) {
  return (
    <RankedBarChart
      filtered={filtered}
      metric="Employment_Rate"
      direction="desc"
      title="Employment rate"
      subtitle="Share of degree holders employed — ranked highest to lowest"
      formatValue={fmt.pct1}
      axisFormat={(v) => `${v}%`}
      selectedCode={selectedCode}
      compareCode={compareCode}
    />
  )
}
