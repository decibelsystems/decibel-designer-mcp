// src/tools/index.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { 
  appendMarkdown, 
  upsertPrinciple, 
  searchGuidelines, 
  addMoodAsset,
  readPrecepts 
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

  // NEW: Phase 2 Feature 2 - Review Figma
  server.tool(
    "review_figma",
    "Review a Figma component against project principles and design system guidelines",
    {
      project_id: z.string(),
      component_id: z.string(),
      review_type: z.enum(["full", "accessibility", "consistency"]).default("full"),
      principles: z.array(z.string()).optional(),
      output_format: z.enum(["structured", "markdown"]).default("structured"),
    },
    async ({ project_id, component_id, review_type, principles: specificPrinciples, output_format }) => {
      // Get component from Figma
      const component = await getComponent(project_id, component_id);
      
      if (!component) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Component "${component_id}" not found`,
            },
          ],
        };
      }

      // Get project principles
      const precepts = await readPrecepts(project_id);
      const allPrinciples = precepts.principles || [];
      
      // Filter to specific principles if requested
      const relevantPrinciples = specificPrinciples
        ? allPrinciples.filter(p => specificPrinciples.includes(p.id))
        : allPrinciples;

      // Initialize findings
      type Finding = {
        severity: "error" | "warning" | "info";
        category: "accessibility" | "consistency" | "principle";
        title: string;
        description: string;
        suggestion: string;
        principle_id?: string;
        auto_fixable?: boolean;
      };
      
      const findings: Finding[] = [];
      const passedChecks: string[] = [];

      // Helper: Calculate contrast ratio (simplified WCAG)
      const calculateContrastRatio = (fg: any, bg: any): number => {
        // Simplified: just return a mock value for now
        // Real implementation would convert Figma RGB to luminance
        return 4.5; // Placeholder
      };

      // Helper: Check if name follows convention
      const checkNamingConvention = (name: string): boolean => {
        // Convention: ComponentName/Variant
        return /^[A-Z][a-zA-Z]+(\/[A-Z][a-zA-Z]+)?$/.test(name);
      };

      // Helper: Match finding to principle
      const matchPrinciple = (keywords: string[]): string | undefined => {
        for (const principle of relevantPrinciples) {
          const searchText = `${principle.title} ${principle.body} ${principle.tags?.join(" ")}`.toLowerCase();
          if (keywords.some(kw => searchText.includes(kw.toLowerCase()))) {
            return principle.id;
          }
        }
        return undefined;
      };

      // Run accessibility checks
      if (review_type === "full" || review_type === "accessibility") {
        // Check 1: Component naming (basic validation)
        if (!component.description || component.description.length < 10) {
          findings.push({
            severity: "info",
            category: "accessibility",
            title: "Missing or Short Description",
            description: `Component "${component.name}" lacks a comprehensive description`,
            suggestion: "Add a detailed description explaining the component's purpose and usage",
            principle_id: matchPrinciple(["accessibility", "documentation"]),
            auto_fixable: false,
          });
        } else {
          passedChecks.push("Component has adequate description");
        }

        // Check 2: Semantic naming
        if (component.name.toLowerCase().includes("frame") || component.name.toLowerCase().includes("group")) {
          findings.push({
            severity: "warning",
            category: "accessibility",
            title: "Generic Component Name",
            description: `Component name "${component.name}" uses generic terms like 'frame' or 'group'`,
            suggestion: "Use semantic names that describe the component's purpose (e.g., 'NavigationMenu' instead of 'Frame 1')",
            principle_id: matchPrinciple(["accessibility", "semantic"]),
            auto_fixable: false,
          });
        } else {
          passedChecks.push("Component has semantic name");
        }
      }

      // Run consistency checks
      if (review_type === "full" || review_type === "consistency") {
        // Check 3: Naming convention
        if (!checkNamingConvention(component.name)) {
          findings.push({
            severity: "warning",
            category: "consistency",
            title: "Naming Convention Violation",
            description: `Component name "${component.name}" doesn't follow the naming pattern`,
            suggestion: "Use PascalCase with optional variant: ComponentName/Variant (e.g., 'Button/Primary')",
            principle_id: matchPrinciple(["consistency", "naming", "convention"]),
            auto_fixable: false,
          });
        } else {
          passedChecks.push("Component follows naming convention");
        }

        // Check 4: Tags usage
        if (!component.tags || component.tags.length === 0) {
          findings.push({
            severity: "info",
            category: "consistency",
            title: "No Tags Assigned",
            description: "Component has no tags for categorization",
            suggestion: "Add relevant tags (e.g., 'interactive', 'navigation', 'core') to improve discoverability",
            principle_id: matchPrinciple(["organization", "taxonomy"]),
            auto_fixable: false,
          });
        } else {
          passedChecks.push(`Component has ${component.tags.length} tag(s)`);
        }
      }

      // Calculate summary
      const summary = {
        total_issues: findings.length,
        errors: findings.filter(f => f.severity === "error").length,
        warnings: findings.filter(f => f.severity === "warning").length,
        info: findings.filter(f => f.severity === "info").length,
      };

      // Format output
      if (output_format === "markdown") {
        let markdown = `# Review: ${component.name}\n\n`;
        markdown += `## Summary\n`;
        markdown += `- ✅ ${passedChecks.length} checks passed\n`;
        if (summary.errors > 0) markdown += `- ❌ ${summary.errors} error(s)\n`;
        if (summary.warnings > 0) markdown += `- ⚠️  ${summary.warnings} warning(s)\n`;
        if (summary.info > 0) markdown += `- ℹ️  ${summary.info} info\n`;
        markdown += `\n`;

        if (findings.length > 0) {
          markdown += `## Findings\n\n`;
          findings.forEach(f => {
            const icon = f.severity === "error" ? "❌" : f.severity === "warning" ? "⚠️" : "ℹ️";
            markdown += `### ${icon} ${f.severity.charAt(0).toUpperCase() + f.severity.slice(1)}: ${f.title}\n`;
            markdown += `**Category:** ${f.category.charAt(0).toUpperCase() + f.category.slice(1)}\n`;
            markdown += `**Issue:** ${f.description}\n`;
            markdown += `**Suggestion:** ${f.suggestion}\n`;
            if (f.principle_id) markdown += `**Related Principle:** ${f.principle_id}\n`;
            markdown += `\n`;
          });
        }

        if (passedChecks.length > 0) {
          markdown += `## Passed Checks\n\n`;
          passedChecks.forEach(check => {
            markdown += `- ✅ ${check}\n`;
          });
        }

        return {
          content: [
            {
              type: "text",
              text: markdown,
            },
          ],
        };
      } else {
        // Structured format
        const result = {
          component: {
            id: component.id,
            name: component.name,
            type: component.type || "component",
          },
          summary,
          findings,
          passed_checks: passedChecks,
        };

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
    }
  );
}
