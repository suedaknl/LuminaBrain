import type { Locale } from './types'

const ui = {
  tr: {
    appBrand: 'LuminaBrain',
    heroTitle: 'LuminaBrain ile Günlük Antrenman',
    heroSubtitle:
      'Hafıza, dikkat ve hız becerilerini geliştiren 30 mini oyun — hepsi tek katalogda.',
    signIn: 'Oturum aç',
    dailyTitle: 'Günün Antrenmanı',
    dailySubtitle:
      'Bugün için önerilen 3 oyun. Beğenmediğiniz olursa tek tıkla değiştirin.',
    refreshDaily: 'Üçünü yenile',
    swap: 'Başka Oyunla Değiştir (Swap)',
    catalogTitle: 'Oyun Kataloğu',
    gamesListed: 'oyun listeleniyor',
    play: 'Oyna',
    allCategories: 'Tümü',
    themeLight: 'Açık tema',
    themeDark: 'Koyu tema',
    languageSwitch: 'Dili değiştir',
  },
  en: {
    appBrand: 'LuminaBrain',
    heroTitle: 'Daily training with LuminaBrain',
    heroSubtitle:
      '30 mini games to sharpen memory, attention, and speed — all in one catalog.',
    signIn: 'Sign in',
    dailyTitle: "Today's Workout",
    dailySubtitle:
      'Three recommended games for today. Swap any you do not want with one click.',
    refreshDaily: 'Refresh all three',
    swap: 'Swap for another game',
    catalogTitle: 'Game catalog',
    gamesListed: 'games listed',
    play: 'Play',
    allCategories: 'All',
    themeLight: 'Light theme',
    themeDark: 'Dark theme',
    languageSwitch: 'Change language',
  },
} as const

export type UiStrings = (typeof ui)[Locale]

export function getUiStrings(locale: Locale): UiStrings {
  return ui[locale]
}
