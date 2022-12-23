import { BuilderContext, BuilderOutput, createBuilder } from "@angular-devkit/architect";
import { normalizeFormat } from "./helpers/normalize-format";
import { ExtractI18nBuilderService } from "./services/extract-i18n-builder.service";
import { I18nOptionService } from "./services/i18n-option.service";
import { JsonAdapter } from "./adapters/json.adapter";
import { MergeService } from "./services/merge.service";
import { AppBuilderContext } from "./interfaces/app-builder-context.interface";
import { SchemaData } from "./interfaces/schema-data.interface";

async function mergeI18n(options: SchemaData, context: BuilderContext): Promise<BuilderOutput> {
  context.logger.info("Merging translations...");

  try {
    // One time checking for the target
    // because this builder does not support running using `scheduleBuilder()`
    if (!context.target) throw new Error("The builder requires a target.");
    const appContext = context as AppBuilderContext;

    const extractI18nBuilderService = new ExtractI18nBuilderService(appContext, options);
    const i18nOptionService = new I18nOptionService(appContext, options);

    const hasBuilder = await extractI18nBuilderService.hasBuilder();
    if (!hasBuilder) {
      throw new Error("Builder target for extracting i18n does not found.");
    }

    const doesSupportFormat = await extractI18nBuilderService.doesSupportFormat();
    if (!doesSupportFormat) {
      throw new Error("Translation file format is not supported.");
    }

    const hasI18nOption = await i18nOptionService.hasOption();
    if (!hasI18nOption) {
      throw new Error('"i18n" project option does not provided in the "angular.json".');
    }

    const translationObject = await i18nOptionService.getTranslationObject();
    const mergeService = new MergeService(options, translationObject);

    const format = (await extractI18nBuilderService.getOptions()).format;
    const normalizedFormat = normalizeFormat(format);

    switch (normalizedFormat) {
      case "json":
        mergeService.useAdapter(JsonAdapter);
        break;
      default:
        throw new Error("No adapter found for merging translation.");
    }

    await mergeService.execute();
    context.logger.info("✔ Translations have been merged.");

    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export default createBuilder(mergeI18n);
