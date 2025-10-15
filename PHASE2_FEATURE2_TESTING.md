# Testing: review_figma Tool

Test the Figma component review feature to ensure all check types work correctly.

---

## Prerequisites

1. ✅ Phase 1 complete (Figma data available)
2. ✅ Phase 2 Feature 1 complete (documentation generated)
3. ✅ Project has principles defined
4. ✅ Project has Figma components
5. ✅ Server running with MCP client

---

## Test 1: Full Review (Default)

**Command:**
```json
{
  "tool": "review_figma",
  "params": {
    "project_id": "acme-designsystem",
    "component_id": "Button/Primary"
  }
}
```

**Expected Result:**
Structured JSON output with:
- [ ] Component info (id, name, type)
- [ ] Summary (total_issues, errors, warnings, info counts)
- [ ] Findings array with severity levels
- [ ] Passed checks array

**Sample Output:**
```json
{
  "component": {
    "id": "123:456",
    "name": "Button/Primary",
    "type": "component"
  },
  "summary": {
    "total_issues": 2,
    "errors": 0,
    "warnings": 1,
    "info": 1
  },
  "findings": [
    {
      "severity": "warning",
      "category": "consistency",
      "title": "Naming Convention Violation",
      "description": "...",
      "suggestion": "...",
      "principle_id": "consistency-first"
    }
  ],
  "passed_checks": [
    "Component has semantic name",
    "Component follows naming convention"
  ]
}
```

---

## Test 2: Markdown Output Format

**Command:**
```json
{
  "tool": "review_figma",
  "params": {
    "project_id": "acme-designsystem",
    "component_id": "Button/Primary",
    "output_format": "markdown"
  }
}
```

**Expected Result:**
Formatted markdown with:
- [ ] Component name as H1 header
- [ ] Summary section with check counts
- [ ] Findings section with severity icons (❌ ⚠️ ℹ️)
- [ ] Passed checks section
- [ ] Proper markdown formatting

**Sample Output:**
```markdown
# Review: Button/Primary

## Summary
- ✅ 3 checks passed
- ⚠️  1 warning(s)
- ℹ️  1 info

## Findings

### ⚠️ Warning: Naming Convention Violation
**Category:** Consistency
**Issue:** Component name "button-primary" doesn't follow the naming pattern
**Suggestion:** Use PascalCase with optional variant: ComponentName/Variant
**Related Principle:** consistency-first

## Passed Checks

- ✅ Component has semantic name
- ✅ Component has adequate description
```

---

## Test 3: Accessibility Review Only

**Command:**
```json
{
  "tool": "review_figma",
  "params": {
    "project_id": "acme-designsystem",
    "component_id": "Hero/Homepage",
    "review_type": "accessibility"
  }
}
```

**Expected Behavior:**
- [ ] Only runs accessibility checks
- [ ] Skips consistency checks
- [ ] Reports on:
  - Component descriptions
  - Semantic naming
- [ ] Matches to accessibility principles

---

## Test 4: Consistency Review Only

**Command:**
```json
{
  "tool": "review_figma",
  "params": {
    "project_id": "acme-designsystem",
    "component_id": "Card/Product",
    "review_type": "consistency"
  }
}
```

**Expected Behavior:**
- [ ] Only runs consistency checks
- [ ] Skips accessibility checks
- [ ] Reports on:
  - Naming conventions
  - Tag usage
- [ ] Matches to consistency principles

---

## Test 5: Specific Principles Filter

**Command:**
```json
{
  "tool": "review_figma",
  "params": {
    "project_id": "acme-designsystem",
    "component_id": "Button/Primary",
    "principles": ["accessibility-first", "systematic-naming"]
  }
}
```

**Expected Behavior:**
- [ ] Only matches findings to specified principles
- [ ] Other principles ignored for matching
- [ ] Findings still generated for all checks
- [ ] `principle_id` field only references specified principles

---

## Test 6: Component Not Found

**Command:**
```json
{
  "tool": "review_figma",
  "params": {
    "project_id": "acme-designsystem",
    "component_id": "NonExistentComponent"
  }
}
```

**Expected Result:**
```
❌ Component "NonExistentComponent" not found
```

**Validation:**
- [ ] Error message clear
- [ ] Tool doesn't crash
- [ ] No findings generated

---

## Test 7: Component with Issues

Test with a component that should trigger warnings:

**Setup:**
Create a component in mock data with issues:
- Generic name like "Frame 1"
- No description
- No tags

**Expected Findings:**
- [ ] Warning: Generic component name
- [ ] Info: Missing description
- [ ] Info: No tags assigned
- [ ] Fewer passed checks

---

## Test 8: Component with Good Practices

Test with a well-structured component:

**Setup:**
Component that has:
- Proper name: "NavigationMenu/Primary"
- Good description (>10 chars)
- Multiple tags

**Expected Result:**
- [ ] No warnings or errors
- [ ] Only info-level suggestions (if any)
- [ ] More passed checks
- [ ] Summary shows mostly clean

---

## Test 9: Principle Matching

**Prerequisites:**
Create a principle with tags/keywords like "accessibility", "naming", "consistency"

**Expected Behavior:**
- [ ] Findings correctly match to principles
- [ ] `principle_id` field populated when match found
- [ ] Multiple keywords increase matching accuracy
- [ ] No principle match returns undefined/null

---

## Test 10: Review Types Comparison

Run the same component through all three review types:

**Commands:**
1. Full review
2. Accessibility review
3. Consistency review

**Validation:**
- [ ] Full review = accessibility + consistency findings
- [ ] Accessibility review only shows accessibility findings
- [ ] Consistency review only shows consistency findings
- [ ] Passed checks differ between types
- [ ] Summary counts are accurate for each type

---

## Validation Checklist

After running all tests:

### Tool Functionality
- [ ] Tool executes without errors
- [ ] Component lookup works
- [ ] Principle loading works
- [ ] Findings generated correctly
- [ ] Severity levels assigned properly
- [ ] Both output formats work

### Review Types
- [ ] Full review runs all checks
- [ ] Accessibility review filters correctly
- [ ] Consistency review filters correctly
- [ ] Appropriate checks for each type

### Output Quality
- [ ] Structured JSON is valid
- [ ] Markdown renders correctly
- [ ] Severity icons display properly
- [ ] Messages are clear and actionable
- [ ] Suggestions are helpful

### Principle Integration
- [ ] Principles loaded from project
- [ ] Keyword matching works
- [ ] Principle IDs linked correctly
- [ ] Specific principles filter works

### Edge Cases
- [ ] Component not found handled gracefully
- [ ] Empty principles list handled
- [ ] Components with minimal data work
- [ ] No crashes or undefined errors

---

## Common Issues

### No Findings Generated
- Check component exists in Figma data
- Verify principles are defined
- Ensure checks are appropriate for component type

### Principle Matching Not Working
- Check principle has relevant tags/keywords
- Verify keywords in matching logic
- Check principle ID format

### Markdown Format Issues
- Verify emojis render correctly
- Check markdown syntax
- Test in markdown viewer

### Review Type Not Filtering
- Verify review_type parameter
- Check conditional logic in tool
- Ensure checks have correct categories

---

## Success Criteria

The review_figma tool is working correctly when:

1. ✅ All review types execute successfully
2. ✅ Findings categorized by severity (error/warning/info)
3. ✅ Findings categorized by type (accessibility/consistency)
4. ✅ Principle matching identifies relevant principles
5. ✅ Both output formats produce correct results
6. ✅ Passed checks are tracked and reported
7. ✅ Error handling for missing components
8. ✅ Clear, actionable suggestions provided
9. ✅ Summary statistics accurate

---

**Phase 2 Feature 2 Testing Status:** Ready for validation! ✅
