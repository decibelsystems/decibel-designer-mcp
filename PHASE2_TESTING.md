# Phase 2 Testing Guide

Test the auto-documentation feature to ensure all doc types generate correctly.

---

## Prerequisites

1. ✅ Phase 1 complete (mock data or API working)
2. ✅ Project exists in `./projects/` directory
3. ✅ Server running with MCP client

---

## Test 1: Generate All Documentation

**Command:**
```json
{
  "tool": "generate_documentation",
  "params": {
    "project_id": "acme-designsystem",
    "include_tokens": true,
    "include_components": true,
    "include_overview": true
  }
}
```

**Expected Result:**
```
✅ Generated 3 documentation files:
- design-tokens.md
- components.md
- README.md

📁 Location: /projects/acme-designsystem/documentation/
```

**Validation:**
- [ ] Documentation directory created
- [ ] Three files exist in the directory
- [ ] Files contain properly formatted markdown
- [ ] No errors or warnings

---

## Test 2: Verify Design Tokens Documentation

**Check File:**
```bash
cat projects/acme-designsystem/documentation/design-tokens.md
```

**Expected Content:**
- [ ] Header: "# Design Tokens"
- [ ] Auto-generation note
- [ ] Token categories as H2 headers (Colors, Spacing, etc.)
- [ ] Individual tokens as H3 headers
- [ ] Token details: Type, Figma ID, Value
- [ ] Proper markdown formatting with code blocks
- [ ] Section dividers

**Sample Structure:**
```markdown
# Design Tokens

_Auto-generated from Figma design system_

---

## Colors

### Primary Blue
- **Type:** COLOR
- **Figma ID:** `VariableID:123`
- **Value:** `{"r":0.2,"g":0.4,"b":0.8,"a":1}`

---
```

---

## Test 3: Verify Components Documentation

**Check File:**
```bash
cat projects/acme-designsystem/documentation/components.md
```

**Expected Content:**
- [ ] Header: "# Components"
- [ ] Auto-generation note
- [ ] Each component as H2 header
- [ ] Component descriptions (if available)
- [ ] Figma IDs for each component
- [ ] Tags (if available)
- [ ] Section dividers

**Sample Structure:**
```markdown
# Components

_Auto-generated from Figma component library_

---

## Button
Primary action button component

- **Figma ID:** `123:456`
- **Tags:** interactive, core

---
```

---

## Test 4: Verify Overview Documentation

**Check File:**
```bash
cat projects/acme-designsystem/documentation/README.md
```

**Expected Content:**
- [ ] Header: "# Design System Overview"
- [ ] Last updated timestamp
- [ ] Summary section with stats
- [ ] Component count
- [ ] Token category count
- [ ] Token breakdown by category
- [ ] Links to other documentation files

**Sample Structure:**
```markdown
# Design System Overview

_Auto-generated documentation from Figma_

**Last updated:** 10/14/2025

---

## Summary

- **Components:** 15
- **Token Categories:** 4

### Token Breakdown

- **Colors:** 8 tokens
- **Spacing:** 6 tokens
- **Typography:** 4 tokens

---

## Documentation

- [Design Tokens](./design-tokens.md)
- [Components](./components.md)
```

---

## Test 5: Selective Generation

Test generating only tokens:

```json
{
  "tool": "generate_documentation",
  "params": {
    "project_id": "acme-designsystem",
    "include_tokens": true,
    "include_components": false,
    "include_overview": false
  }
}
```

**Expected:**
- [ ] Only `design-tokens.md` generated
- [ ] Success message shows 1 file
- [ ] Other files not created/modified

---

## Test 6: Re-generation

Generate docs twice to test overwriting:

1. Run `generate_documentation` once
2. Run `generate_documentation` again
3. Check files updated (timestamps change)

**Expected:**
- [ ] Files overwritten successfully
- [ ] No errors about existing files
- [ ] Content updates properly

---

## Test 7: Empty Design System

Test with project that has no components/tokens:

**Expected Behavior:**
- [ ] Tool still succeeds
- [ ] Files created
- [ ] Graceful messages like "_No components found_"
- [ ] No crashes or errors

---

## Test 8: Mock Mode vs API Mode

Test in both modes:

**Mock Mode:**
```bash
FIGMA_MOCK_MODE=true npm run dev
```

**API Mode:**
```bash
FIGMA_API_KEY=xxx FIGMA_FILE_KEY=yyy npm run dev
```

**Expected:**
- [ ] Both modes work
- [ ] Documentation generated correctly in both
- [ ] Format identical regardless of source

---

## Checklist Summary

After running all tests:

- [ ] All three doc types generate
- [ ] Markdown formatting correct
- [ ] Token categorization works
- [ ] Component details included
- [ ] Overview statistics accurate
- [ ] Selective generation works
- [ ] Re-generation overwrites properly
- [ ] Empty systems handled gracefully
- [ ] Mock and API modes both work
- [ ] No errors or warnings
- [ ] Files in correct location
- [ ] Professional, readable output

---

## Common Issues

### Files Not Generated
- Check project exists in `./projects/`
- Verify permissions on projects directory
- Check server logs for errors

### Missing Content
- Ensure Phase 1 sync ran first
- Check `design-tokens.json` exists
- Verify cache has data

### Formatting Issues
- Check markdown syntax in generated files
- Validate with markdown linter
- Test rendering in markdown viewer

---

**Phase 2 Testing Status:** Ready for validation! ✅
