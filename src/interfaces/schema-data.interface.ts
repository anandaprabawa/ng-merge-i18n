/**
 * Builder options based on the `schema.json`.
 */
export interface SchemaData {
  /**
   * The target name of the builder that extracted the translations.
   * Default to `extract-i18n`.
   */
  builderTarget: string;

  /**
   * Type of sort of the translation.
   *
   * - `push` (default): newly added translations will be on the bottom.
   * - `asc`: arrange all translations by ascending order.
   */
  sort: "push" | "asc";

  /**
   * Whether to remove unused translations.
   * Default to `false`.
   */
  removeUnusedTranslation: boolean;

  /**
   * Whether to remove the translation source file after merged.
   * Default to `false`.
   */
  removeSource: boolean;
}
