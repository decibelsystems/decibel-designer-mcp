import { z } from "zod";
import { addMoodAsset } from "../store/fsStore.js";

export const addMoodAssetTool = {
  name: "add_mood_asset",
  description: "Add an asset (image/link) to a project's moodboard",
  inputSchema: z.object({
    project_id: z.string(),
    moodboard_id: z.string(),
    asset: z.object({
      id: z.string(),
      uri: z.string(),
      title: z.string().optional(),
      tags: z.array(z.string()).optional(),
      notes: z.string().optional()
    })
  }),
  handler: async (args: { project_id: string; moodboard_id: string; asset: { id: string; uri: string; title?: string; tags?: string[]; notes?: string } }) => {
    await addMoodAsset(args.project_id, args.moodboard_id, args.asset);
    return { content: [{ type: "text", text: "Moodboard asset added." }] };
  }
};
