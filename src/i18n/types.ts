export type Locale = 'tr' | 'en'

export type LocalizedString = Record<Locale, string>

export function pickLocalized(locale: Locale, value: LocalizedString): string {
  return value[locale]
}
