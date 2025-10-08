// src/prompts/index.ts
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerPrompts(server: McpServer) {
  // ---- Critique Design ----
  server.registerPrompt(
    "critique_design",
    {
      title: "Critique Design",
      description:
        "Structured critique using brief, goals, personas, and Decibel precepts.",
      argsSchema: {
        project_id: z.string().optional(),
        artifact: z.string().optional(),
      },
    },
    async (
      args: { project_id?: string; artifact?: string } = {},
      _extra
    ) => {
      const proj = args.project_id ?? "current project";
      const art = args.artifact ?? "the provided artifact";

      return {
        description: "Critique prompt payload",
        messages: [
          {
            role: "assistant",
            content: {
              type: "text",
              text:
                "You are a rigorous design critic. Reference brief, goals, personas, principles/tenets/elements, tokens, and palette. Prioritize: (1) Goal alignment (2) Heuristics (3) Brand/style adherence (4) Risks & open questions (5) Actionable next steps.",
            },
          },
          {
            role: "user",
            content: {
              type: "text",
              text: `Critique ${art} for project ${proj}. For each point, cite which principle/tenet/element it maps to.`,
            },
          },
        ],
      };
    }
  );

  // ---- Generate Tenets ----
  server.registerPrompt(
    "generate_tenets",
    {
      title: "Generate Tenets",
      description:
        "Draft short, memorable tenets (≤8 words) with tags and a one-sentence rationale.",
      argsSchema: {
        project_id: z.string().optional(),
        moodboard_id: z.string().optional(),
      },
    },
    async (
      args: { project_id?: string; moodboard_id?: string } = {},
      _extra
    ) => {
      const proj = args.project_id ?? "current project";
      const board = args.moodboard_id ?? "current moodboard";

      return {
        description: "Tenet generation prompt payload",
        messages: [
          {
            role: "assistant",
            content: {
              type: "text",
              text:
                "You are a brand strategist. Synthesize short, memorable tenets. Each tenet should include 2–3 tags and a single-sentence rationale.",
            },
          },
          {
            role: "user",
            content: {
              type: "text",
              text: `Using project ${proj} brief/goals and moodboard ${board} tags, propose 6–8 tenets.`,
            },
          },
        ],
      };
    }
  );

  // ---- Design Review ----
  server.registerPrompt(
    "design_review",
    {
      title: "Design Review",
      description:
        "Comprehensive design review against project principles, checking consistency, accessibility, and adherence to established guidelines.",
      argsSchema: {
        project_id: z.string().optional(),
        page_or_component: z.string().optional(),
        url: z.string().optional(),
      },
    },
    async (
      args: { project_id?: string; page_or_component?: string; url?: string } = {},
      _extra
    ) => {
      const proj = args.project_id ?? "the current project";
      const target = args.page_or_component ?? "the design";
      const hasUrl = args.url ? `at ${args.url}` : "";

      return {
        description: "Design review prompt for checking adherence to project guidelines",
        messages: [
          {
            role: "assistant",
            content: {
              type: "text",
              text:
                "You are an expert design reviewer. Your job is to thoroughly evaluate designs against the project's established principles, tenets, and elements. Be specific, actionable, and reference the exact guidelines being followed or violated.",
            },
          },
          {
            role: "user",
            content: {
              type: "text",
              text: `Review ${target} ${hasUrl} for ${proj}.

Please provide a comprehensive design review covering:

1. **Principle Adherence**: Check against all documented principles. For each principle, note whether the design follows it and provide specific examples.

2. **Visual Consistency**: 
   - Color usage (primary, secondary, backgrounds)
   - Typography (font families, sizes, weights, hierarchy)
   - Spacing (8px grid adherence, padding, margins)
   - Icons (consistent library, semantic usage, sizing)

3. **Component Usage**:
   - Are design system components being used correctly?
   - Any custom implementations that should use existing components?
   - Props and variants used appropriately?

4. **Interaction States**:
   - Hover, focus, active, disabled states
   - Transition timing and smoothness
   - Loading states and feedback

5. **Accessibility**:
   - Semantic HTML usage
   - Keyboard navigation
   - ARIA labels where needed
   - Color contrast (WCAG compliance)
   - Focus indicators

6. **Pattern Consistency**:
   - Matches established patterns from other pages/components?
   - Any new patterns that should be documented?

7. **Recommendations**:
   - Quick wins for immediate improvement
   - Bigger refactors to consider
   - New principles or patterns to document

For each issue found, cite the specific principle, tenet, or element it relates to. Provide concrete examples and actionable next steps.`,
            },
          },
        ],
      };
    }
  );
}
