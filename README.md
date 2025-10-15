# Decibel Designer

An MCP server that gives Claude persistent memory for design work — principles, decisions, and progress that survive across conversations.

**The problem:** AI lets you iterate fast, but design context gets lost between sessions. Decisions disappear. Rationale becomes "we discussed this somewhere." Principles drift.

**The solution:** Structured design artifacts that Claude can query, reference, and evolve. Methodology that keeps pace with AI velocity.

---

## ✨ What's New

### Figma Integration

Decibel Designer now connects directly to your Figma design systems:

- **Sync Design Tokens** — Pull colors, spacing, typography from Figma variables into your project
- **Component Details** — Query any component by name or ID for full specifications
- **Auto-Documentation** — Generate markdown docs from your Figma design system automatically
- **Design Reviews** — Review Figma components against your established principles with actionable feedback

See [Figma Integration Guide](./FIGMA_INTEGRATION.md) for setup instructions.

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

### Figma Design System Tools

- **Sync design tokens** — Import colors, spacing, typography, and other variables from Figma
- **Query components** — Get details about any component in your Figma library
- **Generate documentation** — Auto-create markdown docs for your design system
- **Review components** — Analyze Figma components for accessibility, consistency, and principle compliance

When connected via MCP, Claude maintains design context across projects and conversations.

---

## Installation

### Prerequisites

- Claude Desktop app installed
- Node.js 18+ installed
- Basic familiarity with command line and JSON config files
- **Project folder must be on your main drive** (external drives may cause issues)
- *Optional:* Figma account with Personal Access Token for design system integration

### Step 1: Install the MCP Server
```bash
npm install -g @decibelsystems/decibel-designer-mcp
```

### Step 2: Configure Claude Desktop

Add to your Claude Desktop config file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "decibel-designer": {
      "command": "npx",
      "args": [
        "-y",
        "@decibelsystems/decibel-designer-mcp"
      ],
      "env": {
        "FIGMA_API_KEY": "your-figma-token-here",
        "FIGMA_FILE_KEY": "your-figma-file-key-here"
      }
    }
  }
}
```

**Note:** Figma environment variables are optional. Without them, the server works in mock mode for testing, or you can connect Figma later.

### Step 3: Restart Claude Desktop

The server will be available in your next conversation.

---

## Using the Demo Project

This repo includes a complete example in [`/demo`](./demo/) — a real design brief for a studio marketing site with all artifacts pre-populated.

### Getting Started with the Demo

1. **Clone this repository**
```bash
git clone https://github.com/decibelsystems/decibel-designer-mcp.git
cd decibel-designer-mcp
```

2. **Install dependencies**
```bash
npm install
```

3. **Run the development server**
```bash
npm run dev
```

4. **Connect to Claude Desktop** by updating your config to point to the local server:
```json
{
  "mcpServers": {
    "decibel-designer": {
      "command": "node",
      "args": ["/path/to/decibel-designer-mcp/dist/server.js"]
    }
  }
}
```

---

## Example Workflows

### Design System Management

**Query existing principles:**
> "What are our core design principles for this project?"

**Search by tag:**
> "Show me all principles related to typography"

**Reference decisions:**
> "Why did we choose a single-page layout?"

**Add a new principle:**
> "Add a principle about animation: motion should enhance clarity, never distract"

**Document a decision:**
> "Log a decision about using red as the primary accent color. Rationale: creates urgency and confidence without being overwhelming"

**Track progress:**
> "Add a note that we've completed the hero section wireframes and are moving to the services overview"

**Add to moodboard:**
> "Add this Behance project to the industrial moodboard: [URL]"

### Figma Integration Workflows

**Sync design tokens:**
> "Sync the design tokens from Figma for this project"

**Query a component:**
> "Get details for the Button/Primary component from Figma"

**Generate documentation:**
> "Generate markdown documentation for our entire design system from Figma"

**Review a component:**
> "Review the Hero/Homepage component against our principles. Check for accessibility and consistency issues."

**Markdown review output:**
> "Review the Card/Product component and give me markdown output so I can share it with the team"

**Accessibility-focused review:**
> "Do an accessibility review of the NavigationMenu component"

### Design Reviews

**Conduct a design review:**
> "Review the hero section design based on our established principles. I'm concerned the CTA buttons are competing for attention and the mobile layout feels cramped."

Claude will reference your documented principles (like "Clarity First") and provide structured feedback aligned with your design system.

---

## Project Structure

```
projects/
└── your-project-name/
    ├── principles.json      # Design principles
    ├── decisions.md         # Design decisions log
    ├── notes.md            # Progress notes
    ├── brief.md            # Project brief
    ├── design-tokens.json  # Synced from Figma
    ├── documentation/       # Auto-generated docs
    │   ├── README.md
    │   ├── design-tokens.md
    │   └── components.md
    ├── moodboards/
    │   └── *.json          # Visual references
    └── cache/
        └── figma-components.json
```

---

## Documentation

- [Figma Integration Guide](./FIGMA_INTEGRATION.md) - Complete setup and usage guide for Figma features
- [Development Workflow](./DEVELOPMENT_WORKFLOW.md) - Contributing and local development
- [Roadmap](./ROADMAP.md) - Upcoming features and long-term vision

---

## License

MIT License - see [LICENSE](./LICENSE) file for details.

---

## Support

- **Issues:** [GitHub Issues](https://github.com/decibelsystems/decibel-designer-mcp/issues)
- **Discussions:** [GitHub Discussions](https://github.com/decibelsystems/decibel-designer-mcp/discussions)

---

Built by [Decibel Systems](https://decibelsystems.com)
