import {
  TABLES,
  TOP_N,
  RANKING_SLICE,
  INCOME_SLICE,
  DEGREE_OPTIONS,
  DEGREE_LABELS,
  EXCLUDED_FIELDS,
} from '../lib/selection'
import { AGE_LABELS } from '../lib/config'

// Methodology notes. Text is driven by src/lib/selection.js — the same rules
// the data pipeline uses — so it stays accurate if the rules change.
export default function Notes() {
  const exclusions = DEGREE_OPTIONS.flatMap((deg) =>
    Object.entries(EXCLUDED_FIELDS[deg] || {}).map(([code, reason]) => ({
      deg,
      code,
      reason,
    }))
  )

  return (
    <section className="mt-16 pt-8 border-t border-slate-200">
      <h2 className="section-title">Notes</h2>
      <ul className="mt-3 space-y-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed list-disc pl-5 max-w-4xl">
        <li>
          <strong className="text-slate-800">Data.</strong> Statistics Canada,
          2021 Census of Population. Employment and unemployment rates come from
          Table <TableLink t={TABLES.labour} />; median and average employment
          income come from Table <TableLink t={TABLES.income} />.
        </li>
        <li>
          <strong className="text-slate-800">Which fields are shown.</strong>{' '}
          For each degree level, the dashboard shows the {TOP_N} detailed
          (4-digit CIP 2021) fields of study with the most people whose highest
          credential is that degree. Fields are ranked by the{' '}
          <em>{RANKING_SLICE.labourForceStatus}</em> count in{' '}
          {TABLES.labour.id}, which counts everyone with the degree whether or
          not they are in the labour force. The ranking uses{' '}
          {RANKING_SLICE.geo}, ages {AGE_LABELS[RANKING_SLICE.age]}, all
          genders. The same {TOP_N} fields are kept for every Region, Age and
          Gender filter.
        </li>
        <li>
          <strong className="text-slate-800">Exclusions.</strong> Catch-all
          “other” fields (CIP codes ending in .99) are left out.
          {exclusions.map(({ deg, code, reason }) => (
            <span key={`${deg}-${code}`}>
              {' '}
              CIP {code} is left out of the{' '}
              {DEGREE_LABELS[deg].toLowerCase()} list: {reason}
            </span>
          ))}{' '}
          When a field is left out, the next-ranked field takes its place.
        </li>
        <li>
          <strong className="text-slate-800">Degree level.</strong> A degree
          level means the person’s <em>highest</em> credential. Someone with
          both a bachelor’s and a master’s appears only under Master’s, with the
          field of study of that master’s degree.
        </li>
        <li>
          <strong className="text-slate-800">Rates.</strong> The employment
          rate is the share of everyone with the credential who is employed.
          The unemployment rate is the share of labour force participants who
          are unemployed. Both refer to the Census reference week in May 2021.
        </li>
        <li>
          <strong className="text-slate-800">Income.</strong> Median and
          average employment income in {INCOME_SLICE.incomeYear}, for people
          who worked full year, full time that year.
        </li>
      </ul>
    </section>
  )
}

function TableLink({ t }) {
  return (
    <a
      href={t.url}
      target="_blank"
      rel="noopener noreferrer"
      className="underline hover:text-brock-navy"
    >
      {t.id}
    </a>
  )
}
