// ============================================================================
// Selection rules — shared by the data pipeline (scripts/fetch-statcan.mjs)
// and the Notes section of the dashboard, so the published methodology can
// never drift from what the script actually does.
//
// Plain JS only (no Vite / import.meta) so Node can import it directly.
// ============================================================================

export const CENSUS_YEAR = 2021

export const TABLES = {
  labour: {
    id: '98-10-0401-01',
    pid: 98100401,
    url: 'https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=9810040101',
    title: 'Labour force status by major field of study and highest level of education',
  },
  income: {
    id: '98-10-0409-01',
    pid: 98100409,
    url: 'https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=9810040901',
    title: 'Employment income statistics by major field of study and highest level of education',
  },
}

// Degree levels offered in the dashboard (exact StatCan member names).
export const DEGREE_OPTIONS = ["Bachelor's degree", "Master's degree"]
export const DEGREE_LABELS = {
  "Bachelor's degree": "Bachelor's",
  "Master's degree": "Master's",
}

// Filter dimensions pulled for every field (exact StatCan member names).
export const GEO_OPTIONS = ['Canada', 'Ontario']
export const AGE_OPTIONS = ['25 to 64 years', '25 to 34 years', '35 to 44 years']
export const GENDER_OPTIONS = ['Total - Gender', 'Men+', 'Women+']

// How many fields per degree level, and the slice used to rank them.
export const TOP_N = 50
export const RANKING_SLICE = {
  table: 'labour',
  geo: 'Canada',
  age: '25 to 64 years',
  gender: 'Total - Gender',
  labourForceStatus: 'Total - Labour force status',
}

// Income cut from 98-10-0409-01.
export const INCOME_SLICE = {
  workActivity: 'Worked full year full time',
  incomeYear: '2020',
}

// Only 4-digit CIP codes (e.g. "45.06") are eligible; "xx.99 ... other"
// catch-all fields are dropped.
export const EXCLUDE_OTHER_CATCHALLS = true

// Field-specific exclusions per degree level: { code: reason }.
// Excluded fields are skipped and the next-ranked field takes their place.
export const EXCLUDED_FIELDS = {
  "Bachelor's degree": {
    '22.01':
      'Law (LLB, JD, BCL) is usually earned as a second degree after another bachelor’s, so it is not comparable to first-entry bachelor’s programs.',
  },
  "Master's degree": {},
}
