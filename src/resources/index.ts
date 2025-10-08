// src/resources/index.ts
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { projectResourceUris } from "../store/fsStore.js";

function mime(p: string) {
  if (p.endsWith(".md")) return "text/markdown";
  if (p.endsWith(".json")) return "application/json";
  return "text/plain";
}

export function registerResources(server: McpServer) {
  // Create a resource template for project files
  const template = new ResourceTemplate("file:///{path}", {
    list: async () => {
      return {
        resources: projectResourceUris("demo").map((uri) => {
          const p = uri.replace("file://", "");
          return {
            uri,
            name: path.basename(p),
            description: `Project file: ${path.basename(p)}`,
            mimeType: mime(p),
          };
        }),
      };
    },
  });

  // Register the resource template
  server.resource(
    "decibel-project-files",
    template,
    {
      title: "Decibel project context",
      description:
        "Brief, goals, personas, notes, decisions, principles, tenets, elements, tokens, palette",
    },
    async (uri) => {
      const p = fileURLToPath(uri.href);
      const text = await fs.readFile(p, "utf8");
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: mime(p),
            text,
          },
        ],
      };
    }
  );
}
