import {
  GEO_OPTIONS,
  AGE_OPTIONS,
  GENDER_OPTIONS,
  DEGREE_OPTIONS,
  AGE_LABELS,
  GENDER_LABELS,
  DEGREE_LABELS,
} from '../lib/config'

export default function FilterBar({ filters, onChange }) {
  const update = (key) => (e) =>
    onChange({ ...filters, [key]: e.target.value })

  return (
    <section className="mt-8">
      <div className="card p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Field label="Region">
            <select
              className="select"
              value={filters.geo}
              onChange={update('geo')}
            >
              {GEO_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Age">
            <select
              className="select"
              value={filters.age}
              onChange={update('age')}
            >
              {AGE_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {AGE_LABELS[o]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Gender">
            <select
              className="select"
              value={filters.gender}
              onChange={update('gender')}
            >
              {GENDER_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {GENDER_LABELS[o]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Degree level">
            <select
              className="select"
              value={filters.degree}
              onChange={update('degree')}
            >
              {DEGREE_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {DEGREE_LABELS[o]}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </div>
    </section>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="section-title mb-1.5 block">{label}</span>
      {children}
    </label>
  )
}
