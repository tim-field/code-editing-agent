import * as fs from "fs/promises";
import { z } from "zod/v4";
import { initTool } from "../init-tool.js";

export const fileRead = initTool({
  name: "file_read",
  description: "Reads the content of a file",
  schema: z.object({
    file_path: z.string().describe("The path to the file to read"),
  }),
  func: async (args) => {
    const filePath = args.file_path;
    try {
      const content = await fs.readFile(filePath, "utf-8");
      return content;
    } catch (error) {
      return `Error reading file: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  },
});
