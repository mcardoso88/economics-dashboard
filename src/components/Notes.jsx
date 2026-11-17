import {
  TABLES,
  TOP_N,
  RANKING_SLICE,
  INCOME_SLICE,
  DEGREE_OPTIONS,
  DEGREE_LABELS,
  EXCLUDED_FIELDS,
  CROSS_LEVEL_FIELDS,
  CIP_URL,
} from '../lib/selection'
import { AGE_LABELS } from '../lib/config'

// Methodology notes. Text is driven by src/lib/selection.js — the same rules
// the data pipeline uses — so it stays accurate if the rules change.
export default function Notes() {
  const exclusions = DEGREE_OPTIONS.flatMap((deg) =>
    Object.keys(EXCLUDED_FIELDS[deg] || {}).map((code) => ({ deg, code }))
  )
  const crossLevel = DEGREE_OPTIONS.flatMap((deg) =>
    Object.entries(CROSS_LEVEL_FIELDS[deg] || {}).map(([code, f]) => ({
      deg,
      code,
      ...f,
    }))
  )
  const lower = (deg) => DEGREE_LABELS[deg].toLowerCase()

  return (
    <section className="mt-12 pt-5 border-t border-slate-200">
      <h2 className="section-title">Notes</h2>
      <ul className="mt-2 space-y-1 text-[11px] sm:text-xs text-slate-500 leading-snug list-disc pl-4 max-w-5xl">
        <li>
          <Term>Data:</Term> Statistics Canada, 2021 Census. Rates from{' '}
          <Link href={TABLES.labour.url}>{TABLES.labour.id}</Link>; income
          from <Link href={TABLES.income.url}>{TABLES.income.id}</Link>.
        </li>
        <li>
          <Term>Fields shown:</Term> for each degree level, the top {TOP_N}{' '}
          4-digit fields of study (<Link href={CIP_URL}>CIP 2021</Link>; see
          the link for field definitions and the programs each includes),
          ranked by everyone whose highest credential is that degree (
          {TABLES.labour.id} “{RANKING_SLICE.labourForceStatus}”,{' '}
          {RANKING_SLICE.geo}, ages {AGE_LABELS[RANKING_SLICE.age]}, all
          genders). The list stays the same across Region, Age and Gender.
        </li>
        <li>
          <Term>Exclusions:</Term> catch-all “other” fields (xx.99)
          {exclusions.map(({ deg, code }) => (
            <span key={`${deg}-${code}`}>
              ; {code} from the {lower(deg)} list (see below)
            </span>
          ))}
          . The next-ranked field takes their place.
        </li>
        {crossLevel.map(({ deg, code, reason }) => (
          <li key={`${deg}-${code}`}>
            <Term>
              {code} in the {lower(deg)} list:
            </Term>{' '}
            {reason}
          </li>
        ))}
        <li>
          <Term>Degree level</Term> is the <em>highest</em> credential held. A
          person with a bachelor’s and a master’s counts only under master’s, in
          that degree’s field.
        </li>
        <li>
          <Term>Rates:</Term> employment rate = employed ÷ everyone with the
          credential; unemployment rate = unemployed ÷ labour force. Both refer
          to May 2021. <Term>Income:</Term> employment income in{' '}
          {INCOME_SLICE.incomeYear} for those who worked full year, full time.
        </li>
      </ul>
    </section>
  )
}

function Term({ children }) {
  return <strong className="font-semibold text-slate-700">{children}</strong>
}

function Link({ href, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="underline hover:text-brock-navy"
    >
      {children}
    </a>
  )
}
