import { z } from "zod";
import { searchGuidelines } from "../store/fsStore.js";

export const searchGuidelinesTool = {
  name: "search_guidelines",
  description: "Search across principles, tenets, and elements by keyword",
  inputSchema: z.object({ project_id: z.string(), query: z.string().min(2) }),
  handler: async (args: { project_id: string; query: string }) => {
    const results = await searchGuidelines(args.project_id, args.query);
    return { content: [{ type: "json", json: results }] };
  }
};
