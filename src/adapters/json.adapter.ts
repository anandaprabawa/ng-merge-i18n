import { MergeAdapter, TransformMetadata } from "../interfaces/merge-adapter.interface";

export class JsonAdapter implements MergeAdapter {
  transform(source: string, target: string, metadata: TransformMetadata): string {
    const sourceJson = JSON.parse(source);
    const targetJson = JSON.parse(target);

    // Change `locale` field value to match the target locale.
    targetJson.locale = metadata.targetTranslation.locale;

    if (!metadata.isNew) {
      for (const key in sourceJson.translations) {
        // Adding translation to the target if it does not exist.
        if (!Object.hasOwn(targetJson.translations, key)) {
          targetJson.translations[key] = sourceJson.translations[key];
        }
      }

      if (metadata.removeUnusedTranslation) {
        targetJson.translations = this.removeUnusedTranslation(
          targetJson.translations,
          sourceJson.translations
        );
      }
    }

    // Sorting translation by ascending. Default sort is `push`.
    if (metadata.sort === "asc") {
      targetJson.translations = this.sorting(targetJson.translations);
    }

    return JSON.stringify(targetJson, null, 2);
  }

  private sorting(translation: Record<string, string>): Record<string, string> {
    return Object.keys(translation)
      .map((key) => ({ key, value: translation[key] }))
      .sort((a, b) => a.key.localeCompare(b.key))
      .reduce((prev, item) => ({ ...prev, [item.key]: item.value }), {});
  }

  private removeUnusedTranslation(
    translation: Record<string, string>,
    sourceTranslation: Record<string, string>
  ): Record<string, string> {
    return Object.keys(translation)
      .filter((key) => sourceTranslation[key])
      .map((key) => ({ key, value: translation[key] }))
      .reduce((prev, item) => ({ ...prev, [item.key]: item.value }), {});
  }
}
