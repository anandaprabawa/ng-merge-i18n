import { Target } from "@angular-devkit/architect";
import { join } from "path";
import { DEFAULT_EXTRACTED_FORMAT, SUPPORTED_FORMATS } from "../config";
import { getFileExtensionByFormat } from "../helpers/get-file-extension-by-format";
import { AppBuilderContext } from "../interfaces/app-builder-context.interface";
import { ExtractI18nBuilderOptions } from "../interfaces/extract-i18n-builder-options.interface";
import { SchemaData } from "../interfaces/schema-data.interface";

export class ExtractI18nBuilderService {
  private readonly defaultOutFileName = "messages";
  private readonly target: Target;

  constructor(private context: AppBuilderContext, schemaData: SchemaData) {
    this.target = this.createTarget(schemaData.builderTarget);
  }

  async hasBuilder() {
    const res = await this.context.getBuilderNameForTarget(this.target).catch(() => false);
    return !!res;
  }

  async getOptions(): Promise<ExtractI18nBuilderOptions> {
    const builderOptions = await this.context.getTargetOptions(this.target);
    return {
      browserTarget: builderOptions.browserTarget as string,
      format: builderOptions.format as string,
      outFile: builderOptions.outFile as string,
      outputPath: builderOptions.outputPath as string,
    };
  }

  async doesSupportFormat() {
    const options = await this.getOptions();
    const format = options.format || DEFAULT_EXTRACTED_FORMAT;
    return SUPPORTED_FORMATS.includes(format);
  }

  async getSourceTranslationPath() {
    const options = await this.getOptions();
    const extension = getFileExtensionByFormat(options.format);

    let outputPath: string = this.context.workspaceRoot;
    let outputFile = `${this.defaultOutFileName}.${extension}`;

    if (options.outputPath) {
      outputPath = join(this.context.workspaceRoot, options.outputPath);
    }

    if (options.outFile) {
      outputFile = options.outFile;
    }

    return join(outputPath, outputFile);
  }

  private createTarget(targetName: string): Target {
    return {
      project: this.context.target.project,
      target: targetName,
    };
  }
}
