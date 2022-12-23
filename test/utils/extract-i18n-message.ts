import { TestingArchitectHost } from "@angular-devkit/architect/testing";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { ExtractI18nBuilderOptions } from "../../src/interfaces/extract-i18n-builder-options.interface";
import { RESULT_ROOT_DIR } from "../conf";

export interface ExtractI18nFileContentMetadataParam
  extends Omit<ExtractI18nBuilderOptions, "browserTarget"> {
  sourceLocale?: string;
}

export async function extractI18nMessage(
  architectHost: TestingArchitectHost,
  fileContentCb: (metadata: ExtractI18nFileContentMetadataParam) => string,
  options?: {
    /**
     * Default to `extract-i18n`
     */
    targetName?: string;
    sourceLocale?: string;
  }
) {
  const builderOptions = (await architectHost.getOptionsForTarget({
    project: "test",
    target: options?.targetName || "extract-i18n",
  })) as unknown as Omit<ExtractI18nBuilderOptions, "browserTarget">;

  const format = builderOptions.format || "xlf";
  const outputPath = builderOptions.outputPath || RESULT_ROOT_DIR;
  const outFile = builderOptions.outFile || getDefaultOutFile(format);

  if (!existsSync(outputPath)) {
    mkdirSync(outputPath, { recursive: true });
  }

  writeFileSync(
    join(outputPath, outFile),
    fileContentCb({ format, outputPath, outFile, sourceLocale: options?.sourceLocale }),
    { encoding: "utf8" }
  );
}

function getDefaultOutFile(format: string) {
  if (format) return `messages.${format}`;
  return "messages.xlf";
}
