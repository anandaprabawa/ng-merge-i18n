import { join } from "path";
import { DEFAULT_SOURCE_LOCALE } from "../config";
import { AppBuilderContext } from "../interfaces/app-builder-context.interface";
import { LocaleDescription } from "../interfaces/i18n-options.interface";
import { SchemaData } from "../interfaces/schema-data.interface";
import { Translation, TranslationObject } from "../interfaces/translation.interface";
import { ExtractI18nBuilderService } from "./extract-i18n-builder.service";
import { ProjectService } from "./project.service";

export class I18nOptionService {
  private readonly projectService: ProjectService;
  private readonly extractI18nBuilderService: ExtractI18nBuilderService;

  constructor(private context: AppBuilderContext, private schemaData: SchemaData) {
    this.projectService = new ProjectService(this.context);
    this.extractI18nBuilderService = new ExtractI18nBuilderService(this.context, this.schemaData);
  }

  async hasOption() {
    const metadata = await this.projectService.getActiveProjectMetadata();
    return !!metadata.i18n;
  }

  async getTranslationObject(): Promise<TranslationObject> {
    const [sourcePath, targets, sourceLocale] = await Promise.all([
      this.extractI18nBuilderService.getSourceTranslationPath(),
      this.getTranslationLocaleItems(),
      this.getSourceLocale(),
    ]);

    const source: Translation = {
      locale: sourceLocale,
      fullPath: sourcePath,
    };

    return { source, targets };
  }

  private async getSourceLocale() {
    const metadata = await this.projectService.getActiveProjectMetadata();
    if (!metadata.i18n.sourceLocale) return DEFAULT_SOURCE_LOCALE;
    if (typeof metadata.i18n.sourceLocale === "string") {
      return metadata.i18n.sourceLocale;
    }
    return metadata.i18n.sourceLocale.code;
  }

  /**
   * @returns normalized locales option of i18n angular.json
   */
  private async getTranslationLocaleItems(): Promise<Translation[]> {
    const metadata = await this.projectService.getActiveProjectMetadata();

    const localeItems = Object.keys(metadata.i18n.locales)
      .map((key) => ({
        locale: key,
        paths: this.normalizeLocale(metadata.i18n.locales[key]),
      }))
      .reduce((prev, item) => {
        const items = item.paths.map((path) => ({
          locale: item.locale,
          path,
        }));
        return [...prev, ...items];
      }, [] as { locale: string; path: string }[]);

    return localeItems.map((item) => {
      const fullPath = join(this.context.workspaceRoot, item.path);
      return { fullPath, locale: item.locale };
    });
  }

  private normalizeLocale(locale: string | string[] | LocaleDescription) {
    if (Array.isArray(locale) || typeof locale === "string") {
      return this.normalizeTranslationPath(locale);
    }
    return this.normalizeTranslationPath(locale.translation);
  }

  private normalizeTranslationPath(path: string | string[]) {
    if (Array.isArray(path)) return path;
    return [path];
  }
}
