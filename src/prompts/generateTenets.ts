export const generateTenets = {
  name: "generate_tenets",
  description: "Draft design tenets from the brief and moodboard tags.",
  arguments: [
    { name: "project_id", description: "Project identifier" },
    { name: "moodboard_id", description: "Moodboard to reference" }
  ],
  messages: [
    { role: "system", content: "You are a brand strategist. Synthesize short, memorable tenets (max 8 words each). Each tenet should include 2–3 tags and a single‑sentence rationale." },
    { role: "user", content: "Using project {{project_id}} brief/goals and moodboard {{moodboard_id}}, propose 6–8 tenets." }
  ]
};
