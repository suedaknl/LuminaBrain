import { useAppSettings } from '../context/AppSettingsContext'

function controlButtonClass(active?: boolean) {
  return [
    'inline-flex h-10 min-w-10 items-center justify-center rounded-xl border backdrop-blur-xl transition',
    'border-slate-300/80 bg-white/70 text-slate-800 shadow-sm',
    'hover:border-indigo-400/50 hover:bg-white hover:shadow-[0_0_20px_rgba(99,102,241,0.15)]',
    'dark:border-white/15 dark:bg-white/5 dark:text-slate-100',
    'dark:hover:border-indigo-400/40 dark:hover:bg-indigo-500/10 dark:hover:shadow-[0_0_24px_rgba(99,102,241,0.25)]',
    active ? 'ring-2 ring-cyan-400/40 dark:ring-cyan-400/30' : '',
  ].join(' ')
}

export function TopBarControls() {
  const { locale, toggleLocale, theme, toggleTheme, ui } = useAppSettings()

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={toggleLocale}
        className={`${controlButtonClass()} px-3 text-xs font-bold tracking-wider`}
        aria-label={ui.languageSwitch}
        title={ui.languageSwitch}
      >
        {locale === 'tr' ? 'EN' : 'TR'}
      </button>
      <button
        type="button"
        onClick={toggleTheme}
        className={controlButtonClass()}
        aria-label={theme === 'dark' ? ui.themeLight : ui.themeDark}
        title={theme === 'dark' ? ui.themeLight : ui.themeDark}
      >
        {theme === 'dark' ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-5 w-5 text-amber-300"
            aria-hidden
          >
            <path d="M12 2.25a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.106a.75.75 0 00-1.06-1.06l-1.061 1.06a.75.75 0 101.06 1.061l1.06-1.06zM21.75 12a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.06-1.061a.75.75 0 10-1.061 1.06l1.06 1.061zM12 18a.75.75 0 01.75.75V20.25a.75.75 0 01-1.5 0V18.75A.75.75 0 0112 18zM7.166 17.834a.75.75 0 001.061 1.06l1.06-1.061a.75.75 0 10-1.06-1.06l-1.061 1.06zM6 12a.75.75 0 01-.75.75H3.75a.75.75 0 010-1.5h1.5A.75.75 0 016 12zM6.106 5.106a.75.75 0 001.06 0l1.06-1.06a.75.75 0 00-1.06-1.06l-1.06 1.06a.75.75 0 000 1.06z" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-5 w-5 text-indigo-600"
            aria-hidden
          >
            <path
              fillRule="evenodd"
              d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>
    </div>
  )
}
