// src/tools/index.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { 
  appendMarkdown, 
  upsertPrinciple, 
  searchGuidelines, 
  addMoodAsset 
} from "../store/fsStore.js";
import { 
  syncTokensToProject, 
  getComponent,
  getFigmaData
} from "../store/figmaStore.js";

export function registerTools(server: McpServer) {
  // Existing tools
  server.tool(
    "add_note",
    "Append a note to notes.md for a project",
    { project_id: z.string(), note: z.string().min(1) },
    async ({ project_id, note }) => {
      await appendMarkdown(project_id, "notes.md", note);
      return { content: [{ type: "text", text: "Note added." }] };
    }
  );

  server.tool(
    "log_decision",
    "Append a structured design decision to decisions.md",
    {
      project_id: z.string(),
      title: z.string(),
      rationale: z.string(),
      links: z.array(z.string()).optional(),
    },
    async ({ project_id, title, rationale, links }) => {
      const text =
        `**Decision:** ${title}\n\n**Rationale:** ${rationale}\n` +
        (links?.length ? `\n**Links:**\n- ${links.join("\n- ")}` : "");
      await appendMarkdown(project_id, "decisions.md", text);
      return { content: [{ type: "text", text: "Decision logged." }] };
    }
  );

  server.tool(
    "upsert_principle",
    "Create or update a principle in project principles.json",
    {
      project_id: z.string(),
      id: z.string().min(1),
      title: z.string().min(1),
      body: z.string().min(1),
      tags: z.array(z.string()).optional(),
    },
    async ({ project_id, id, title, body, tags }) => {
      await upsertPrinciple(project_id, { id, title, body, tags });
      return { content: [{ type: "text", text: "Principle upserted." }] };
    }
  );

  server.tool(
    "search_guidelines",
    "Search across principles, tenets, and elements by keyword",
    { project_id: z.string(), query: z.string().min(2) },
    async ({ project_id, query }) => {
      const results = await searchGuidelines(project_id, query);
      return { content: [{ type: "text", text: JSON.stringify(results, null, 2) }] };
    }
  );

  server.tool(
    "add_mood_asset",
    "Add an asset (image/link) to a project's moodboard",
    {
      project_id: z.string(),
      moodboard_id: z.string(),
      asset: z.object({
        id: z.string(),
        uri: z.string(),
        title: z.string().optional(),
        tags: z.array(z.string()).optional(),
        notes: z.string().optional(),
      }),
    },
    async ({ project_id, moodboard_id, asset }) => {
      await addMoodAsset(project_id, moodboard_id, asset);
      return { content: [{ type: "text", text: "Moodboard asset added." }] };
    }
  );

  // NEW: Phase 1 Figma Tools
  server.tool(
    "sync_tokens",
    "Pull design tokens from Figma and write to project design-tokens.json",
    {
      project_id: z.string(),
      force_refresh: z.boolean().optional(),
    },
    async ({ project_id, force_refresh }) => {
      const result = await syncTokensToProject(project_id);
      return {
        content: [
          {
            type: "text",
            text: `✅ Synced ${result.count} design tokens from Figma to ${result.path}`,
          },
        ],
      };
    }
  );

  server.tool(
    "get_component_details",
    "Get detailed information about a specific Figma component by name or ID",
    {
      project_id: z.string(),
      identifier: z.string(),
    },
    async ({ project_id, identifier }) => {
      const component = await getComponent(project_id, identifier);

      if (!component) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Component "${identifier}" not found`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(component, null, 2),
          },
        ],
      };
    }
  );

  // NEW: Phase 2 Figma Tools
  server.tool(
    "generate_documentation",
    "Auto-generate markdown documentation for Figma components and design tokens",
    {
      project_id: z.string(),
      include_tokens: z.boolean().default(true),
      include_components: z.boolean().default(true),
      include_overview: z.boolean().default(true),
    },
    async ({ project_id, include_tokens, include_components, include_overview }) => {
      const ROOT = "./projects";
      const data = await getFigmaData(project_id);
      
      // Helper functions for generating docs
      const generateTokensDoc = (tokens: Record<string, any[]>): string => {
        let doc = "# Design Tokens\n\n";
        doc += "_Auto-generated from Figma design system_\n\n";
        doc += "---\n\n";

        Object.entries(tokens).forEach(([category, tokenList]) => {
          if (!Array.isArray(tokenList) || tokenList.length === 0) return;
          const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
          doc += `## ${categoryName}\n\n`;
          
          tokenList.forEach((token) => {
            doc += `### ${token.name}\n\n`;
            doc += `- **Type:** ${token.resolvedType}\n`;
            doc += `- **Figma ID:** \`${token.id}\`\n`;
            
            if (token.valuesByMode) {
              const value = token.valuesByMode.default || Object.values(token.valuesByMode)[0];
              if (value !== undefined) {
                doc += `- **Value:** \`${JSON.stringify(value)}\`\n`;
              }
            }
            doc += "\n";
          });
          doc += "---\n\n";
        });
        return doc;
      };

      const generateComponentsDoc = (components: any[]): string => {
        let doc = "# Components\n\n";
        doc += "_Auto-generated from Figma component library_\n\n";
        doc += "---\n\n";

        if (components.length === 0) {
          doc += "_No components found in Figma file._\n\n";
          return doc;
        }

        components.forEach((component) => {
          doc += `## ${component.name}\n\n`;
          if (component.description) doc += `${component.description}\n\n`;
          doc += `- **Figma ID:** \`${component.id}\`\n`;
          if (component.tags?.length) doc += `- **Tags:** ${component.tags.join(", ")}\n`;
          doc += "\n---\n\n";
        });
        return doc;
      };

      const generateOverviewDoc = (data: any): string => {
        let doc = "# Design System Overview\n\n";
        doc += "_Auto-generated documentation from Figma_\n\n";
        doc += `**Last updated:** ${new Date().toLocaleDateString()}\n\n`;
        doc += "---\n\n## Summary\n\n";
        
        const componentCount = data.components?.length || 0;
        const tokenCategories = Object.entries(data.variables || {})
          .filter(([_, tokens]) => Array.isArray(tokens) && (tokens as any[]).length > 0);
        
        doc += `- **Components:** ${componentCount}\n`;
        doc += `- **Token Categories:** ${tokenCategories.length}\n\n`;
        
        if (tokenCategories.length > 0) {
          doc += "### Token Breakdown\n\n";
          tokenCategories.forEach(([category, tokens]: [string, any]) => {
            const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
            doc += `- **${categoryName}:** ${tokens.length} tokens\n`;
          });
          doc += "\n";
        }
        
        doc += "---\n\n## Documentation\n\n";
        doc += "- [Design Tokens](./design-tokens.md)\n";
        doc += "- [Components](./components.md)\n\n";
        return doc;
      };

      // Create documentation directory
      const path = await import("node:path");
      const fs = await import("node:fs/promises");
      const docsDir = path.join(process.cwd(), "projects", project_id, "documentation");
      await fs.mkdir(docsDir, { recursive: true });
      
      const generatedFiles: string[] = [];

      if (include_tokens) {
        const tokensDoc = generateTokensDoc(data.variables);
        await fs.writeFile(path.join(docsDir, "design-tokens.md"), tokensDoc, "utf8");
        generatedFiles.push("design-tokens.md");
      }

      if (include_components) {
        const componentsDoc = generateComponentsDoc(data.components);
        await fs.writeFile(path.join(docsDir, "components.md"), componentsDoc, "utf8");
        generatedFiles.push("components.md");
      }

      if (include_overview) {
        const overviewDoc = generateOverviewDoc(data);
        await fs.writeFile(path.join(docsDir, "README.md"), overviewDoc, "utf8");
        generatedFiles.push("README.md");
      }

      return {
        content: [
          {
            type: "text",
            text: `✅ Generated ${generatedFiles.length} documentation files:\n\n` +
                  generatedFiles.map(f => `- ${f}`).join("\n") + "\n\n" +
                  `📁 Location: /projects/${project_id}/documentation/`,
          },
        ],
      };
    }
  );
}
