import { generateClient } from "@prisma/client-generator-js";
import { DMMF } from "@prisma/generator-helper";
import {
  ConfigMetaFormat,
  MultipleSchemas,
  formatSchema,
  getConfig,
  getDMMF,
  mergeSchemas,
} from "@prisma/internals";
import crypto from "crypto";
import fs from "fs";
import os from "os";
import path from "path";
import { IPrismaMarkdownChapter, PrismaMarkdown } from "prisma-markdown";

import { IEmbedPrismaResult } from "./IEmbedPrismaResult";
import { escapeColorCodes } from "./utils/escapeColorCodes";

/**
 * A class that exposes Prisma's compiler API for integration
 * into NodeJS applications.
 *
 * `EmbedPrisma` enables developers to programmatically compile Prisma schema
 * files without requiring a full Prisma CLI installation or execution. This
 * is particularly useful for:
 *
 * - Applications that need to validate or process Prisma schemas at runtime
 * - Tools that generate documentation or visualizations from Prisma schemas
 * - Development environments that need to provide immediate feedback on schema changes
 * - Systems that dynamically generate Prisma clients based on user-defined schemas
 *
 * The class handles all aspects of the compilation process including:
 *
 * - Setting up temporary environments for compilation
 * - Parsing and validating schema files
 * - Generating TypeScript definitions for the Prisma client
 * - Creating documentation and Entity Relationship Diagrams
 * - Error handling and cleanup
 *
 * @author Jeongho Nam = https://github.com/samchon
 */
export class EmbedPrisma {
  /**
   * Compiles Prisma schema files into various artifacts.
   *
   * This method takes a collection of Prisma schema files and processes
   * them through the Prisma compilation pipeline to generate:
   *
   * 1. Formatted and validated schema files
   * 2. TypeScript definition files for the Prisma client
   * 3. Comprehensive markdown documentation of the data model
   * 4. Entity Relationship Diagrams in mermaid format
   *
   * The method creates a temporary directory for compilation, processes
   * all files, and cleans up afterward regardless of success or failure.
   *
   * @param files - A record mapping file names to their content
   *                (e.g., {'schema.prisma': 'datasource db {...}'})
   * @returns Result of compilation
   * @throws This method does not throw exceptions directly; all errors are
   *         returned as part of the IEmbedPrismaResult union type.
   */
  public async compile(
    files: Record<string, string>,
  ): Promise<IEmbedPrismaResult> {
    // PREPARE DIRECTORIES
    const directory: string = await fs.promises.mkdtemp(
      `${os.tmpdir()}/embed-prisma-${crypto.randomUUID()}`,
    );
    await fs.promises.mkdir(`${directory}/schemas`, {
      recursive: true,
    });

    // DO COMPILE
    try {
      return await this.processCompile(directory, files);
    } catch (error) {
      return catchPrismaError(error);
    } finally {
      try {
        await fs.promises.rm(directory, { recursive: true });
      } catch {}
    }
  }

  private async processCompile(
    directory: string,
    files: Record<string, string>,
  ): Promise<IEmbedPrismaResult> {
    // PARSE SCHEMA FILES
    const schemas: MultipleSchemas = await formatSchema({
      schemas: Object.entries(files),
    });
    const merged: string = mergeSchemas({ schemas });
    const document: DMMF.Document = await getDMMF({ datamodel: schemas });
    const config: ConfigMetaFormat = await getConfig({
      datamodel: schemas,
      ignoreEnvVarErrors: true,
    });

    // STORE SCHEMA FILES
    await Promise.all(
      Object.entries(files).map(([key, value]) =>
        fs.promises.writeFile(`${directory}/schemas/${key}`, value, "utf-8"),
      ),
    );

    // GENERATE CLIENT
    await generateClient({
      // locations
      binaryPaths: {},
      schemaPath: `${directory}/schemas`,
      outputDir: `${directory}/output`,
      runtimeSourcePath: require
        .resolve("@prisma/client/runtime/library.js")
        .split(path.sep)
        .slice(0, -1)
        .join(path.sep),
      generator: {
        ...config.generators.find((g) => g.name === "client")!,
        isCustomOutput: true,
      },
      // models
      datamodel: merged,
      dmmf: document,
      datasources: config.datasources,
      activeProvider: config.datasources[0]!.activeProvider,
      // configurations
      testMode: true,
      copyRuntime: false,
      clientVersion: "local",
      engineVersion: "local",
    });
    const rawFiles: Record<string, string> = await readPrismaFiles(
      `${directory}/output`,
    );
    return {
      type: "success",
      schemas: Object.fromEntries(schemas),
      nodeModules: Object.fromEntries([
        ...Object.entries(rawFiles).filter(([key]) => key.endsWith(".d.ts")),
        [
          "node_modules/@prisma/client/index.d.ts",
          "export * from '.prisma/client/default'",
        ],
      ]),
      document: PrismaMarkdown.write(document.datamodel),
      diagrams: ((): Record<string, string> => {
        const chapters: IPrismaMarkdownChapter[] = PrismaMarkdown.categorize(
          document.datamodel,
        );
        return Object.fromEntries(
          chapters.map((ch) => [
            ch.name,
            PrismaMarkdown.writeDiagram(ch.diagrams),
          ]),
        );
      })(),
    };
  }
}

async function readPrismaFiles(root: string): Promise<Record<string, string>> {
  const output: Record<string, string> = {};
  async function iterate(location: string) {
    const directory: string[] = await fs.promises.readdir(location);
    for (const file of directory) {
      const next: string = `${location}/${file}`;
      const stat: fs.Stats = await fs.promises.stat(next);
      if (stat.isDirectory()) await iterate(next);
      else if (file.endsWith(".d.ts"))
        output[
          `node_modules/.prisma/client/${next.substring(root.length + 1)}`
        ] = await fs.promises.readFile(next, "utf-8");
    }
  }
  await iterate(root);
  return output;
}

function catchPrismaError(
  error: unknown,
): IEmbedPrismaResult.IFailure | IEmbedPrismaResult.IException {
  if (
    error instanceof Error &&
    (error.name === "GetDmmfError" || error.name === "MergeSchemasError")
  )
    return {
      type: "failure",
      reason: escapeColorCodes(error.message),
    };
  return {
    type: "exception",
    error:
      error instanceof Error
        ? {
            ...error,
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : error,
  };
}
