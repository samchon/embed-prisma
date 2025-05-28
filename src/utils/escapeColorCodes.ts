export function escapeColorCodes(str: string): string {
  return str.replace(/\x1b\[[0-9;]*m/g, "");
}

// export function cleanPrismaErrorMessage(str: string): string {
//   return str.replace(ANSI_REGEX, "");
// }

// const ANSI_REGEX = /\x1b\[[0-9;]*[a-zA-Z]|\x1b\([AB]|\x1b[=>]|\x1b[HfABCDJK]|\x1b\[[0-9]+[ABCD]|\x1b\[[0-9]+;[0-9]+[Hf]|\x1b\[[0-9]+[~@]|\x1b\[[0-9]+;[0-9]+m/g;
