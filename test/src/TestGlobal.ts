import fs from "fs";
import path from "path";

export namespace TestGlobal {
  export const ROOT = path.resolve(`${__dirname}/..`);

  export async function readExampleSchemas(
    name: string,
  ): Promise<Record<string, string>> {
    const directory: string = path.join(ROOT, "examples", name);
    const record: Record<string, string> = {};
    for (const file of await fs.promises.readdir(directory)) {
      if (file.endsWith(".prisma") === false) continue;
      const location: string = path.join(directory, file);
      record[file] = await fs.promises.readFile(location, "utf8");
    }
    return record;
  }
}
