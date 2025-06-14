import * as fs from "fs/promises";
import * as path from "path";
import { z } from "zod/v4";
import { initTool } from "../init-tool.js";

export const fileList = initTool({
  name: "file_list",
  description: "Lists files in a directory, optionally with a specific extension filter",
  schema: z.object({
    directory_path: z.string().describe("The path to the directory to list files from"),
    extension_filter: z.string().optional().describe("Optional file extension to filter by (e.g., '.js', '.ts')"),
    include_dirs: z.boolean().optional().default(false).describe("Whether to include directories in the results"),
  }),
  func: async (args) => {
    const dirPath = args.directory_path;
    const extensionFilter = args.extension_filter;
    const includeDirs = args.include_dirs ?? false;
    
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      let results = entries
        .filter(entry => {
          if (entry.isDirectory()) {
            return includeDirs;
          }
          
          if (extensionFilter) {
            return entry.name.endsWith(extensionFilter);
          }
          
          return true;
        })
        .map(entry => {
          const fullPath = path.join(dirPath, entry.name);
          return {
            name: entry.name,
            path: fullPath,
            type: entry.isDirectory() ? "directory" : "file",
          };
        });
      
      return JSON.stringify(results, null, 2);
    } catch (error) {
      return `Error listing files: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  },
});