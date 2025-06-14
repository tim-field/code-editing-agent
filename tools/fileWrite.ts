import * as fs from "fs/promises";
import { z } from "zod/v4";
import { initTool } from "../init-tool.js";

export const fileWrite = initTool({
  name: "file_write",
  description: "Writes content to a file",
  schema: z.object({
    file_path: z.string().describe("The path to the file to write"),
    content: z.string().describe("The content to write to the file"),
    create_dirs: z.boolean().optional().default(false).describe("Whether to create parent directories if they don't exist"),
  }),
  func: async (args) => {
    const { file_path, content, create_dirs } = args;
    try {
      if (create_dirs) {
        // Get the directory path
        const dirPath = file_path.substring(0, file_path.lastIndexOf('/'));
        if (dirPath) {
          // Create directory if it doesn't exist
          await fs.mkdir(dirPath, { recursive: true });
        }
      }
      
      await fs.writeFile(file_path, content, "utf-8");
      return `Successfully wrote to file: ${file_path}`;
    } catch (error) {
      return `Error writing to file: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  },
});