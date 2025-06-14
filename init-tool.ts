import Anthropic from "@anthropic-ai/sdk";
import { ZodType } from "zod/v4";
import { Tool } from "./main.js";
import { z } from "zod/v4";

export function initTool<T extends ZodType>({
  name,
  description,
  schema,
  func,
}: {
  name: string;
  description: string;
  schema: T;
  func: (args: z.infer<T>) => Promise<string>;
}): Tool {
  return {
    name,
    description,
    func: async (args) => {
      const params = schema.parse(args);
      return func(params);
    },
    get input_schema() {
      return z.toJSONSchema(schema) as Anthropic.Tool.InputSchema;
    },
  };
}
