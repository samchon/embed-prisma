import { TestValidator } from "@nestia/e2e";
import { EmbedPrisma, IEmbedPrismaResult } from "embed-prisma-compiler";
import typia from "typia";

import { TestGlobal } from "../TestGlobal";

export const test_compiler_prisma_correct = async (): Promise<void> => {
  for (const project of ["bbs", "shopping"]) {
    const compiler: EmbedPrisma = new EmbedPrisma();
    const result: IEmbedPrismaResult = await compiler.compile(
      await TestGlobal.readExampleSchemas(project),
    );
    TestValidator.equals("result")(result.type)("success");
    typia.assertEquals(result.type);
  }
};
