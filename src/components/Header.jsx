import { TITLE } from '../lib/config'
import { TABLES } from '../lib/selection'

export default function Header() {
  return (
    <header className="bg-brock-navy text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-8 w-1 bg-brock-red rounded-full" />
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
            Brock University · Economics
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight max-w-4xl">
          {TITLE}
        </h1>
        <p className="mt-4 text-sm sm:text-base text-white/75 max-w-3xl leading-relaxed">
          Source: Statistics Canada, 2021 Census (Tables {TABLES.labour.id} and{' '}
          {TABLES.income.id}).
        </p>
      </div>
    </header>
  )
}
