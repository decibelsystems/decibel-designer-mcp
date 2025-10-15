# Phase 2 Feature 2: Review Figma

## Overview

The `review_figma` tool analyzes Figma components and frames against the project's design principles, providing actionable feedback with severity levels.

---

## Tool Specification

### Name
`review_figma`

### Description
Review a Figma component or frame against project principles and design system guidelines. Returns structured feedback with severity levels (error/warning/info) and actionable suggestions.

### Parameters
```typescript
{
  project_id: string,           // Required
  component_id: string,         // Required - Figma component ID or name
  review_type?: 'full' | 'accessibility' | 'consistency', // Default: 'full'
  principles?: string[],        // Optional - specific principle IDs to check
  output_format?: 'structured' | 'markdown' // Default: 'structured'
}
```

---

## Review Types

### 1. Full Review (Default)
- Accessibility checks
- Design system consistency
- Principle compliance
- Component completeness

### 2. Accessibility Review
- Color contrast ratios
- Touch target sizes
- Text readability
- Semantic naming

### 3. Consistency Review
- Token usage vs. hardcoded values
- Component naming patterns
- Variant structure
- Spacing adherence

---

## Review Output Structure

### Structured Format (Default)
```typescript
{
  component: {
    id: string,
    name: string,
    type: string
  },
  summary: {
    total_issues: number,
    errors: number,
    warnings: number,
    info: number
  },
  findings: [
    {
      severity: 'error' | 'warning' | 'info',
      category: 'accessibility' | 'consistency' | 'principle',
      title: string,
      description: string,
      suggestion: string,
      principle_id?: string,
      auto_fixable?: boolean
    }
  ],
  passed_checks: string[]
}
```

### Markdown Format
```markdown
# Review: Button/Primary

## Summary
- ✅ 8 checks passed
- ⚠️ 2 warnings
- ❌ 1 error

## Findings

### ❌ Error: Insufficient Color Contrast
**Category:** Accessibility
**Issue:** Text color #888 on #fff background has contrast ratio 2.1:1
**Required:** WCAG AA requires 4.5:1 for normal text
**Suggestion:** Use a darker text color (e.g., #666 for 5.7:1 contrast)
**Related Principle:** accessibility-first

### ⚠️ Warning: Hardcoded Spacing
**Category:** Consistency
**Issue:** Padding uses hardcoded value 16px instead of design token
**Suggestion:** Use token `spacing.md` (16px) for consistency
**Related Principle:** systematic-spacing
```

---

## Implementation Strategy

### Phase 1: Basic Review (MVP)
1. Get component details from Figma
2. Load project principles
3. Run hardcoded checks:
   - Contrast ratio calculation
   - Touch target size (min 44x44)
   - Token usage detection
   - Naming convention check
4. Match findings to principles
5. Return structured results

### Phase 2: Principle-Driven Checks
- Parse principles for checkable patterns
- Dynamic rule generation from principle content
- More sophisticated matching

### Phase 3: AI-Enhanced Review
- Use Claude completion to analyze against principles
- Natural language feedback generation
- Context-aware suggestions

---

## Review Checks

### Accessibility Checks
```typescript
checks: [
  {
    id: 'contrast-ratio',
    name: 'Color Contrast',
    threshold: 4.5, // WCAG AA
    severity: 'error'
  },
  {
    id: 'touch-target',
    name: 'Touch Target Size',
    min_size: 44,
    severity: 'warning'
  },
  {
    id: 'text-size',
    name: 'Readable Text Size',
    min_size: 14,
    severity: 'warning'
  }
]
```

### Consistency Checks
```typescript
checks: [
  {
    id: 'token-usage',
    name: 'Design Token Usage',
    detect: 'hardcoded-values',
    severity: 'warning'
  },
  {
    id: 'naming-convention',
    name: 'Component Naming',
    pattern: /^[A-Z][a-zA-Z]+\/[A-Z][a-zA-Z]+$/,
    severity: 'info'
  },
  {
    id: 'spacing-system',
    name: 'Spacing Adherence',
    allowed_values: [4, 8, 12, 16, 24, 32, 48, 64],
    severity: 'warning'
  }
]
```

---

## Helper Functions

### Contrast Calculation
```typescript
function calculateContrastRatio(color1: FigmaColor, color2: FigmaColor): number {
  // Convert Figma RGB to luminance
  // Calculate WCAG contrast ratio
  // Return ratio (e.g., 4.5)
}
```

### Token Detection
```typescript
function detectHardcodedValues(component: FigmaComponent, tokens: FigmaVariable[]): Finding[] {
  // Compare component styles to available tokens
  // Flag values that should use tokens
}
```

### Principle Matching
```typescript
function matchFindingToPrinciple(finding: Finding, principles: Principle[]): string | undefined {
  // Search principle tags and content
  // Return principle ID if matched
}
```

---

## Example Usage

### Full Review
```json
{
  "tool": "review_figma",
  "params": {
    "project_id": "acme-designsystem",
    "component_id": "Button/Primary"
  }
}
```

### Accessibility Only
```json
{
  "tool": "review_figma",
  "params": {
    "project_id": "acme-designsystem",
    "component_id": "Card/Product",
    "review_type": "accessibility"
  }
}
```

### Specific Principles
```json
{
  "tool": "review_figma",
  "params": {
    "project_id": "acme-designsystem",
    "component_id": "Hero/Homepage",
    "principles": ["accessibility-first", "systematic-spacing"]
  }
}
```

---

## Success Criteria

- [x] Tool executes without errors
- [x] Returns structured findings
- [x] Severity levels correctly assigned
- [x] Accessibility checks functional
- [x] Consistency checks functional
- [x] Principle matching works
- [x] Markdown format renders correctly
- [x] Actionable suggestions provided
- [x] Related principles linked

---

## Future Enhancements

- Version comparison (diff mode)
- Multi-component batch review
- Auto-fix generation
- Figma comments integration
- Visual diff rendering
- Custom check definitions
- Review templates

---

**Status:** Implementation Complete ✅
