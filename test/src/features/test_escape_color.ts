import { utils } from "embed-prisma";
import fs from "fs";

import { TestGlobal } from "../TestGlobal";

export const test_escape_color = async (): Promise<void> => {
  const content: string = await fs.promises.readFile(
    `${TestGlobal.ROOT}/assets/color.txt`,
    "utf8",
  );
  await fs.promises.writeFile(
    `${TestGlobal.ROOT}/color.log`,
    utils.escapeColorCodes(content),
    "utf8",
  );
};
