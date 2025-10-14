# Figma Integration - Phase 0 Complete ✅

## What We Built

Phase 0 establishes the foundation for Figma integration with Decibel Designer, allowing the MCP server to work with Figma components in both mock and live API modes.

### Files Created

1. **`projects/demo/mocks/figma.json`** - Comprehensive mock Figma data
   - 5 sample components (Button/Primary, Button/Secondary, Card/Default, Input/Text, Icon/Alert)
   - Text and color styles
   - Design tokens (colors, spacing, borderRadius)
   - Component aliases for fuzzy matching

2. **`src/store/figmaStore.ts`** - Core Figma data access layer
   - Mock mode support (enabled by default)
   - Caching system (1-hour TTL)
   - Component lookup by ID, name, or alias
   - Token management
   - Cache invalidation utilities

3. **`src/resources/index.ts`** (updated) - MCP resources registration
   - `figma-components` resource - Lists all Figma components
   - `figma-tokens` resource - Exposes design tokens by category
   - Both resources support URI-based access (e.g., `figma://component/1:100`)

4. **`.env.example`** - Environment variable template
   - `FIGMA_API_KEY` - Your Figma personal access token
   - `FIGMA_FILE_KEY` - File ID from Figma URL
   - `FIGMA_MOCK_MODE` - Toggle mock/live data (defaults to true)

5. **`projects/demo/cache/`** - Cache directory structure
   - Stores API responses to reduce rate limiting
   - Automatically managed, git-ignored

### Features Implemented

✅ **Mock Mode** - Development without API keys
✅ **Smart Caching** - 1-hour TTL with manual invalidation
✅ **Component Lookup** - By ID, name, or alias
✅ **Token Management** - Access colors, spacing, radii
✅ **MCP Resources** - Claude can query components and tokens
✅ **Alias Support** - Fuzzy matching (e.g., "cta" → "Button/Primary")

## How to Use

### Quick Start with Mock Data

1. Build the project:
   ```bash
   npm run build
   ```

2. Start the server:
   ```bash
   npm run dev
   ```

3. Query Figma components from Claude:
   ```
   "List all Figma components"
   "Show me the Button/Primary component details"
   "What design tokens are available?"
   "What's the value of the primary-purple color token?"
   ```

### Using Real Figma API (Phase 1)

1. Get your Figma API key from https://www.figma.com/developers/api#access-tokens

2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env`:
   ```
   FIGMA_API_KEY=your-key-here
   FIGMA_FILE_KEY=your-file-key-here
   FIGMA_MOCK_MODE=false
   ```

4. Restart the server

Note: Real Figma API integration is planned for Phase 1.

## Architecture Decisions

### Why Mock-First?
- Zero API rate limit concerns during development
- Faster iteration on MCP server logic
- Consistent test data for examples
- No Figma account needed to try the integration

### Caching Strategy
- **TTL:** 1 hour (configurable)
- **Location:** `projects/{id}/cache/figma-components.json`
- **Invalidation:** Manual via `invalidateCache()` function
- **Future:** Webhook-based auto-refresh (Phase 2.5)

### Alias System
Mock data includes common aliases:
- `cta`, `primary-button`, `main-button` → `Button/Primary`
- `panel`, `container` → `Card/Default`
- `text-input`, `field` → `Input/Text`

This prevents Claude from inventing component names and maps natural language to canonical names.

## Testing the Integration

### Test Queries for Claude

1. **List components:**
   ```
   "Show me all available Figma components"
   ```

2. **Get component details:**
   ```
   "Give me details about Button/Primary"
   "What are the properties of the Card component?"
   ```

3. **Query with aliases:**
   ```
   "Show me the CTA button" (should resolve to Button/Primary)
   "What's in the panel component?" (should resolve to Card/Default)
   ```

4. **Access tokens:**
   ```
   "What color tokens are available?"
   "What's the value of spacing-md?"
   "List all border radius tokens"
   ```

5. **Compare components:**
   ```
   "Compare Button/Primary and Button/Secondary"
   "What's the difference between the primary and secondary buttons?"
   ```

## What's Next: Phase 1

Phase 1 will add:
- Real Figma REST API integration
- `get_component_details` tool for deep inspection
- `sync_tokens` tool to write tokens to project files
- Separate `tokens` resource (not nested in components)
- Component comparison capabilities
- Enhanced caching with longer TTLs for tokens

## Troubleshooting

### "Mock data not found"
Ensure `/projects/demo/mocks/figma.json` exists. This file was created in Phase 0.

### "Module not found" errors
Run `npm install` and `npm run build` to ensure dependencies and TypeScript compilation are up to date.

### Cache not updating
Call `invalidateCache()` from the Figma store, or delete `projects/demo/cache/figma-components.json` manually.

### Resources not appearing in Claude
1. Restart the MCP server
2. Check that resources are registered in `src/resources/index.ts`
3. Verify the server connects successfully (check console output)

## Files Modified

- `src/resources/index.ts` - Added Figma resources
- `.gitignore` - Added cache directory exclusion

## Files Added

- `src/store/figmaStore.ts` - Core Figma integration
- `projects/demo/mocks/figma.json` - Mock data
- `projects/demo/cache/.gitkeep` - Cache directory marker
- `.env.example` - Environment variable template
- `FIGMA_INTEGRATION.md` - This file!

---

**Status:** ✅ Phase 0 Complete - Mock mode fully functional
**Next:** Phase 1 - Real API integration & component tools
