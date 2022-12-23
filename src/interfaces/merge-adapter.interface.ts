import { SchemaData } from "./schema-data.interface";
import { Translation } from "./translation.interface";

export interface TransformMetadata {
  /**
   * Whether targeted translation is a new file.
   */
  isNew: boolean;
  sort: SchemaData["sort"];
  removeUnusedTranslation: SchemaData["removeUnusedTranslation"];
  sourceTranslation: Translation;
  targetTranslation: Translation;
}

export interface MergeAdapter {
  /**
   * Transformer for merging translation.
   *
   * @param source Content of the translation source
   * @param target Content of the translation target. If target file has not been created (`metadata.isNew: true`), the value will be the same as the `source`.
   * @param metadata Additional information related to the translation and builder options.
   */
  transform(source: string, target: string, metadata: TransformMetadata): string;
}
