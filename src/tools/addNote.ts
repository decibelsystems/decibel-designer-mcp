import { z } from "zod";
import { appendMarkdown } from "../store/fsStore.js";

export const addNoteTool = {
  name: "add_note",
  description: "Append a note to notes.md for a project",
  inputSchema: z.object({ project_id: z.string(), note: z.string().min(1) }),
  handler: async (args: { project_id: string; note: string }) => {
    await appendMarkdown(args.project_id, "notes.md", args.note);
    return { content: [{ type: "text", text: "Note added." }] };
  }
};
