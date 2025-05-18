/**
 * Represents the result of the EmbedPrisma compilation process.
 *
 * This is a discriminated union type that encapsulates all possible
 * outcomes of compiling Prisma schema files. Each variant contains specific
 * information relevant to its result type, enabling comprehensive error
 * handling and result processing in applications using this library.
 *
 * The type uses a discriminated union pattern with a 'type' field to enable
 * type narrowing in TypeScript, allowing for type-safe handling of each
 * outcome.
 *
 * @example
 * ```typescript
 * const result = await embedPrisma.compile(files);
 *
 * switch (result.type) {
 *   case 'success':
 *     // Access result.document, result.diagrams, etc.
 *     break;
 *   case 'failure':
 *     // Handle validation error with result.reason
 *     break;
 *   case 'exception':
 *     // Handle unexpected error with result.error
 *     break;
 * }
 * ```
 *
 * @author Jeongho Nam - https://github.com/samchon
 */
export type IEmbedPrismaResult =
  | IEmbedPrismaResult.ISuccess
  | IEmbedPrismaResult.IFailure
  | IEmbedPrismaResult.IException;
export namespace IEmbedPrismaResult {
  /**
   * Represents a successful compilation result containing all generated artifacts.
   *
   * This interface encapsulates everything produced by the Prisma compilation process,
   * including documentation, diagrams, schema files, and TypeScript definitions.
   * It's returned when the compilation process completes without any errors or exceptions.
   *
   * Clients can use these artifacts to:
   * - Display documentation to users
   * - Render entity relationship diagrams
   * - Initialize a type-safe Prisma client
   * - Incorporate the compiled schema into other systems
   *
   * @example
   * ```typescript
   * if (result.type === 'success') {
   *   // Display documentation
   *   renderMarkdown(result.document);
   *
   *   // Render diagrams
   *   for (const [name, diagram] of Object.entries(result.diagrams)) {
   *     renderMermaidDiagram(name, diagram);
   *   }
   *
   *   // Use TypeScript definitions
   *   for (const [path, content] of Object.entries(result.nodeModules)) {
   *     writeFile(path, content);
   *   }
   * }
   * ```
   */
  export interface ISuccess {
    /**
     * Discriminator field that identifies this as a successful result.
     *
     * This field enables TypeScript to narrow the type when checking
     * the 'type' property, allowing for type-safe access to the other fields.
     */
    type: "success";

    /**
     * Comprehensive Markdown documentation of the Prisma schema.
     *
     * This string contains a complete description of all models, enums,
     * fields, and relationships defined in the schema, formatted as Markdown.
     * The documentation is structured with headings, lists, tables, and code
     * blocks to provide a clear and navigable overview of the data model.
     *
     * This documentation can be rendered directly in Markdown viewers,
     * incorporated into existing documentation systems, or presented to users
     * in development tools.
     */
    document: string;

    /**
     * Entity Relationship Diagrams in mermaid format, organized by category.
     *
     * This is a mapping where:
     * - Keys are category/chapter names (typically model groups or namespaces)
     * - Values are mermaid.js diagram code strings
     *
     * Each diagram visually represents the relationships between a set of related
     * models in the schema, showing fields, types, and connections using the
     * mermaid.js syntax, which can be rendered by compatible viewers.
     *
     * These diagrams provide a visual understanding of the data structure and
     * are particularly useful for complex schemas with many relationships.
     */
    diagrams: Record<string, string>;

    /**
     * Formatted and validated Prisma schema files.
     *
     * This is a mapping where:
     * - Keys are file names (e.g., 'schema.prisma', 'models.prisma')
     * - Values are the processed schema content as strings
     *
     * These schema files have been validated, formatted, and processed
     * by the Prisma engine, ensuring they conform to the Prisma schema
     * specification and can be used for further operations.
     *
     * The formatted schemas may differ from the input files due to
     * consistent formatting, normalization, or preprocessing applied
     * during the compilation process.
     */
    schemas: Record<string, string>;

    /**
     * TypeScript definition files for the Prisma Client.
     *
     * This is a mapping where:
     * - Keys are file paths relative to a node_modules directory
     *   (e.g., 'node_modules/.prisma/client/index.d.ts')
     * - Values are the TypeScript definition file contents as strings
     *
     * These files provide complete type definitions for the Prisma Client
     * based on the compiled schema, enabling type-safe database access
     * in TypeScript applications. They include interface definitions for
     * all models, enums, queries, and mutations that can be performed.
     *
     * Applications can write these files to a node_modules directory
     * to provide IDE autocompletion and type checking when using the
     * Prisma Client, even in environments where the schema hasn't been
     * deployed to a database.
     */
    nodeModules: Record<string, string>;
  }

  /**
   * Represents a failure during compilation due to schema validation issues.
   *
   * This result is returned when the Prisma schema contains errors that prevent
   * successful compilation, such as:
   * - Syntax errors in the schema
   * - Invalid model definitions
   * - Unsupported data types or attributes
   * - Conflicting or inconsistent relationships
   * - Missing required configurations
   *
   * Unlike IException which represents unexpected errors, this represents
   * expected validation failures that users can correct by modifying their schema.
   *
   * @example
   * ```typescript
   * if (result.type === 'failure') {
   *   console.error('Schema validation failed:');
   *   console.error(result.reason);
   *
   *   // Display error to user
   *   showValidationError(result.reason);
   * }
   * ```
   */
  export interface IFailure {
    /**
     * Discriminator field that identifies this as a validation failure result.
     *
     * This field enables TypeScript to narrow the type when checking
     * the 'type' property, allowing for type-safe access to the reason field.
     */
    type: "failure";

    /**
     * Detailed explanation of why the compilation failed.
     *
     * This string contains human-readable error messages from the Prisma
     * schema validator, typically including:
     * - Specific error descriptions
     * - File names and line numbers where errors occurred
     * - Suggestions for how to fix the issues
     * - References to Prisma documentation when relevant
     *
     * Applications should display this information to users to help them
     * understand and correct the problems in their schema files.
     *
     * The format and detail level of this message comes directly from
     * Prisma's internal validation system and may vary based on the
     * specific errors encountered.
     */
    reason: string;
  }

  /**
   * Represents an unexpected exception that occurred during the compilation process.
   *
   * This result is returned when there's a runtime error not directly related to
   * schema validation, such as:
   * - File system errors (permission denied, disk full)
   * - Memory allocation failures
   * - Network errors when fetching dependencies
   * - Bugs in the underlying Prisma libraries
   * - Unexpected data formats or configurations
   *
   * Unlike IFailure which represents expected validation errors,
   * this represents unusual conditions that might require investigation
   * by developers or administrators.
   *
   * @example
   * ```typescript
   * if (result.type === 'exception') {
   *   console.error('Unexpected error during compilation:');
   *   console.error(result.error);
   *
   *   // Log error for debugging
   *   logger.error('Prisma compilation exception', { error: result.error });
   *
   *   // Show generic error to user
   *   showErrorMessage('An unexpected error occurred during compilation.');
   * }
   * ```
   */
  export interface IException {
    /**
     * Discriminator field that identifies this as an exception result.
     *
     * This field enables TypeScript to narrow the type when checking
     * the 'type' property, allowing for type-safe access to the error field.
     */
    type: "exception";

    /**
     * The error object or information about the exception.
     *
     * This field contains the raw error that was caught during the compilation
     * process. It's typed as 'unknown' since exceptions can come from various
     * sources and have different structures:
     * - Standard Error objects with name, message, and stack properties
     * - Custom error types from Prisma internal libraries
     * - String error messages
     * - Other values thrown during execution
     *
     * When handling this field, applications should check the type and
     * structure of the error before attempting to access specific properties.
     *
     * For Error objects, the most useful properties are typically:
     * - name: The error class name
     * - message: Human-readable error description
     * - stack: Stack trace showing where the error occurred
     */
    error: unknown;
  }
}
