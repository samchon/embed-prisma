import { TestValidator } from "@nestia/e2e";
import { EmbedPrisma, IEmbedPrismaResult } from "embed-prisma";
import typia from "typia";

import { TestGlobal } from "../TestGlobal";
import { FileSystemIterator } from "../utils/FileSystemIterator";

export const test_compiler_prisma_correct = async (): Promise<void> => {
  for (const project of ["bbs", "shopping"]) {
    const compiler: EmbedPrisma = new EmbedPrisma();
    const result: IEmbedPrismaResult = await compiler.compile(
      await TestGlobal.readExampleSchemas(project),
    );
    if (result.type !== "success") console.log(result);
    else {
      await FileSystemIterator.save({
        root: `${TestGlobal.ROOT}/results/${project}`,
        files: result.client,
      });
    }
    TestValidator.equals("result")(result.type)("success");
    typia.assertEquals(result.type);
  }
};
