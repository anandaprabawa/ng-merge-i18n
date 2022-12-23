export interface LocaleDescription {
  translation: string | string[];
  baseHref?: string;
}

interface SourceLocaleObject {
  code: string;
  baseHref?: string;
}

/**
 * I18n options of the project in `angular.json` file.
 */
export interface I18nOptions {
  sourceLocale?: string | SourceLocaleObject;
  locales: Record<string, string | string[] | LocaleDescription>;
}
