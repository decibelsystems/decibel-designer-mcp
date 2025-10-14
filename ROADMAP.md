# Roadmap

## 🚀 Current Focus: Figma Integration

### Phase 0: Foundation ✅ COMPLETE
**Status:** Shipped in v0.2.0

**Delivered:**
- ✅ Mock Figma data system
- ✅ `figma_components` resource - Lists all components
- ✅ `figma_tokens` resource - Exposes design tokens
- ✅ Smart caching layer (1-hour TTL)
- ✅ Component alias system
- ✅ Development harness without API keys

**See:** `FIGMA_INTEGRATION.md` for details

---

### Phase 1: Core Data Access
**Status:** In Progress (Week 3-4)

**Goals:** Real data, real queries

**Planned Features:**
1. **Real Figma REST API Integration**
   - Connect to Figma Files API
   - Fetch components and variables
   - Handle authentication & rate limiting

2. **`get_component_details` Tool**
   - Deep inspection of individual components
   - Property analysis
   - Style references
   - Usage in variants

3. **`sync_tokens` Tool**
   - Pull design tokens from Figma variables
   - Write to `/projects/<id>/tokens.json`
   - Keep tokens in sync with Figma source of truth

4. **Enhanced Token Resource**
   - Separate `tokens` resource (not nested in components)
   - Direct token value queries
   - Token relationships and aliases

5. **Component Alias System Improvements**
   - Move aliases into resource metadata
   - Fuzzy matching at MCP layer
   - Auto-suggest canonical names

**Example Usage:**
```
"Compare Button/Primary to Button/Secondary"
"Sync our design tokens from Figma"
"What's the current value of primary-purple?"
```

---

### Phase 2: Intelligence Layer
**Status:** Planned (Week 5-6)

**Goals:** Make Claude useful for designers

**Planned Features:**
1. **`generate_documentation` Tool**
   - Auto-generate component docs from Figma
   - Link components to principles via tags
   - Watch mode for auto-regeneration

2. **`review_figma` Tool** (unified review)
   - Frame-level analysis
   - Component change review
   - Accessibility checks (contrast, sizing)
   - Grid alignment verification
   - Principle compliance checking
   - Combines `figma_diff` + `contextual_figma_review`

3. **Severity Levels & Actionability**
   - Error/Warning/Info classification
   - Actionable suggestions
   - Integration with Figma comments API

**Example Usage:**
```
"Review the hero section frame against our principles"
"Generate documentation for all button components"
"Check if the new Card design violates any principles"
```

---

### Phase 3: Advanced Workflows
**Status:** Planned (Week 7-8)

**Goals:** Proactive design system assistance

**Planned Features:**
1. **`review_figma` Enhancements**
   - Version history comparison
   - Multi-frame analysis
   - Batch review workflows

2. **`figma_to_principle` Tool**
   - Pattern analysis across component library
   - Emergent rule detection
   - Principle suggestions with confidence scores
   - Usage frequency data

3. **Component Usage Analytics**
   - Track component usage across files
   - Identify deprecated components
   - Suggest consolidation opportunities
   - Usage heat maps

**Example Usage:**
```
"Analyze our button library and suggest principles"
"Which components are unused or underutilized?"
"Find inconsistencies in our spacing system"
```

---

### Phase 4: Visualization & Polish
**Status:** Planned (Week 9-10)

**Goals:** Beautiful artifacts and comprehensive documentation

**Planned Features:**
1. **Visual Design Graph**
   - Auto-generate from Figma data
   - Interactive SVG with component relationships
   - Usage heat maps
   - Multiple export formats (PNG, SVG, JSON)

2. **Enhanced Documentation**
   - Automated design system docs
   - Component relationship diagrams
   - Token usage examples
   - Integration with existing project docs

3. **Webhook Integration** (Phase 2.5 pull-forward)
   - Real-time Figma change notifications
   - Auto-cache invalidation
   - In-chat design system update alerts

---

## Other Upcoming Features

### `search_all_files` - Cross-File Search
**Status:** Planned for v0.3.0

**Purpose:** Comprehensive full-text search across all project documentation

**Why this matters:**  
Currently `search_guidelines` only searches principles. As projects grow, you need to find information across decisions, notes, briefs, reviews, and moodboards.

**Parameters:**
```typescript
{
  project_id: string,
  query: string,
  file_types?: string[],
  max_results?: number
}
```

**Search scope:**
- `principles.json`, `decisions.md`, `notes.md`, `brief.md`
- `reviews/*.md`, `moodboards/*.json`

---

## Future Considerations

### Figma Future (Phase 5+)
- **Bidirectional Sync:** Write back to Figma (descriptions, comments)
- **Plugin Integration:** Direct Figma plugin for in-app reviews
- **Variant Generation:** Create component variants via natural language
- **Storybook Integration:** Link Figma components to code stories

### General Future
- **Batch Operations:** Multiple principles/decisions in one call
- **Semantic Search:** Vector embeddings for similarity search
- **Multi-Project Analysis:** Cross-project pattern detection
- **Team Collaboration:** Shared principles library

---

## Completed Features

### Core Tools
- ✅ `add_note` - Append notes to project log
- ✅ `log_decision` - Document design decisions with rationale
- ✅ `upsert_principle` - Create/update design principles
- ✅ `search_guidelines` - Search principles by keyword
- ✅ `add_mood_asset` - Add visual references to moodboards
- ✅ `conduct_review` - Run design reviews against principles

### Figma Integration - Phase 0
- ✅ `figma_components` resource - List and query components
- ✅ `figma_tokens` resource - Access design tokens
- ✅ Mock data system for development
- ✅ Caching infrastructure
- ✅ Component alias system

---

**Current Version:** v0.2.0  
**Next Release:** v0.3.0 (Figma Phase 1 + Cross-File Search)
