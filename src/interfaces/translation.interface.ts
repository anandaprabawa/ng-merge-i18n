export interface Translation {
  locale: string;
  fullPath: string;
}

export interface TranslationObject {
  source: Translation;
  targets: Translation[];
}
