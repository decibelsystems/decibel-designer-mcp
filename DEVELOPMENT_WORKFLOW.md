# Development Workflow Guide

> **Note:** This guide documents optional local development tools. These scripts are not part of the repository and are specific to individual development setups.

## Standard Development (No Special Setup Needed)

For most contributors:

```bash
# Clone the repo
git clone https://github.com/your-org/decibel-designer-mcp.git
cd decibel-designer-mcp

# Install dependencies
npm install

# Build
npm run build

# Test locally
npm run dev
```

Claude Desktop will pick up changes when you restart it.

## Advanced: Multi-Location Development Setup

If you need to sync between a development location and where Claude Desktop runs the MCP (e.g., git repo on external drive, MCP on local drive), you can create local sync scripts.

### Example Setup

- **Git repo:** `/path/to/your/git/repo`
- **MCP production:** Where Claude Desktop runs the server (e.g., `~/decibel-designer`)

### Optional Sync Script Template

Create a local `sync-to-mcp.sh` (git-ignored) in your repo:

```bash
#!/bin/bash
set -e

GIT_REPO="/path/to/your/git/repo"
MCP_PROD="/path/to/mcp/production"

echo "🔨 Building TypeScript..."
cd "$GIT_REPO"
npm run build

echo "📦 Syncing to MCP location..."
rsync -av --delete "$GIT_REPO/dist/" "$MCP_PROD/dist/"
rsync -av "$GIT_REPO/package.json" "$MCP_PROD/"
rsync -av "$GIT_REPO/projects/" "$MCP_PROD/projects/"

echo "✅ Sync complete!"
```

Make it executable: `chmod +x sync-to-mcp.sh`

Then use it:
```bash
./sync-to-mcp.sh
# Restart Claude Desktop
```

### Optional Watch Mode Script

For auto-sync on file changes, create `watch-sync.sh` (requires `brew install fswatch`):

```bash
#!/bin/bash
set -e

GIT_REPO="/path/to/your/git/repo"

echo "👀 Watching for changes..."
./sync-to-mcp.sh  # Initial sync

fswatch -o "$GIT_REPO/src" | while read f; do
  echo "🔄 Changes detected, rebuilding..."
  ./sync-to-mcp.sh
done
```

## Standard Commands

```bash
npm run dev           # Run TypeScript directly with tsx (development)
npm run build         # Compile TypeScript to dist/
npm start             # Run compiled JavaScript from dist/
```

## How Syncing Works

If you use a sync script, it typically:

1. **Builds TypeScript** → Compiles `src/` to `dist/`
2. **Syncs compiled code** → Copies `dist/` to production MCP location
3. **Syncs project files** → Copies `projects/` (mocks, cache structure)
4. **Syncs package files** → Copies `package.json` for dependency tracking

**What's typically NOT synced:**
- `node_modules/` - run `npm install` in production location if dependencies change
- `.env` files - keep these local to each location
- Cache data - each location maintains its own cache

## Restart Claude Desktop

After any changes to the MCP server, restart Claude Desktop:

- **macOS:** Cmd+Q to quit, then reopen
- **Alternative:** Force quit from Activity Monitor

## Contributing

Standard git workflow:

```bash
# Make changes
git add .
git commit -m "feat: add new feature"
git push origin main
```

## Troubleshooting

### Changes not appearing in Claude
1. Ensure you ran `npm run build`
2. Restart Claude Desktop (Cmd+Q, not just refresh)
3. Check for TypeScript compilation errors

### Dependency issues
If you update dependencies:
```bash
npm install  # In your dev location
npm run build
# Copy built files to where Claude runs the MCP
# Run npm install there too if needed
```

## Best Practices

### Before Committing
```bash
# Always ensure it builds cleanly
npm run build

# Test your changes
# (Restart Claude Desktop after deploying)

# Then commit
git add .
git commit -m "feat: your message"
git push
```

### Testing Changes
1. Build: `npm run build`
2. Deploy to where Claude runs the MCP
3. Restart Claude Desktop
4. Test the changes

---

**Remember:** Always restart Claude Desktop after making changes to the MCP server!
