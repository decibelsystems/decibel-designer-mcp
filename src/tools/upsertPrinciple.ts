import { z } from "zod";
import { upsertPrinciple } from "../store/fsStore.js";

export const upsertPrincipleTool = {
  name: "upsert_principle",
  description: "Create or update a principle in project principles.json",
  inputSchema: z.object({
    project_id: z.string(),
    id: z.string().min(1),
    title: z.string().min(1),
    body: z.string().min(1),
    tags: z.array(z.string()).optional()
  }),
  handler: async (args: { project_id: string; id: string; title: string; body: string; tags?: string[] }) => {
    await upsertPrinciple(args.project_id, { id: args.id, title: args.title, body: args.body, tags: args.tags });
    return { content: [{ type: "text", text: "Principle upserted." }] };
  }
};
