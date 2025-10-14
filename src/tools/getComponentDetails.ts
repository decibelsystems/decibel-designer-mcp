// src/tools/getComponentDetails.ts
import { z } from "zod";
import { getComponent } from "../store/figmaStore.js";

export const getComponentDetailsTool = {
  name: "get_component_details",
  description: "Get detailed information about a specific Figma component by name or ID",
  inputSchema: z.object({
    project_id: z.string(),
    identifier: z.string().describe("Component name or ID"),
  }),
  handler: async (args: { project_id: string; identifier: string }) => {
    const component = await getComponent(args.project_id, args.identifier);
    
    if (!component) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Component "${args.identifier}" not found`,
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
  },
};
