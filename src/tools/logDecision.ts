import { z } from "zod";
import { appendMarkdown } from "../store/fsStore.js";

export const logDecisionTool = {
  name: "log_decision",
  description: "Append a structured design decision to decisions.md",
  inputSchema: z.object({
    project_id: z.string(),
    title: z.string(),
    rationale: z.string(),
    links: z.array(z.string()).optional()
  }),
  handler: async (args: { project_id: string; title: string; rationale: string; links?: string[] }) => {
    const text = `**Decision:** ${args.title}\n\n**Rationale:** ${args.rationale}\n${args.links?.length ? `\n**Links:**\n- ${args.links.join("\n- ")}` : ""}`;
    await appendMarkdown(args.project_id, "decisions.md", text);
    return { content: [{ type: "text", text: "Decision logged." }] };
  }
};
