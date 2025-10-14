// src/resources/index.ts
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { projectResourceUris } from "../store/fsStore.js";
import { getFigmaData, getTokens } from "../store/figmaStore.js";

function mime(p: string) {
  if (p.endsWith(".md")) return "text/markdown";
  if (p.endsWith(".json")) return "application/json";
  return "text/plain";
}

export function registerResources(server: McpServer) {
  // Existing project files resource
  const projectTemplate = new ResourceTemplate("file:///{path}", {
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

  server.resource(
    "decibel-project-files",
    projectTemplate,
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

  // NEW: Figma components resource
  const figmaTemplate = new ResourceTemplate("figma://component/{id}", {
    list: async () => {
      const projectId = "demo"; // TODO: Make this dynamic per project
      const data = await getFigmaData(projectId);
      
      return {
        resources: data.components.map((component) => ({
          uri: `figma://component/${component.id}`,
          name: component.name,
          description: component.description || `Figma component: ${component.name}`,
          mimeType: "application/json",
          metadata: {
            tags: component.tags,
            type: component.type,
            aliases: component.aliases,
          },
        })),
      };
    },
  });

  server.resource(
    "figma-components",
    figmaTemplate,
    {
      title: "Figma Components",
      description:
        "Live inventory of Figma components, styles, and design tokens from your design system",
    },
    async (uri) => {
      const projectId = "demo"; // TODO: Make this dynamic per project
      const componentId = uri.pathname.replace("/", "");
      const data = await getFigmaData(projectId);
      const component = data.components.find((c) => c.id === componentId);

      if (!component) {
        throw new Error(`Component ${componentId} not found`);
      }

      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(component, null, 2),
          },
        ],
      };
    }
  );

  // NEW: Figma tokens resource
  const tokensTemplate = new ResourceTemplate("figma://tokens/{category}", {
    list: async () => {
      const projectId = "demo";
      const tokens = await getTokens(projectId);
      
      const categories = Object.keys(tokens);
      
      return {
        resources: categories.map((category) => ({
          uri: `figma://tokens/${category}`,
          name: `${category} tokens`,
          description: `Design tokens for ${category}`,
          mimeType: "application/json",
        })),
      };
    },
  });

  server.resource(
    "figma-tokens",
    tokensTemplate,
    {
      title: "Figma Design Tokens",
      description:
        "Design system tokens (colors, spacing, typography) synchronized from Figma variables",
    },
    async (uri) => {
      const projectId = "demo";
      const category = uri.pathname.replace("/", "");
      const tokens = await getTokens(projectId);
      
      if (!(category in tokens)) {
        throw new Error(`Token category ${category} not found`);
      }

      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(tokens[category as keyof typeof tokens], null, 2),
          },
        ],
      };
    }
  );
}
