export const critiqueDesign = {
  name: "critique_design",
  description: "Structured critique using brief, goals, personas, principles/tenets/elements, and relevant moodboard tags.",
  arguments: [
    { name: "project_id", description: "Project identifier (e.g., 'demo')" },
    { name: "artifact", description: "Path or URL of the design artifact to critique" }
  ],
  messages: [
    { role: "system", content: "You are a rigorous design critic. Reference the provided project brief, goals, personas, principles, tenets, elements, tokens, palette, and moodboard tags. Give crisp, prioritized feedback: 1) Goal alignment 2) Heuristics 3) Brand/style adherence 4) Risks & open questions 5) Actionable next steps." },
    { role: "user", content: "Critique {{artifact}} for project {{project_id}}. Cite which principle/tenet/element each point maps to." }
  ]
};
