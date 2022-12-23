import { existsSync, readFileSync, rmSync } from "fs";
import { join } from "path";
import { RESULT_ROOT_DIR } from "../conf";

export class FileResult {
  /**
   * Whether directory or file is exist.
   * @param path File or directory path. Relative to {@link RESULT_ROOT_DIR}.
   */
  static isExist(path: string) {
    return existsSync(join(RESULT_ROOT_DIR, path));
  }

  /**
   * Read file on the `__result__` directory.
   * @param path File path. Relative to {@link RESULT_ROOT_DIR}.
   * @returns File content.
   */
  static readFile(path: string) {
    return readFileSync(join(RESULT_ROOT_DIR, path), { encoding: "utf8" });
  }

  static removeResultDir() {
    if (existsSync(RESULT_ROOT_DIR)) {
      rmSync(RESULT_ROOT_DIR, { recursive: true, force: true });
    }
  }
}
