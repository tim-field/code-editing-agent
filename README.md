# Claude Tool Agent

This project provides a command-line interface for interacting with Claude AI using the Anthropic API, enhanced with custom tools that allow Claude to perform actions like reading, writing, and listing files on your system.

## Setup

1. Clone this repository:

   ```
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Install dependencies:

   ```
   pnpm install
   ```

3. Set up your Anthropic API key as an environment variable:

   ```
   export ANTHROPIC_API_KEY=your_api_key_here
   ```

   Alternatively, you can add it to your `.envrc` file if using direnv.

## Usage

Start the chat interface:

```
npx tsx main.ts
```

Once running, you can chat with Claude naturally. Claude can use the integrated tools to help you with file operations when requested.

Example interactions:

- "List the files in the current directory"
- "Read the content of package.json"
- "Create a new file called example.txt with some example content"

Type Ctrl+C to exit the chat.

## Available Tools

The agent comes with the following tools:

- **file_read**: Reads the content of a file
- **file_write**: Writes content to a file, with option to create parent directories
- **file_list**: Lists files in a directory, with optional filtering by extension

## Development

### Project Structure

- `main.ts`: Entry point containing the agent implementation
- `tools/`: Directory containing tool implementations
  - `index.ts`: Exports all available tools
  - `fileRead.ts`: Implementation of the file reading tool
  - `fileWrite.ts`: Implementation of the file writing tool
  - `fileList.ts`: Implementation of the file listing tool

### Adding New Tools

To add a new tool:

1. Create a new file in the `tools` directory
2. Implement the tool following the pattern in existing tools
3. Export the tool from `tools/index.ts`

## Security Note

This application can read and write files on your filesystem. Use with caution and never expose it as a public service.
