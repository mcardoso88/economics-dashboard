import RankedBarChart from './RankedBarChart'
import { fmt } from '../lib/data'

export default function UnemploymentBarChart({
  filtered,
  selectedCode,
  compareCode,
}) {
  return (
    <RankedBarChart
      filtered={filtered}
      metric="Unemployment_Rate"
      direction="asc"
      title="Unemployment rate"
      subtitle="Share of labour force participants who are unemployed — ranked lowest to highest"
      formatValue={fmt.pct1}
      axisFormat={(v) => `${v}%`}
      selectedCode={selectedCode}
      compareCode={compareCode}
    />
  )
}
