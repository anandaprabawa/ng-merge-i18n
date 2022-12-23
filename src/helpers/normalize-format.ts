import { DEFAULT_EXTRACTED_FORMAT } from "../config";

export function normalizeFormat(format?: string) {
  let normalizedFormat = format;

  switch (format) {
    case "xlf":
    case "xlif":
    case "xliff":
      normalizedFormat = "xlf";
      break;
    case "xlf2":
    case "xliff2":
      normalizedFormat = "xlf2";
      break;
  }

  return normalizedFormat ?? DEFAULT_EXTRACTED_FORMAT;
}
