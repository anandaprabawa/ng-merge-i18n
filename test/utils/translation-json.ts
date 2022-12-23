import { writeFileSync } from "fs";
import { join } from "path";
import { INITIAL_MESSAGES_JSON, RESULT_ROOT_DIR } from "../conf";
import { ExtractI18nFileContentMetadataParam } from "./extract-i18n-message";
import { FileResult } from "./file-result";

export class TranslationJson {
  /**
   * Add additional translations on the file.
   * @param path File path of the translation. Relative to the {@link RESULT_ROOT_DIR}.
   * @param additionalContent Translations content.
   */
  static addAdditionalTranslationsOnFile(path: string, additionalContent: Record<string, string>) {
    const content = JSON.parse(FileResult.readFile(path));
    content.translations = { ...content.translations, ...additionalContent };
    const newContent = JSON.stringify(content, null, 2);
    writeFileSync(join(RESULT_ROOT_DIR, path), newContent);
  }

  /**
   * Change or update translations on the file.
   * @param path File path of the translation. Relative to the {@link RESULT_ROOT_DIR}.
   * @param updatedContent Translations content. Only matching translation keys will be updated.
   */
  static changeTranslationsOnFile(path: string, updatedContent: Record<string, string>) {
    const content = JSON.parse(FileResult.readFile(path));
    for (const key in updatedContent) {
      if (Object.hasOwn(content.translations, key)) {
        content.translations[key] = updatedContent[key];
      }
    }
    const newContent = JSON.stringify(content, null, 2);
    writeFileSync(join(RESULT_ROOT_DIR, path), newContent);
  }

  static createExtractI18nFileContent(metadata: ExtractI18nFileContentMetadataParam): string {
    const content = {
      locale: metadata.sourceLocale || "en-US",
      translations: INITIAL_MESSAGES_JSON,
    };
    return JSON.stringify(content, null, 2);
  }
}
