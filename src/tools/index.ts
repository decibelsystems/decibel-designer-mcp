// src/tools/index.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { appendMarkdown, upsertPrinciple, searchGuidelines, addMoodAsset } from "../store/fsStore.js";

export function registerTools(server: McpServer) {
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
}
