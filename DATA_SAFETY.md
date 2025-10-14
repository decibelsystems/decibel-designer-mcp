# Data Safety & Project Management

## 🔒 User Data Protection

**CRITICAL:** User project data is precious and must never be lost during updates or syncs.

## Project Structure

```
projects/
├── demo/              # Example project (committed to git)
│   ├── principles.json
│   ├── mocks/
│   └── ...
├── my-real-project/   # User's actual work (NOT in git)
│   ├── principles.json
│   └── ...
└── another-project/   # User's work (NOT in git)
```

## What's in Git vs. Local

### Committed to Git (Safe to Overwrite)
- `projects/demo/` - Example/template project only
- Demo mocks, sample data, documentation

### Never Committed (User Data - Protected)
- `projects/your-project/` - All user-created projects
- `projects/*/cache/` - Cache directories
- Any project that isn't named "demo"

## .gitignore Protection

The `.gitignore` is configured to:
```gitignore
projects/*           # Ignore all projects
!projects/demo/      # EXCEPT the demo project
projects/*/cache/    # Always ignore cache directories
```

This ensures:
✅ User projects never accidentally get committed  
✅ Updates won't overwrite user data  
✅ Only demo project is version controlled

## Safe Sync Practices

### ❌ DANGEROUS - Don't Do This
```bash
# This will DELETE user projects!
rsync -av --delete "$GIT_REPO/projects/" "$MCP_PROD/projects/"
```

### ✅ SAFE - Do This Instead
```bash
# Only sync the demo project, preserve user projects
rsync -av "$GIT_REPO/projects/demo/" "$MCP_PROD/projects/demo/"
```

Or even safer, sync everything EXCEPT projects:
```bash
rsync -av --exclude='projects' "$GIT_REPO/" "$MCP_PROD/"
rsync -av "$GIT_REPO/projects/demo/" "$MCP_PROD/projects/demo/"
```

## Upgrade Safety Checklist

When updating the MCP server:

### For End Users (npm install)
- ✅ User projects are outside node_modules
- ✅ npm install never touches projects folder
- ✅ Safe to upgrade at any time

### For Developers (git pull)
- ✅ .gitignore protects user projects
- ✅ git pull only updates demo project
- ✅ User projects remain untouched

### For Custom Sync Scripts
- ⚠️ **Review your sync script carefully**
- ⚠️ Never use `--delete` on projects folder
- ⚠️ Only sync specific known folders (like demo)

## Backup Recommendations

Even with protections in place, backups are essential:

```bash
# Before major updates, backup your projects
cp -r ~/decibel-designer/projects ~/decibel-projects-backup-$(date +%Y%m%d)

# Or use Time Machine / version control for your projects
cd ~/decibel-designer/projects/my-project
git init  # Version control your own project data
```

## Migration Strategy (Future Consideration)

If we ever need to change project structure:

1. **Never** automatically migrate data
2. Provide migration script that:
   - Creates backup first
   - Asks for confirmation
   - Shows what will change
   - Logs all operations
3. Document migration process clearly
4. Provide rollback instructions

## Questions to Ask Before Any Sync/Update

1. **Will this delete user data?** → If yes, DON'T DO IT
2. **Is there a backup?** → If no, CREATE ONE FIRST
3. **Can this be rolled back?** → If no, RECONSIDER
4. **Is the demo project the only thing changing?** → Should be YES

---

**Golden Rule:** When in doubt, preserve user data. The demo project can always be regenerated, but user projects are irreplaceable.
