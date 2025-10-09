# Decibel Designer

An MCP server that gives Claude persistent memory for design work — principles, decisions, and progress that survive across conversations.

**The problem:** AI lets you iterate fast, but design context gets lost between sessions. Decisions disappear. Rationale becomes "we discussed this somewhere." Principles drift.

**The solution:** Structured design artifacts that Claude can query, reference, and evolve. Methodology that keeps pace with AI velocity.

---

## What It Does

Decibel Designer provides Claude with tools to:

- **Codify design principles** — Your system's foundational truths, tagged and queryable
- **Document decisions** — Key choices with rationale, dates, and status
- **Track progress** — Chronological notes on what shipped and what's next
- **Organize visual direction** — Moodboards with tagged assets
- **Conduct design reviews** — Review work based on the established guidelines, rules, and principles
- **Search everything** — Query across all design docs by keyword or tag
- **Align creative direction** — tone, goals, and audience

When connected via MCP, Claude maintains design context across projects and conversations.

---

## Installation

### Prerequisites

- Claude Desktop app installed
- Node.js 18+ installed
- Basic familiarity with command line and JSON config files
- **Project folder must be on your main drive** (external drives may cause issues)

### Step 1: Install the MCP Server
```bash
npm install -g @decibelsystems/decibel-designer-mcp
---

## Using the Demo Project

This repo includes a complete example in [`/demo`](./demo/) — a real design brief for a studio marketing site with all artifacts pre-populated.

### Getting Started with the Demo

1. **Clone this repository**
```bash
   git clone https://github.com/decibelsystems/decibel-designer-mcp.git
   cd decibel-designer-mcp

   ### Example Workflows to Try

**Query existing principles:**
> "What are our core design principles for this project?"

**Search by tag:**
> "Show me all principles related to typography"

**Reference decisions:**
> "Why did we choose a single-page layout?"

**Conduct a design review:**
> "Review the hero section design based on our established principles. I'm concerned the CTA buttons are competing for attention and the mobile layout feels cramped."

Claude will reference your documented principles (like "Clarity First") and provide structured feedback aligned with your design system.

**Add a new principle:**
> "Add a principle about animation: motion should enhance clarity, never distract"

**Document a decision:**
> "Log a decision about using red as the primary accent color. Rationale: creates urgency and confidence without being overwhelming"

**Track progress:**
> "Add a note that we've completed the hero section wireframes and are moving to the services overview"

**Add to moodboard:**
> "Add this Behance project to the industrial moodboard: [URL]"