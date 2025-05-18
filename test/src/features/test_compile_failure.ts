import { TestValidator } from "@nestia/e2e";
import { EmbedPrisma, IEmbedPrismaResult } from "embed-prisma-compiler";
import typia from "typia";

import { TestGlobal } from "../TestGlobal";

export const test_compiler_prisma_failure = async (): Promise<void> => {
  for (const project of ["bbs", "shopping"]) {
    const compiler: EmbedPrisma = new EmbedPrisma();
    const result: IEmbedPrismaResult = await compiler.compile({
      ...(await TestGlobal.readExampleSchemas(project)),
      "invalid.prisma": "invalid schema file",
    });
    TestValidator.equals("result")(result.type)("failure");
    typia.assertEquals(result.type);
  }
};
