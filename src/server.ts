// src/server.ts
import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerResources } from "./resources/index.js";
import { registerTools } from "./tools/index.js";
import { registerPrompts } from "./prompts/index.js";

const server = new McpServer({ name: "decibel-designer", version: "0.1.0" });

// Register capabilities
registerResources(server);
registerTools(server);
registerPrompts(server);

// Connect over stdio (Claude Desktop, Cursor, etc.)
const transport = new StdioServerTransport();
await server.connect(transport);

console.error("✅ Decibel Designer is running — connected via stdio");
console.error("   Ready to serve resources, tools, and prompts (including design_review)...");
