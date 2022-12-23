import { I18nOptions } from "./i18n-options.interface";

/**
 * Project metadata based on the `angular.json` file.
 */
export interface ProjectMetadata {
  projectType: string;
  schematics: Record<string, unknown>;
  root: string;
  sourceRoot: string;
  prefix: string;
  newProjectRoot: string;
  cli?: Record<string, unknown>;
  i18n: I18nOptions;
}
