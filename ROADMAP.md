# Roadmap

## Upcoming Features

### `search_all_files` - Cross-File Search
**Status:** Planned for next release

**Purpose:** Comprehensive full-text search across all project documentation

**Why this matters:**  
Currently `search_guidelines` only searches principles. As projects grow, you need to find information across decisions, notes, briefs, reviews, and moodboards. This provides one unified search interface.

**Parameters:**
```typescript
{
  project_id: string,
  query: string,              // Search terms
  file_types?: string[],      // Optional filter: ["principles", "decisions", "notes", "briefs", "reviews", "moodboards"]
  max_results?: number        // Default: 10
}
```

**Search scope:**
- `principles.json` - title, body, tags
- `decisions.md` - all content
- `notes.md` - all content
- `brief.md` - all content (if exists)
- `reviews/*.md` - all review sessions
- `moodboards/*.json` - titles, notes, tags

**Return format:**
```typescript
{
  results: [
    {
      file: "principles.json",
      type: "principle",
      match: "Clarity First: Every element serves comprehension...",
      context: "...surrounding text for context...",
      id: "clarity-first"  // if applicable
    },
    {
      file: "decisions.md",
      type: "decision",
      match: "## Color Palette Decision\nRationale: Red creates urgency...",
      context: "...",
      line: 15  // line number for markdown files
    }
  ]
}
```

**Implementation approach:**
- Case-insensitive full-text search
- Highlight/truncate matches with surrounding context (±50 chars)
- Ranking: exact phrase match > all words present > partial match
- Return file path, type, and enough context for Claude to understand relevance

**Example usage:**
```
> "Search all files for 'typography hierarchy'"
> "Find anything mentioning 'mobile layout'"
> "Show me all content about the color palette decision"
```

---

## Future Considerations

### Batch Operations
Add ability to insert multiple principles/decisions in a single call for efficiency when extracting from brainstorms or transcripts.

### Semantic Search (v2)
If demand grows, consider adding vector embeddings for semantic similarity search. Would require:
- Vector store integration
- Index maintenance on file changes
- Similarity computation

Current recommendation: Keep it simple with full-text search and let Claude handle semantic interpretation of results.

---

## Completed Features

- ✅ `add_note` - Append notes to project log
- ✅ `log_decision` - Document design decisions with rationale
- ✅ `upsert_principle` - Create/update design principles
- ✅ `search_guidelines` - Search principles by keyword
- ✅ `add_mood_asset` - Add visual references to moodboards
- ✅ `conduct_review` - Run design reviews against established principles
