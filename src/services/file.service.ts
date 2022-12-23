import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import { dirname } from "path";

export class FileService {
  static readFile(path: string): string | undefined {
    if (!existsSync(path)) return undefined;
    return readFileSync(path, { encoding: "utf8" });
  }

  static writeFile(path: string, data: Parameters<typeof writeFileSync>[1]): void {
    writeFileSync(path, data, { encoding: "utf8" });
  }

  static removeFile(path: string): void {
    rmSync(path, { maxRetries: 3, retryDelay: 1000 });
  }

  static mkdirOptional(path: string) {
    const dir = dirname(path);
    if (existsSync(dir)) return;
    mkdirSync(dir, { recursive: true });
  }
}
