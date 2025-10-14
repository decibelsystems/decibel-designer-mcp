# Phase 0 Testing Guide

## ✅ What We Built

Phase 0 is complete! We've created a solid foundation for Figma integration with:

### New Files
1. **`src/store/figmaStore.ts`** - Core Figma data layer (273 lines)
2. **`projects/demo/mocks/figma.json`** - Rich mock data with 5 components, styles, tokens
3. **`projects/demo/cache/`** - Caching infrastructure
4. **`.env.example`** - Environment variable template
5. **`FIGMA_INTEGRATION.md`** - Complete documentation
6. **Updated `ROADMAP.md`** - Progress tracking

### Modified Files
- **`src/resources/index.ts`** - Added `figma-components` and `figma-tokens` resources
- **`.gitignore`** - Excluded cache directories
- **`package.json`** - Bumped version to 0.2.0

## 🧪 Testing Steps

### 1. Build the Project
```bash
cd /Volumes/Ashitaka/Documents/GitHub/decibel-designer-mcp
npm run build
```

Expected: No TypeScript errors, `/dist` directory populated

### 2. Start the Server
```bash
npm run dev
```

Expected output:
```
✅ Decibel Designer is running — connected via stdio
   Ready to serve resources, tools, and prompts...
📦 Using mock Figma data
```

### 3. Test with Claude

Once the MCP server is running and connected to Claude, try these queries:

#### Basic Resource Access
```
"What Figma resources are available?"
"List all Figma components"
```

Expected: Claude should list the components from mock data (Button/Primary, Button/Secondary, Card/Default, Input/Text, Icon/Alert)

#### Component Details
```
"Show me details about Button/Primary"
"What are the properties of the Card component?"
```

Expected: Full component JSON with properties, fills, layout info

#### Alias Resolution
```
"Tell me about the CTA button"
"What's the main-button component?"
```

Expected: Should resolve to Button/Primary via aliases

#### Token Queries
```
"What design tokens are available?"
"Show me the color tokens"
"What's the value of primary-purple?"
```

Expected: Lists of tokens with values and code syntax

#### Comparison Queries
```
"Compare Button/Primary and Button/Secondary"
"What's the difference between primary and secondary buttons?"
```

Expected: Claude should fetch both components and compare properties

## 🐛 Troubleshooting

### Build Fails
**Issue:** TypeScript compilation errors

**Fix:**
```bash
npm install
npm run build
```

Check for:
- Missing dependencies
- TypeScript version compatibility
- Import path issues

### Resources Not Appearing
**Issue:** Claude doesn't see Figma resources

**Fixes:**
1. Ensure server is running (`npm run dev`)
2. Check that you're in the correct Claude project
3. Verify connection in server logs
4. Restart Claude Desktop app

### Mock Data Not Found
**Issue:** "Failed to read mock Figma data" error

**Fix:**
Verify file exists:
```bash
ls -la projects/demo/mocks/figma.json
```

If missing, the file should have been created in Phase 0. Check git status.

### Cache Issues
**Issue:** Stale data or cache errors

**Fix:**
```bash
rm -rf projects/demo/cache/figma-components.json
```

Cache will rebuild on next query.

## ✨ Success Criteria

Phase 0 is working correctly if:

- ✅ Build completes without errors
- ✅ Server starts and shows "Using mock Figma data"
- ✅ Claude can list Figma components
- ✅ Component details return full JSON
- ✅ Token queries work for all categories (colors, spacing, borderRadius)
- ✅ Aliases resolve correctly (cta → Button/Primary)
- ✅ Cache file is created in `projects/demo/cache/`

## 📝 What's Next

### Immediate Next Steps
1. Test all queries above
2. Note any issues or unexpected behavior
3. Verify cache is working (check file timestamp)

### Phase 1 Planning
Once Phase 0 is validated, we'll implement:
- Real Figma API integration
- `get_component_details` tool
- `sync_tokens` tool
- Enhanced token resource

### Optional Enhancements
If you want to extend Phase 0 before moving to Phase 1:
- Add more mock components
- Create variant examples
- Add more detailed component properties
- Test with multiple projects

## 🎯 Expected Behavior Examples

### Query: "List all Figma components"
**Response:**
```
Available Figma components:
1. Button/Primary - Primary action button for main CTAs
2. Button/Secondary - Secondary button for less prominent actions
3. Card/Default - Content card with optional header, body, and footer
4. Input/Text - Text input field with label and validation states
5. Icon/Alert - Alert icon for warning messages
```

### Query: "Show me Button/Primary details"
**Response:**
```json
{
  "id": "1:100",
  "name": "Button/Primary",
  "description": "Primary action button for main CTAs",
  "properties": {
    "cornerRadius": 8,
    "paddingLeft": 24,
    "paddingRight": 24,
    ...
  },
  "textStyle": "Label/Medium",
  "autoLayout": {
    "mode": "HORIZONTAL",
    "primaryAxisAlignItems": "CENTER",
    ...
  }
}
```

### Query: "What's the value of primary-purple?"
**Response:**
```
The primary-purple token has these values:
- RGB: { r: 0.4, g: 0.2, b: 0.6, a: 1 }
- Usage: ALL_FILLS, ALL_STROKES
- Code syntax:
  - WEB: var(--primary-purple)
  - Android: colors.primary_purple
  - iOS: Color.primaryPurple
```

## 📊 Success Metrics

Track these to validate Phase 0:
- [ ] Components list correctly from mock data
- [ ] Individual component details fetch without errors
- [ ] Aliases resolve to correct components
- [ ] All token categories accessible (colors, spacing, borderRadius)
- [ ] Cache files created and used (1-hour TTL)
- [ ] No TypeScript compilation errors
- [ ] Server runs without crashes

## 🚀 Ready to Test?

1. Build: `npm run build`
2. Start: `npm run dev`
3. Open Claude Desktop
4. Try the test queries above
5. Report any issues

**Questions or problems?** Check `FIGMA_INTEGRATION.md` for detailed documentation.

---

**Phase 0 Status:** ✅ Complete and ready for testing
**Next Milestone:** Phase 1 - Real Figma API integration
