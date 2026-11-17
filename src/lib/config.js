// ============================================================================
// Config — single source of truth for things you're most likely to change.
// ============================================================================

// Brock University brand colors
export const COLORS = {
  red: '#CC0000',
  redDark: '#A30000',
  redLight: '#FFE5E5',
  navy: '#000066',
  navyDark: '#00004D',
  navyLight: '#E5E5F2',
  grey: '#E2E8F0', // slate-200 — used for faded/unselected bars
  greyText: '#64748B', // slate-500
  greyDark: '#334155', // slate-700
}

// The department/degree this dashboard centers around.
// Change FEATURED_CODE to any CIP code in the CSV (e.g. "52.01") and the
// Overview section will automatically recompute its rank callouts.
export const FEATURED_CODE = '45.06'
export const FEATURED_NAME = 'Economics'

// Dashboard title. The featured name is injected dynamically.
export const TITLE = `Why study ${FEATURED_NAME}? Exploring labour market outcomes for Canadian degree holders by field of study`

// Default filter state on first load
export const DEFAULT_FILTERS = {
  geo: 'Canada',
  age: '25 to 64 years',
  gender: 'Total - Gender',
  degree: "Bachelor's degree",
}

// Option lists (exact CSV values) live in selection.js, which the data
// pipeline also reads — re-exported here for the UI.
export {
  GEO_OPTIONS,
  AGE_OPTIONS,
  GENDER_OPTIONS,
  DEGREE_OPTIONS,
  DEGREE_LABELS,
} from './selection'

// Human-readable labels for dropdowns
export const GENDER_LABELS = {
  'Total - Gender': 'All genders',
  'Men+': 'Men+',
  'Women+': 'Women+',
}
export const AGE_LABELS = {
  '25 to 64 years': '25 – 64',
  '25 to 34 years': '25 – 34',
  '35 to 44 years': '35 – 44',
}

// Path to the CSV (resolved relative to the Vite base path so it works
// both locally and on GitHub Pages)
export const CSV_PATH = `${import.meta.env.BASE_URL}top50_degrees_combined.csv`
