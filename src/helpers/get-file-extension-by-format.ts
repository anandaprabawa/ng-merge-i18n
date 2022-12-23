export function getFileExtensionByFormat(format?: string) {
  switch (format) {
    case "xmb":
      return "xmb";
    case "xlf":
    case "xlif":
    case "xliff":
    case "xlf2":
    case "xliff2":
      return "xlf";
    case "json":
    case "legacy-migrate":
      return "json";
    case "arb":
      return "arb";
    default:
      throw new Error(`Unsupported format "${format}"`);
  }
}
