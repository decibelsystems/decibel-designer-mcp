# Phase 1 Testing Guide

## What We Built

Phase 1 core features are now implemented:

1. **Real Figma API Integration** ✅
   - `fetchFigmaFile()` - Fetches components from Figma
   - `fetchFigmaVariables()` - Fetches design tokens
   - Authentication using `FIGMA_API_KEY`
   - Proper error handling and rate limiting considerations

2. **`sync_tokens` Tool** ✅
   - Pulls design tokens from Figma
   - Organizes by category (colors, spacing, typography, borderRadius)
   - Writes to `/projects/{id}/design-tokens.json`
   - Design Tokens Community Group schema compliant

3. **`get_component_details` Tool** ✅
   - Fetch component by ID or name
   - Alias support (e.g., "cta" → "Button/Primary")
   - Returns full component data

## How to Test

### Step 1: Build the Project
```bash
cd /Users/ben/decibel-designer
npm run build
```

### Step 2: Restart Claude Desktop
After building, restart Claude Desktop so it picks up the new MCP server code.

### Step 3: Test with Commands

**Test sync_tokens:**
```
Sync design tokens from Figma for the decibel-website project
```

**Test get_component_details:**
```
Get details for the Button/Primary component in the decibel-website project
```

**Test with force refresh:**
```
Sync tokens for decibel-website project with force refresh
```

## Expected Outcomes

### Successful Token Sync
- Creates `/projects/decibel-website/design-tokens.json`
- File contains categorized tokens:
  - colors
  - spacing
  - typography
  - borderRadius
  - other
- Console shows: `✅ Synced X design tokens from Figma to /path/to/design-tokens.json`

### Successful Component Fetch
- Returns JSON with component details:
  - id
  - name
  - description
  - tags

## Environment Setup

Your `.env` file should contain:
```
FIGMA_API_KEY=your_figma_token_here
FIGMA_FILE_KEY=your_figma_file_key_here
FIGMA_MOCK_MODE=false
```

**FIGMA_MOCK_MODE=false** means we'll hit the real Figma API!

## Troubleshooting

### "FIGMA_API_KEY must be set"
- Check your `.env` file
- Ensure `FIGMA_MOCK_MODE=false`
- Verify token is valid at https://www.figma.com/developers/api#access-tokens

### "Figma API error: 403"
- Token might be invalid or expired
- Regenerate at https://www.figma.com/developers/api#access-tokens

### "Figma API error: 404"
- Check `FIGMA_FILE_KEY` in `.env`
- Verify you have access to the file

### Cache Issues
If you want to force a fresh fetch:
```
Invalidate the Figma cache for decibel-website project
```

## What's Next

Once Phase 1 is working:
- Move to Phase 2: Intelligence Layer
- Add `generate_documentation` tool
- Add `generate_moodboard_from_figma_styles` tool
- Add `review_figma` tool

## Files Created/Modified

### New Files:
- `src/store/figmaStore.ts` - Figma API client with real integration
- `src/tools/syncTokens.ts` - Sync tokens tool
- `src/tools/getComponentDetails.ts` - Get component details tool
- `projects/decibel-website/` - Decibel Website project structure

### Modified Files:
- `src/tools/index.ts` - Registered new Figma tools
