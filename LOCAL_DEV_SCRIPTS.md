# Local Development Scripts (Not in Repo)

The following files are intentionally git-ignored as they are user-specific:

- `sync-to-mcp.sh` - Your personal sync script
- `watch-sync.sh` - Auto-sync watch mode
- `setup-dev.sh` - One-time setup automation  
- `DEV_CHEATSHEET.md` - Personal quick reference

These scripts contain paths specific to your local development setup (e.g., where your git repo is vs. where Claude Desktop runs your MCP).

See `DEVELOPMENT_WORKFLOW.md` for templates you can use to create these scripts if needed.

## Why They're Git-Ignored

1. **User-specific paths** - Everyone's directory structure is different
2. **Workflow preferences** - Not everyone needs sync automation
3. **Keeps repo clean** - These are development aids, not part of the MCP server itself
4. **Avoids confusion** - End users don't need to see internal dev tooling

## Your Local Copies

Your local scripts are working and will stay on your machine. They just won't be committed to git, which is exactly what you want!
