import { z } from "zod";
import { readPrecepts } from "../store/fsStore.js";

export const listPrinciplesTool = {
  name: "list_principles",
  description: "List merged global+project principles and tenets",
  inputSchema: z.object({ project_id: z.string() }),
  handler: async (args: { project_id: string }) => {
    const data = await readPrecepts(args.project_id);
    const summary = {
      principles: (data.principles ?? []).map(p => ({ id: p.id, title: p.title, tags: p.tags ?? [] })),
      tenets: (data.tenets ?? []).map(t => ({ id: t.id, text: t.text, tags: t.tags ?? [] })),
      elements: (data.elements ?? []).map(e => ({ id: e.id, name: e.name, tags: e.tags ?? [] }))
    };
    return { content: [{ type: "json", json: summary }] };
  }
};
