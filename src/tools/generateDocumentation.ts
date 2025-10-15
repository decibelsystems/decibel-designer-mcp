// src/tools/generateDocumentation.ts
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { getFigmaData } from "../store/figmaStore.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../../projects");

/**
 * Generate markdown documentation for design tokens
 */
function generateTokensDoc(tokens: Record<string, any[]>): string {
  let doc = "# Design Tokens\n\n";
  doc += "_Auto-generated from Figma design system_\n\n";
  doc += "---\n\n";

  // Process each category
  Object.entries(tokens).forEach(([category, tokenList]) => {
    if (!Array.isArray(tokenList) || tokenList.length === 0) return;

    // Capitalize category name
    const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
    doc += `## ${categoryName}\n\n`;
    
    tokenList.forEach((token) => {
      doc += `### ${token.name}\n\n`;
      doc += `- **Type:** ${token.resolvedType}\n`;
      doc += `- **Figma ID:** \`${token.id}\`\n`;
      
      // Add value if available
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
}

/**
 * Generate markdown documentation for components
 */
function generateComponentsDoc(components: any[]): string {
  let doc = "# Components\n\n";
  doc += "_Auto-generated from Figma component library_\n\n";
  doc += "---\n\n";

  if (components.length === 0) {
    doc += "_No components found in Figma file._\n\n";
    return doc;
  }

  components.forEach((component) => {
    doc += `## ${component.name}\n\n`;
    
    if (component.description) {
      doc += `${component.description}\n\n`;
    }
    
    doc += `- **Figma ID:** \`${component.id}\`\n`;
    
    if (component.tags && component.tags.length > 0) {
      doc += `- **Tags:** ${component.tags.join(", ")}\n`;
    }
    
    doc += "\n---\n\n";
  });

  return doc;
}

/**
 * Generate a comprehensive design system overview
 */
function generateOverviewDoc(data: any): string {
  let doc = "# Design System Overview\n\n";
  doc += "_Auto-generated documentation from Figma_\n\n";
  doc += `**Last updated:** ${new Date().toLocaleDateString()}\n\n`;
  doc += "---\n\n";

  // Summary section
  doc += "## Summary\n\n";
  
  const componentCount = data.components?.length || 0;
  const tokenCategories = Object.entries(data.variables || {})
    .filter(([_, tokens]) => Array.isArray(tokens) && tokens.length > 0);
  
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
  
  doc += "---\n\n";
  
  // Quick links
  doc += "## Documentation\n\n";
  doc += "- [Design Tokens](./design-tokens.md)\n";
  doc += "- [Components](./components.md)\n\n";

  return doc;
}

export const generateDocumentationTool = {
  name: "generate_documentation",
  description: "Auto-generate markdown documentation for Figma components and design tokens",
  inputSchema: z.object({
    project_id: z.string(),
    include_tokens: z.boolean().default(true).describe("Include design tokens documentation"),
    include_components: z.boolean().default(true).describe("Include components documentation"),
    include_overview: z.boolean().default(true).describe("Include overview/index page"),
  }),
  handler: async (args: {
    project_id: string;
    include_tokens?: boolean;
    include_components?: boolean;
    include_overview?: boolean;
  }) => {
    const {
      project_id,
      include_tokens = true,
      include_components = true,
      include_overview = true,
    } = args;

    // Get Figma data
    const data = await getFigmaData(project_id);
    
    // Create documentation directory
    const docsDir = path.join(ROOT, project_id, "documentation");
    await fs.mkdir(docsDir, { recursive: true });
    
    const generatedFiles: string[] = [];

    // Generate tokens documentation
    if (include_tokens) {
      const tokensDoc = generateTokensDoc(data.variables);
      const tokensPath = path.join(docsDir, "design-tokens.md");
      await fs.writeFile(tokensPath, tokensDoc, "utf8");
      generatedFiles.push("design-tokens.md");
    }

    // Generate components documentation
    if (include_components) {
      const componentsDoc = generateComponentsDoc(data.components);
      const componentsPath = path.join(docsDir, "components.md");
      await fs.writeFile(componentsPath, componentsDoc, "utf8");
      generatedFiles.push("components.md");
    }

    // Generate overview
    if (include_overview) {
      const overviewDoc = generateOverviewDoc(data);
      const overviewPath = path.join(docsDir, "README.md");
      await fs.writeFile(overviewPath, overviewDoc, "utf8");
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
  },
};
