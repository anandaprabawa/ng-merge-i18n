import { BuilderOutput, createBuilder } from "@angular-devkit/architect";
import { TestingArchitectHost } from "@angular-devkit/architect/testing";
import { ExtractI18nBuilderOptions } from "../../src/interfaces/extract-i18n-builder-options.interface";

export async function mockExtractI18n(
  architectHost: TestingArchitectHost,
  options?: {
    /**
     * Default to `{success: true}`
     */
    builderOutput?: BuilderOutput;
    /**
     * Default to `extract-i18n`.
     */
    targetName?: string;
    builderOptions?: Omit<ExtractI18nBuilderOptions, "browserTarget">;
  }
) {
  const builder = jasmine
    .createSpy("extractI18nBuilder")
    .and.callFake(() => options?.builderOutput || { success: true });

  architectHost.addBuilder("@angular-devkit/build-angular:extract-i18n", createBuilder(builder));

  architectHost.addTarget(
    { project: "test", target: options?.targetName || "extract-i18n" },
    "@angular-devkit/build-angular:extract-i18n",
    options?.builderOptions
  );
}
