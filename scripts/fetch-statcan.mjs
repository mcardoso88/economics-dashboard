#!/usr/bin/env node
// ============================================================================
// Rebuild public/top50_degrees_combined.csv from Statistics Canada.
//
//   npm run fetch-data
//
// Pulls two 2021 Census tables through the StatCan Web Data Service (WDS):
//   98-10-0401-01  labour force status  -> ranking + employment/unemployment rates
//   98-10-0409-01  employment income    -> median/average employment income
//
// The full-table CSV downloads are 1-3 GB, so instead we request only the
// cells we need by coordinate. All selection rules live in src/lib/selection.js.
// ============================================================================

import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import {
  CENSUS_YEAR,
  TABLES,
  DEGREE_OPTIONS,
  GEO_OPTIONS,
  AGE_OPTIONS,
  GENDER_OPTIONS,
  TOP_N,
  RANKING_SLICE,
  INCOME_SLICE,
  EXCLUDE_OTHER_CATCHALLS,
  EXCLUDED_FIELDS,
} from '../src/lib/selection.js'

const WDS = 'https://www150.statcan.gc.ca/t1/wds/rest'
const BATCH_SIZE = 300
const OUT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../public/top50_degrees_combined.csv'
)

// ---------------------------------------------------------------------------
// WDS helpers
// ---------------------------------------------------------------------------

async function post(endpoint, body, attempt = 1) {
  try {
    const res = await fetch(`${WDS}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
    return await res.json()
  } catch (err) {
    if (attempt >= 4) throw new Error(`${endpoint} failed: ${err.message}`)
    await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt))
    return post(endpoint, body, attempt + 1)
  }
}

// Dimension keys -> StatCan dimension-name prefixes
const DIM_PREFIX = {
  geo: 'Geography',
  lfs: 'Labour force status',
  age: 'Age',
  degree: 'Highest certificate',
  cip: 'Major field of study',
  gender: 'Gender',
  work: 'Work activity',
  year: 'Income year',
  incStat: 'Employment income statistics',
}

async function loadCube(pid) {
  const [res] = await post('getCubeMetadata', [{ productId: pid }])
  if (res.status !== 'SUCCESS') throw new Error(`No metadata for ${pid}`)
  const dims = res.object.dimension.map((d) => ({
    position: d.dimensionPositionId,
    name: d.dimensionNameEn,
    members: d.member,
  }))
  const byKey = {}
  for (const [key, prefix] of Object.entries(DIM_PREFIX)) {
    const dim = dims.find((d) => d.name.startsWith(prefix))
    if (dim) byKey[key] = dim
  }
  return { pid, dims, byKey }
}

function memberId(cube, key, name) {
  const matches = cube.byKey[key].members.filter((m) => m.memberNameEn.trim() === name)
  if (matches.length !== 1) {
    throw new Error(`${cube.pid}: expected one "${name}" in ${key}, found ${matches.length}`)
  }
  return matches[0].memberId
}

// Build a 10-position WDS coordinate from { dimKey: memberId }.
function coordinate(cube, ids) {
  const parts = Array(10).fill(0)
  for (const [key, id] of Object.entries(ids)) {
    parts[cube.byKey[key].position - 1] = id
  }
  if (cube.dims.some((d) => parts[d.position - 1] === 0)) {
    throw new Error(`${cube.pid}: incomplete coordinate ${parts.join('.')}`)
  }
  return parts.join('.')
}

// Fetch values for many coordinates; returns Map(coordinate -> number|null).
async function fetchValues(pid, coords) {
  const out = new Map()
  for (let i = 0; i < coords.length; i += BATCH_SIZE) {
    const batch = coords.slice(i, i + BATCH_SIZE)
    const res = await post(
      'getDataFromCubePidCoordAndLatestNPeriods',
      batch.map((c) => ({ productId: pid, coordinate: c, latestN: 1 }))
    )
    // WDS does NOT return results in request order — key by echoed coordinate.
    for (const c of batch) out.set(c, null)
    for (const r of res) {
      const coord = r.object?.coordinate
      if (!out.has(coord)) throw new Error(`${pid}: unexpected coordinate in response: ${coord}`)
      const pt = r.status === 'SUCCESS' ? r.object.vectorDataPoint?.[0] : null
      out.set(coord, pt && pt.value != null ? Number(pt.value) : null)
    }
    process.stdout.write(`  ${pid}: ${Math.min(i + BATCH_SIZE, coords.length)}/${coords.length}\r`)
  }
  process.stdout.write('\n')
  return out
}

// ---------------------------------------------------------------------------
// Pipeline
// ---------------------------------------------------------------------------

const CIP_4DIGIT = /^(\d{2}\.\d{2})\s+(.+)$/

function eligibleFields(cube) {
  return cube.byKey.cip.members
    .map((m) => {
      const match = m.memberNameEn.trim().match(CIP_4DIGIT)
      return match && { id: m.memberId, code: match[1], name: match[2] }
    })
    .filter(Boolean)
    .filter((f) => !(EXCLUDE_OTHER_CATCHALLS && f.code.endsWith('.99')))
}

async function rankFields(labour, fields, degree) {
  const fixed = {
    geo: memberId(labour, 'geo', RANKING_SLICE.geo),
    lfs: memberId(labour, 'lfs', RANKING_SLICE.labourForceStatus),
    age: memberId(labour, 'age', RANKING_SLICE.age),
    gender: memberId(labour, 'gender', RANKING_SLICE.gender),
    degree: memberId(labour, 'degree', degree),
  }
  const coords = fields.map((f) => coordinate(labour, { ...fixed, cip: f.id }))
  const values = await fetchValues(labour.pid, coords)
  const excluded = EXCLUDED_FIELDS[degree] || {}

  return fields
    .map((f, i) => ({ ...f, population: values.get(coords[i]) }))
    .filter((f) => f.population != null && !(f.code in excluded))
    .sort((a, b) => b.population - a.population)
    .slice(0, TOP_N)
}

async function main() {
  console.log('Loading table metadata…')
  const labour = await loadCube(TABLES.labour.pid)
  const income = await loadCube(TABLES.income.pid)

  const fields = eligibleFields(labour)
  console.log(`${fields.length} eligible 4-digit CIP fields`)

  // Requests for every (degree, field, geo, age, gender) cell
  const cells = []
  const top = {}
  for (const degree of DEGREE_OPTIONS) {
    console.log(`Ranking ${degree} fields…`)
    top[degree] = await rankFields(labour, fields, degree)
    top[degree].forEach((f, rank) => {
      for (const geo of GEO_OPTIONS)
        for (const age of AGE_OPTIONS)
          for (const gender of GENDER_OPTIONS) cells.push({ degree, field: f, rank: rank + 1, geo, age, gender })
    })
  }

  // Income table has its own member ids for CIP codes; map by code.
  const incomeCip = new Map(eligibleFields(income).map((f) => [f.code, f.id]))

  const lab = (c, lfsName) =>
    coordinate(labour, {
      geo: memberId(labour, 'geo', c.geo),
      lfs: memberId(labour, 'lfs', lfsName),
      age: memberId(labour, 'age', c.age),
      degree: memberId(labour, 'degree', c.degree),
      cip: c.field.id,
      gender: memberId(labour, 'gender', c.gender),
    })
  const inc = (c, statName) => {
    const cipId = incomeCip.get(c.field.code)
    if (cipId == null) throw new Error(`CIP ${c.field.code} missing from ${TABLES.income.id}`)
    return coordinate(income, {
      geo: memberId(income, 'geo', c.geo),
      gender: memberId(income, 'gender', c.gender),
      age: memberId(income, 'age', c.age),
      degree: memberId(income, 'degree', c.degree),
      work: memberId(income, 'work', INCOME_SLICE.workActivity),
      year: memberId(income, 'year', INCOME_SLICE.incomeYear),
      cip: cipId,
      incStat: memberId(income, 'incStat', statName),
    })
  }

  for (const c of cells) {
    c.k = {
      emp: lab(c, 'Employment rate'),
      unemp: lab(c, 'Unemployment rate'),
      median: inc(c, 'Median employment income ($)'),
      average: inc(c, 'Average employment income ($)'),
    }
  }

  console.log(`Fetching ${cells.length} cells × 4 measures…`)
  const labVals = await fetchValues(labour.pid, cells.flatMap((c) => [c.k.emp, c.k.unemp]))
  const incVals = await fetchValues(income.pid, cells.flatMap((c) => [c.k.median, c.k.average]))

  const header = [
    'Year', 'Geo', 'Age', 'Gender', 'Major_Field_code', 'Major_Field_description',
    'Highest_Degree', 'Popularity_Rank', 'Ranking_Population',
    'Employment_Rate', 'Unemployment_Rate', 'Median_Income', 'Average_Income',
  ]
  const esc = (v) => {
    if (v == null) return ''
    const s = String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  let missing = 0
  const lines = cells.map((c) => {
    const vals = [labVals.get(c.k.emp), labVals.get(c.k.unemp), incVals.get(c.k.median), incVals.get(c.k.average)]
    missing += vals.filter((v) => v == null).length
    return [
      CENSUS_YEAR, c.geo, c.age, c.gender, c.field.code, c.field.name,
      c.degree, c.rank, c.field.population, ...vals,
    ].map(esc).join(',')
  })

  await writeFile(OUT, [header.join(','), ...lines].join('\n') + '\n')
  console.log(`Wrote ${lines.length} rows to ${path.relative(process.cwd(), OUT)}`)
  if (missing) console.warn(`Warning: ${missing} suppressed/missing values left blank`)
  for (const degree of DEGREE_OPTIONS) {
    console.log(`\nTop ${TOP_N} — ${degree}:`)
    top[degree].forEach((f, i) =>
      console.log(`  ${String(i + 1).padStart(2)}. ${f.code} ${f.name} (${f.population.toLocaleString('en-CA')})`)
    )
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
