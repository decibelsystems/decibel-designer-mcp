// src/tools/syncTokens.ts
import { z } from "zod";
import { syncTokensToProject } from "../store/figmaStore.js";

export const syncTokensTool = {
  name: "sync_tokens",
  description: "Pull design tokens from Figma and write to project design-tokens.json",
  inputSchema: z.object({ 
    project_id: z.string(),
    force_refresh: z.boolean().optional().describe("Force refresh from Figma API, bypassing cache")
  }),
  handler: async (args: { project_id: string; force_refresh?: boolean }) => {
    const result = await syncTokensToProject(args.project_id, args.force_refresh);
    return {
      content: [
        {
          type: "text",
          text: `✅ Synced ${result.count} design tokens from Figma to ${result.path}`,
        },
      ],
    };
  },
};
