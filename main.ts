import * as readline from "readline";
import Anthropic from "@anthropic-ai/sdk";
import { tools } from "./tools/index.js";

type Agent = {
  run(context: any): Promise<void>;
};

export type Tool = Anthropic.Tool & {
  func?: (args: unknown) => Promise<string>;
};

function createAgent(
  client: Anthropic,
  getUserMessage: () => Promise<string | null>,
  tools?: Tool[]
): Agent {
  const runInference = async (
    conversation: Anthropic.MessageParam[]
  ): Promise<Anthropic.Message> => {
    const message = await client.messages.create({
      model: "claude-3-7-sonnet-latest",
      max_tokens: 1024,
      messages: conversation,
      tools: tools?.map(({ func, ...tool }) => tool),
      // system: ctx maybe ?
    });
    return message;
  };

  const executeTool = async (
    toolName: string,
    args: unknown
  ): Promise<string> => {
    const tool = tools?.find((t) => t.name === toolName);
    if (!tool || !tool.func) {
      throw new Error(`Tool ${toolName} not found or not executable.`);
    }
    try {
      const result = await tool.func(args);
      return result;
    } catch (error) {
      throw new Error(
        `Error executing tool ${toolName}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };

  const agent: Agent = {
    async run(context: any): Promise<void> {
      const conversation: Anthropic.MessageParam[] = [];

      console.log("Chat with Claude (use 'ctrl-c' to quit)");
      let readUserInput = true;

      while (true) {
        if (readUserInput) {
          process.stdout.write("\u001b[94mYou\u001b[0m: ");
          const userInput = await getUserMessage();
          if (!userInput) {
            break;
          }

          const userMessage: Anthropic.MessageParam = {
            role: "user",
            content: [{ type: "text", text: userInput }],
          };
          conversation.push(userMessage);
        }

        const message = await runInference(conversation);
        conversation.push({
          role: "assistant",
          content: message.content,
        });

        let toolResults: Anthropic.ToolResultBlockParam[] = [];
        for (const content of message.content) {
          switch (content.type) {
            case "text": {
              console.log(`\u001b[93mClaude\u001b[0m: ${content.text}`);
              break;
            }
            case "tool_use": {
              console.log(
                `\u001b[93mClaude\u001b[0m is using tool: ${content.name}`
              );

              const result = await executeTool(content.name, content.input);
              // console.log(`\u001b[93mClaude\u001b[0m: Tool result: ${result}`);

              toolResults.push({
                type: "tool_result",
                tool_use_id: content.id,
                content: result,
              });

              break;
            }
          }
        }

        if (!toolResults.length) {
          readUserInput = true; // Read user input for next iteration
          continue;
        }

        readUserInput = false; // Don't read user input until tool results are processed
        conversation.push({
          role: "user",
          content: toolResults,
        });
      }
    },
  };

  return agent;
}

async function main(): Promise<void> {
  const client = new Anthropic();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const getUserMessage = async (): Promise<string | null> => {
    return new Promise((resolve) => {
      rl.once("line", (input) => {
        resolve(input);
      });

      rl.once("close", () => {
        resolve(null);
      });
    });
  };

  const agent = createAgent(client, getUserMessage, tools);

  try {
    await agent.run({});
  } catch (error) {
    console.error(
      `Error: ${error instanceof Error ? error.message : String(error)}`
    );
  } finally {
    rl.close();
  }
}

main();
