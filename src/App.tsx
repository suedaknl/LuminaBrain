import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { TopBarControls } from './components/TopBarControls'
import { useAppSettings } from './context/AppSettingsContext'
import { pickLocalized } from './i18n/types'
import StroopTest from './games/StroopTest'
import MemoryMatrix from './games/MemoryMatrix'
import WordMemory from './games/WordMemory'
import SpeedMatch from './games/SpeedMatch'
import DigitSpan from './games/DigitSpan'
import SchulteTable from './games/SchulteTable'
import DotTap from './games/DotTap'
import MergeGame from './games/MergeGame'
import BalloonPop from './games/BalloonPop'
import CiftleriBul from './games/CiftleriBul'
import WordBubbles from './games/WordBubbles'
import ThoughtTrain from './games/ThoughtTrain'
import FlockFocus from './games/FlockFocus'
import YildizAvi from './games/YildizAvi'
import RenkCemberi from './games/RenkCemberi'
import TohumAyirma from './games/TohumAyirma'
import ZihinVitesi from './games/ZihinVitesi'
import KarincaYardimi from './games/KarincaYardimi'
import DengeDenklemi from './games/DengeDenklemi'
import GizliYol from './games/GizliYol'
import HarfAvi from './games/HarfAvi'
import Sekme from './games/Sekme'
import KartalGozu from './games/KartalGozu'
import YagmurDamlalari from './games/YagmurDamlalari'
import PenguenTakibi from './games/PenguenTakibi'
import OrganikSira from './games/OrganikSira'
import RitmiYakala from './games/RitmiYakala'
import ServisHafizasi from './games/ServisHafizasi'
import BaglamDedektifi from './games/BaglamDedektifi'
import TahtaMucadelesi from './games/TahtaMucadelesi'
import PastayiBol from './games/PastayiBol'
import HizliEslestirme from './games/HizliEslestirme'
import {
  categoryLabels,
  categoryOrder,
  games,
  type CategoryId,
  type Game,
} from './data/gamesData'

const DAILY_SLOT_COUNT = 3

function pickRandomUniqueIds(exclude: Set<string>, count: number): string[] {
  const pool = games.filter((g) => !exclude.has(g.id))
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count).map((g) => g.id)
}

function pickInitialDailyIds(): string[] {
  return pickRandomUniqueIds(new Set(), DAILY_SLOT_COUNT)
}

const categoryStyles: Record<
  CategoryId,
  { badge: string; glow: string; border: string; icon: string }
> = {
  memory: {
    badge:
      'bg-violet-500/15 text-violet-800 ring-violet-500/25 dark:bg-violet-400/10 dark:text-violet-200 dark:ring-violet-400/25',
    glow: 'from-violet-500/20 dark:from-violet-500/15',
    border: 'from-violet-400/50 via-slate-400/20 to-fuchsia-400/30 dark:from-violet-400/40 dark:via-white/10 dark:to-fuchsia-400/20',
    icon: '🧠',
  },
  attention: {
    badge:
      'bg-sky-500/15 text-sky-900 ring-sky-500/25 dark:bg-sky-400/10 dark:text-sky-200 dark:ring-sky-400/25',
    glow: 'from-sky-500/20 dark:from-sky-500/15',
    border: 'from-sky-400/50 via-slate-400/20 to-indigo-400/30 dark:from-sky-400/40 dark:via-white/10 dark:to-indigo-400/20',
    icon: '👁️',
  },
  speed: {
    badge:
      'bg-amber-500/15 text-amber-900 ring-amber-500/25 dark:bg-amber-400/10 dark:text-amber-100 dark:ring-amber-400/25',
    glow: 'from-amber-500/20 dark:from-amber-500/15',
    border: 'from-amber-400/50 via-slate-400/20 to-orange-400/30 dark:from-amber-400/40 dark:via-white/10 dark:to-orange-400/20',
    icon: '⚡',
  },
  problemSolving: {
    badge:
      'bg-emerald-500/15 text-emerald-900 ring-emerald-500/25 dark:bg-emerald-400/10 dark:text-emerald-100 dark:ring-emerald-400/25',
    glow: 'from-emerald-500/20 dark:from-emerald-500/15',
    border: 'from-emerald-400/50 via-slate-400/20 to-teal-400/30 dark:from-emerald-400/40 dark:via-white/10 dark:to-teal-400/20',
    icon: '🧩',
  },
  flexibility: {
    badge:
      'bg-fuchsia-500/15 text-fuchsia-900 ring-fuchsia-500/25 dark:bg-fuchsia-400/10 dark:text-fuchsia-100 dark:ring-fuchsia-400/25',
    glow: 'from-fuchsia-500/20 dark:from-fuchsia-500/15',
    border: 'from-fuchsia-400/50 via-slate-400/20 to-pink-400/30 dark:from-fuchsia-400/40 dark:via-white/10 dark:to-pink-400/20',
    icon: '🔄',
  },
  math: {
    badge:
      'bg-rose-500/15 text-rose-900 ring-rose-500/25 dark:bg-rose-400/10 dark:text-rose-100 dark:ring-rose-400/25',
    glow: 'from-rose-500/20 dark:from-rose-500/15',
    border: 'from-rose-400/50 via-slate-400/20 to-red-400/30 dark:from-rose-400/40 dark:via-white/10 dark:to-red-400/20',
    icon: '🔢',
  },
  language: {
    badge:
      'bg-cyan-500/15 text-cyan-900 ring-cyan-500/25 dark:bg-cyan-400/10 dark:text-cyan-100 dark:ring-cyan-400/25',
    glow: 'from-cyan-500/20 dark:from-cyan-500/15',
    border: 'from-cyan-400/50 via-slate-400/20 to-blue-400/30 dark:from-cyan-400/40 dark:via-white/10 dark:to-blue-400/20',
    icon: '📝',
  },
}

const glassPanelBorder =
  'from-indigo-400/40 via-slate-300/30 to-cyan-400/35 dark:from-indigo-400/30 dark:via-white/15 dark:to-cyan-400/25'

function GlassPanel({
  children,
  className = '',
  borderGradient = glassPanelBorder,
}: {
  children: ReactNode
  className?: string
  borderGradient?: string
}) {
  return (
    <div
      className={`rounded-[1.75rem] bg-gradient-to-br p-px shadow-lg shadow-slate-900/10 dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)] ${borderGradient} ${className}`}
    >
      <div className="rounded-[calc(1.75rem-1px)] bg-white/55 backdrop-blur-2xl backdrop-saturate-150 dark:bg-white/[0.04]">
        {children}
      </div>
    </div>
  )
}

function CategoryBadge({
  category,
  label,
}: {
  category: CategoryId
  label: string
}) {
  const style = categoryStyles[category]
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ring-1 ring-inset backdrop-blur-md ${style.badge}`}
    >
      <span aria-hidden>{style.icon}</span>
      {label}
    </span>
  )
}

function GameCard({
  game,
  compact,
  footer,
  locale,
  onClick,
}: {
  game: Game
  compact?: boolean
  footer?: ReactNode
  locale: 'tr' | 'en'
  onClick?: () => void
}) {
  const style = categoryStyles[game.category]
  const name = pickLocalized(locale, game.name)
  const description = pickLocalized(locale, game.description)
  const categoryLabel = pickLocalized(locale, categoryLabels[game.category])

  return (
    <div
      onClick={onClick}
      className={`group h-full rounded-2xl bg-gradient-to-br p-px transition duration-300 ${style.border} hover:shadow-[0_8px_30px_rgba(99,102,241,0.12)] dark:hover:shadow-[0_0_40px_rgba(255,255,255,0.06)] ${onClick ? 'cursor-pointer' : ''}`}
    >
      <article
        className={`relative flex h-full flex-col overflow-hidden rounded-[calc(1rem-1px)] bg-white/65 shadow-md shadow-slate-900/5 backdrop-blur-xl dark:bg-white/5 dark:shadow-lg dark:shadow-black/25 ${compact ? '' : 'min-h-[252px]'}`}
      >
        <div
          className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${style.glow} to-transparent`}
        />
        <div className="relative flex flex-1 flex-col p-4 sm:p-5">
          <div
            className={`flex gap-2 ${compact ? 'mb-2 flex-col items-start' : 'mb-3 flex-col sm:flex-row sm:items-start sm:justify-between'}`}
          >
            <h3
              className={`font-semibold leading-snug tracking-tight text-slate-900 dark:text-white ${compact ? 'text-base' : 'text-lg'}`}
            >
              {name}
            </h3>
            <CategoryBadge category={game.category} label={categoryLabel} />
          </div>
          <p
            className={`text-slate-600 dark:text-slate-300/85 ${compact ? 'line-clamp-2 text-sm leading-relaxed' : 'flex-1 text-[0.9375rem] leading-7'}`}
          >
            {description}
          </p>
          {footer ? <div className={compact ? 'mt-3' : 'mt-5'}>{footer}</div> : null}
        </div>
      </article>
    </div>
  )
}

function SwapButton({
  onClick,
  children,
  compact,
}: {
  onClick: (e: React.MouseEvent) => void
  children: ReactNode
  compact?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group/btn relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl border border-cyan-500/45 bg-cyan-500/15 text-cyan-900 shadow-[0_0_16px_rgba(34,211,238,0.15)] transition duration-300 hover:border-cyan-400 hover:bg-cyan-400/25 hover:shadow-[0_0_28px_rgba(34,211,238,0.35)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 active:scale-[0.98] dark:border-cyan-400/50 dark:bg-cyan-500/10 dark:text-cyan-50 dark:hover:text-white dark:hover:shadow-[0_0_32px_rgba(34,211,238,0.45)] ${compact ? 'px-3 py-2 text-xs font-bold' : 'px-5 py-3.5 text-sm font-bold tracking-wide'}`}
    >
      <span className="relative">{children}</span>
    </button>
  )
}

function PlayButton({ label, onClick }: { label: string; onClick?: (e: React.MouseEvent) => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group/btn relative w-full overflow-hidden rounded-xl border border-emerald-500/50 bg-gradient-to-r from-emerald-500/25 via-indigo-500/15 to-cyan-500/20 px-5 py-3 text-sm font-bold tracking-wide text-emerald-950 shadow-[0_0_16px_rgba(52,211,153,0.2)] transition duration-300 hover:border-emerald-400 hover:from-emerald-500/40 hover:to-cyan-500/30 hover:shadow-[0_0_32px_rgba(52,211,153,0.35)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 active:scale-[0.98] dark:border-emerald-400/55 dark:from-emerald-500/20 dark:text-emerald-50 dark:hover:text-white dark:hover:shadow-[0_0_36px_rgba(52,211,153,0.45),0_0_24px_rgba(99,102,241,0.25)]"
    >
      <span className="relative flex items-center justify-center gap-2">
        {label}
        <span
          aria-hidden
          className="text-indigo-600 transition group-hover/btn:translate-x-0.5 dark:text-indigo-300 dark:group-hover/btn:text-white"
        >
          →
        </span>
      </span>
    </button>
  )
}

function App() {
  const { locale, ui } = useAppSettings()
  const [activeGameId, setActiveGameId] = useState<string | null>(null)
  const [dailyIds, setDailyIds] = useState<string[]>(pickInitialDailyIds)
  const [activeCategory, setActiveCategory] = useState<CategoryId | 'all'>(
    'all',
  )

  const [searchQuery, setSearchQuery] = useState('')

  const gamesById = useMemo(
    () => new Map(games.map((g) => [g.id, g])),
    [],
  )

  const dailyGames = dailyIds
    .map((id) => gamesById.get(id))
    .filter((g): g is Game => g !== undefined)

  const swapDailyGame = useCallback((slotIndex: number) => {
    setDailyIds((prev) => {
      const used = new Set(prev)
      const currentId = prev[slotIndex]
      if (currentId) used.delete(currentId)
      const candidates = games.filter((g) => !used.has(g.id))
      if (candidates.length === 0) return prev
      const replacement =
        candidates[Math.floor(Math.random() * candidates.length)]
      const next = [...prev]
      next[slotIndex] = replacement.id
      return next
    })
  }, [])

  const refreshAllDaily = useCallback(() => {
    setDailyIds(pickInitialDailyIds())
  }, [])

  const filteredCatalog = games.filter((g) => {
    const matchesCategory = activeCategory === 'all' || g.category === activeCategory
    const searchLower = searchQuery.toLowerCase()
    const name = pickLocalized(locale, g.name).toLowerCase()
    const desc = pickLocalized(locale, g.description).toLowerCase()
    const matchesSearch = name.includes(searchLower) || desc.includes(searchLower)
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-slate-100 dark:bg-slate-900" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.18),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.35),transparent)]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_60%_40%_at_100%_50%,rgba(34,211,238,0.08),transparent)] dark:bg-[radial-gradient(ellipse_60%_40%_at_100%_50%,rgba(34,211,238,0.12),transparent)]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_50%_30%_at_0%_80%,rgba(16,185,129,0.06),transparent)] dark:bg-[radial-gradient(ellipse_50%_30%_at_0%_80%,rgba(16,185,129,0.1),transparent)]" />

      <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-10 sm:px-8 sm:pt-12 lg:px-10">
        <header className="mb-10 flex flex-col gap-8 sm:gap-10">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-cyan-300/90">
              {ui.appBrand}
            </p>
            <TopBarControls />
          </div>
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              {ui.heroTitle}
            </h1>
            <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-400 sm:text-lg">
              {ui.heroSubtitle}
            </p>
          </div>
        </header>

        <GlassPanel
          className="mb-14"
          borderGradient="from-indigo-400/45 via-violet-400/25 to-cyan-400/35 dark:from-indigo-400/35 dark:via-violet-400/20 dark:to-cyan-400/30"
        >
          <section aria-labelledby="daily-heading" className="p-5 sm:p-7">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2
                  id="daily-heading"
                  className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl"
                >
                  {ui.dailyTitle}
                </h2>
                <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-600 dark:text-slate-400 sm:text-base">
                  {ui.dailySubtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={refreshAllDaily}
                className="shrink-0 rounded-xl border border-indigo-500/40 bg-indigo-500/15 px-5 py-2.5 text-sm font-bold text-indigo-900 shadow-[0_0_16px_rgba(99,102,241,0.2)] transition hover:border-indigo-400 hover:bg-indigo-500/25 hover:shadow-[0_0_28px_rgba(99,102,241,0.35)] active:scale-[0.98] dark:border-indigo-400/50 dark:bg-indigo-500/20 dark:text-indigo-50 dark:hover:shadow-[0_0_36px_rgba(99,102,241,0.5)]"
              >
                {ui.refreshDaily}
              </button>
            </div>

            <div className="grid items-start gap-4 md:grid-cols-3">
              {dailyGames.map((game, index) => (
                <GameCard
                  key={`${game.id}-${index}`}
                  game={game}
                  locale={locale}
                  compact
                  onClick={() => setActiveGameId(game.id)}
                  footer={
                    <SwapButton compact onClick={(e) => {
                      e.stopPropagation();
                      swapDailyGame(index);
                    }}>
                      <span aria-hidden>⇄</span>
                      {ui.swap}
                    </SwapButton>
                  }
                />
              ))}
            </div>
          </section>
        </GlassPanel>

        <section aria-labelledby="catalog-heading">
          <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2
                id="catalog-heading"
                className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white"
              >
                {ui.catalogTitle}
              </h2>
              <p className="mt-2 text-base text-slate-600 dark:text-slate-400">
                {filteredCatalog.length} {ui.gamesListed}
              </p>
            </div>
            
            <div className="flex flex-col gap-4">
              {/* Search Bar */}
              <div className="relative max-w-sm w-full lg:ml-auto">
                <input
                  type="text"
                  placeholder="Oyun Ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300/60 bg-white/50 px-4 py-2.5 pl-10 text-sm font-medium text-slate-900 shadow-sm backdrop-blur-md placeholder:text-slate-500 hover:border-cyan-500/40 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-slate-400"
                />
                <svg className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Category Filters */}
              <div className="flex flex-wrap gap-2.5 justify-end">
                <button
                  type="button"
                  onClick={() => setActiveCategory('all')}
                className={`rounded-full px-4 py-2 text-xs font-semibold tracking-wide backdrop-blur-md transition ${
                  activeCategory === 'all'
                    ? 'border border-slate-400/40 bg-white/80 text-slate-900 shadow-sm dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_0_20px_rgba(255,255,255,0.08)]'
                    : 'border border-slate-300/60 bg-white/50 text-slate-700 hover:border-cyan-500/40 hover:bg-white/80 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:border-cyan-400/30 dark:hover:bg-white/[0.08] dark:hover:text-white'
                }`}
              >
                {ui.allCategories}
              </button>
              {categoryOrder.map((cat) => {
                const active = activeCategory === cat
                const label = pickLocalized(locale, categoryLabels[cat])
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`rounded-full px-4 py-2 text-xs font-semibold tracking-wide backdrop-blur-md transition ${
                      active
                        ? 'border border-slate-400/40 bg-white/80 text-slate-900 shadow-sm dark:border-white/25 dark:bg-white/15 dark:text-white'
                        : 'border border-slate-300/60 bg-white/50 text-slate-700 hover:border-cyan-500/40 hover:bg-white/80 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:border-cyan-400/30 dark:hover:bg-white/[0.08] dark:hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
            </div>
          </div>

          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCatalog.map((game) => (
              <li key={game.id} className="h-full">
                <GameCard
                  game={game}
                  locale={locale}
                  onClick={() => setActiveGameId(game.id)}
                  footer={<PlayButton label={ui.play} onClick={(e) => {
                    e.stopPropagation();
                    setActiveGameId(game.id);
                  }} />}
                />
              </li>
            ))}
          </ul>
        </section>
      </div>

      {activeGameId === 'color-match' && <StroopTest onClose={() => setActiveGameId(null)} />}
      {activeGameId === 'memory-matrix' && <MemoryMatrix onClose={() => setActiveGameId(null)} />}
      {activeGameId === 'word-memory' && <WordMemory onClose={() => setActiveGameId(null)} />}
      {activeGameId === 'speed-match' && <SpeedMatch onClose={() => setActiveGameId(null)} />}
      {activeGameId === 'digit-span' && <DigitSpan onClose={() => setActiveGameId(null)} />}
      {activeGameId === 'schulte-table' && <SchulteTable onClose={() => setActiveGameId(null)} />}
      {activeGameId === 'dot-tap' && <DotTap onClose={() => setActiveGameId(null)} />}
      {activeGameId === 'merge-game' && <MergeGame onClose={() => setActiveGameId(null)} />}
      {activeGameId === 'balloon-pop' && <BalloonPop onClose={() => setActiveGameId(null)} />}
      {activeGameId === 'ciftleri-bul' && <CiftleriBul onClose={() => setActiveGameId(null)} />}
      {activeGameId === 'word-bubbles' && <WordBubbles onClose={() => setActiveGameId(null)} />}
      {activeGameId === 'thought-train' && <ThoughtTrain onClose={() => setActiveGameId(null)} />}
      {activeGameId === 'flock-focus' && <FlockFocus onClose={() => setActiveGameId(null)} />}
      {activeGameId === 'star-search' && <YildizAvi onClose={() => setActiveGameId(null)} />}
      {activeGameId === 'renk-cemberi' && <RenkCemberi onClose={() => setActiveGameId(null)} />}
      {activeGameId === 'splitting-seeds' && <TohumAyirma onClose={() => setActiveGameId(null)} />}
      {activeGameId === 'brain-shift' && <ZihinVitesi onClose={() => setActiveGameId(null)} />}
      {activeGameId === 'assist-ant' && <KarincaYardimi onClose={() => setActiveGameId(null)} />}
      {activeGameId === 'denge-denklemi' && <DengeDenklemi onClose={() => setActiveGameId(null)} />}
      {activeGameId === 'gizli-yol' && <GizliYol onClose={() => setActiveGameId(null)} />}
      {activeGameId === 'harf-avi' && <HarfAvi onClose={() => setActiveGameId(null)} />}
      {activeGameId === 'sekme' && <Sekme onClose={() => setActiveGameId(null)} />}
      {activeGameId === 'eagle-eye' && <KartalGozu onClose={() => setActiveGameId(null)} />}
      {activeGameId === 'raindrops' && <YagmurDamlalari onClose={() => setActiveGameId(null)} />}
      {activeGameId === 'penguin-pursuit' && <PenguenTakibi onClose={() => setActiveGameId(null)} />}
      {activeGameId === 'organic-order' && <OrganikSira onClose={() => setActiveGameId(null)} />}
      {activeGameId === 'feel-the-beat' && <RitmiYakala onClose={() => setActiveGameId(null)} />}
      {activeGameId === 'memory-serves' && <ServisHafizasi onClose={() => setActiveGameId(null)} />}
      {activeGameId === 'contextual' && <BaglamDedektifi onClose={() => setActiveGameId(null)} />}
      {activeGameId === 'chalkboard-challenge' && <TahtaMucadelesi onClose={() => setActiveGameId(null)} />}
      {activeGameId === 'halve-your-cake' && <PastayiBol onClose={() => setActiveGameId(null)} />}
      {activeGameId === 'hizli-eslestirme' && <HizliEslestirme onClose={() => setActiveGameId(null)} />}
    </div>
  )
}

export default App
