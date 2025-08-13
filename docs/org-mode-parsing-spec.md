# Org-Mode Parsing Specification for GTD Org Front

## Overview

This document defines the parsing requirements and specifications for integrating org-mode files with the GTD Org Front application. The parser must handle standard org-mode syntax while supporting GTD-specific workflows and properties.

## Supported Org-Mode Elements

### 1. Headlines and Hierarchy

```org
* Level 1 Headline
** Level 2 Headline  
*** Level 3 Headline (max supported depth)
```

**Requirements:**
- Support up to 3 levels of nesting for projects/tasks
- Parse headline text content
- Maintain parent-child relationships
- Extract headline level for proper hierarchy

### 2. TODO Keywords and States

```org
* TODO Task not started
* NEXT Ready to work on
* WAITING Blocked on external dependency
* SOMEDAY Maybe someday
* DONE Completed task
* CANCELED Canceled task
```

**State Mapping:**
- `TODO` → `TaskStatus.TODO`
- `NEXT` → `TaskStatus.NEXT` 
- `WAITING` → `TaskStatus.WAITING`
- `SOMEDAY` → `TaskStatus.SOMEDAY`
- `DONE` → `TaskStatus.DONE`
- `CANCELED` → `TaskStatus.CANCELED`

### 3. Priority Levels

```org
* TODO [#A] High priority task
* TODO [#B] Medium priority task  
* TODO [#C] Low priority task
* TODO Regular task (no priority)
```

**Priority Mapping:**
- `[#A]` → `Priority.A` (High)
- `[#B]` → `Priority.B` (Medium)
- `[#C]` → `Priority.C` (Low)
- No priority → `null`

### 4. Tags

```org
* TODO Task with tags :work:urgent:
* TODO Home task :home:shopping:
* TODO Complex tags :work:dev:frontend:react:
```

**Tag Categories:**
- **Context tags:** `:work:`, `:home:`
- **Action tags:** `:urgent:`, `:waiting:`, `:call:`, `:email:`
- **Area tags:** `:finance:`, `:health:`, `:learning:`, `:dev:`
- **Project tags:** `:website:`, `:app:`, `:marketing:`

### 5. Property Drawers

```org
* TODO Example task
  :PROPERTIES:
  :EFFORT: 2h
  :CONTEXT: work
  :PROJECT: Website Redesign
  :AREA: Marketing
  :COST: 500
  :ASSIGNED: john.doe@company.com
  :END:
```

**Supported Properties:**
- `EFFORT` → Time estimate (hours)
- `CONTEXT` → work/home context override
- `PROJECT` → Project association
- `AREA` → Area/domain classification
- `COST` → Cost estimate (for home context)
- `ASSIGNED` → Person responsible

### 6. Scheduling and Timestamps

```org
* TODO Task with scheduling
  SCHEDULED: <2024-01-15 Mon>
  DEADLINE: <2024-01-20 Sat>

* TODO Recurring task
  SCHEDULED: <2024-01-15 Mon +1w>

* TODO Date range task
  <2024-01-15 Mon>--<2024-01-17 Wed>
```

**Timestamp Types:**
- `SCHEDULED` → When to start working
- `DEADLINE` → Hard deadline
- `Date ranges` → Multi-day tasks
- `Recurring` → Repeating tasks (+1d, +1w, +1m)

### 7. Context Detection

**File-based Context:**
```
~/org/work/
├── projects.org
├── tasks.org
└── meetings.org

~/org/home/
├── personal.org
├── finance.org
├── health.org
└── learning.org
```

**Property-based Context Override:**
```org
* TODO Work task in home file
  :PROPERTIES:
  :CONTEXT: work
  :END:
```

## Parser Architecture

### Lexical Analysis (Tokenization)

```typescript
enum TokenType {
  HEADLINE,
  TODO_KEYWORD,
  PRIORITY,
  TAG,
  PROPERTY_START,
  PROPERTY_LINE,
  PROPERTY_END,
  SCHEDULED,
  DEADLINE,
  TIMESTAMP,
  TEXT,
  NEWLINE
}

interface Token {
  type: TokenType
  value: string
  line: number
  column: number
}
```

### Syntax Parsing (AST Generation)

```typescript
interface OrgNode {
  type: 'headline' | 'property' | 'text'
  level?: number
  content: string
  children: OrgNode[]
  properties: Record<string, string>
  metadata: {
    line: number
    column: number
  }
}
```

### Type Transformation

```typescript
interface ParsedTask {
  rawContent: string
  level: number
  title: string
  status: TaskStatus
  priority: Priority
  tags: string[]
  properties: Record<string, any>
  scheduled?: Date
  deadline?: Date
  context: Context
}
```

## Regular Expression Patterns

### Headlines
```regex
/^(\*+)\s*(?:(TODO|NEXT|WAITING|SOMEDAY|DONE|CANCELED)\s+)?(?:\[#([ABC])\]\s+)?(.*?)(?:\s+(:.+:))?\s*$/
```

### Properties
```regex
/^\s*:([A-Z_]+):\s*(.*)$/
```

### Timestamps
```regex
/<(\d{4}-\d{2}-\d{2})\s+\w{3}(?:\s+\d{1,2}:\d{2})?(?:\s*([+]\d+[dwmy]))?>/
```

### Scheduling
```regex
/^\s*(SCHEDULED|DEADLINE):\s*<(.+?)>\s*$/
```

## Error Handling Strategy

### Graceful Degradation
- **Malformed headlines:** Parse as text content
- **Invalid timestamps:** Use raw text, log warning
- **Missing properties:** Apply defaults
- **Unknown TODO keywords:** Treat as TODO
- **Invalid priorities:** Ignore priority

### Error Types
```typescript
interface ParseError {
  type: 'warning' | 'error'
  message: string
  line: number
  column: number
  context: string
}
```

### Recovery Strategies
- **Encoding issues:** Force UTF-8, fallback to latin1
- **Large files:** Stream parsing for files >1MB
- **Circular references:** Detect and break cycles
- **Property conflicts:** Last property wins

## Performance Requirements

### Benchmarks
- **Small files** (<10KB): <10ms parse time
- **Medium files** (10KB-100KB): <50ms parse time  
- **Large files** (100KB-1MB): <200ms parse time
- **Memory usage:** <2x file size in memory

### Optimization Strategies
- **Lazy parsing:** Parse headlines first, details on demand
- **Caching:** Cache parsed results with file timestamps
- **Incremental parsing:** Re-parse only changed sections
- **Worker threads:** Background parsing for large files

## Testing Requirements

### Unit Tests
- Test each regex pattern individually
- Test edge cases and malformed input
- Test Unicode and special characters
- Test large file performance

### Integration Tests
- Test complete workflow parsing
- Test file watching and updates
- Test error recovery scenarios
- Test memory usage patterns

### Sample Test Files
```
tests/fixtures/
├── basic-gtd.org           # Simple GTD workflow
├── complex-project.org     # Multi-level project
├── malformed.org          # Error cases
├── unicode.org            # International characters
└── large-file.org         # Performance testing
```

## File Encoding and Character Support

### Supported Encodings
- **UTF-8** (primary)
- **UTF-16** (fallback)
- **Latin1** (legacy fallback)

### Special Characters
- **Unicode headlines:** Full Unicode support
- **Emoji in tags:** `:📚learning:`, `:💼work:`
- **Accented characters:** Support for international text
- **Math symbols:** ∑, ∫, √ in task content

## Implementation Priority

1. **Core headline parsing** with TODO keywords
2. **Property drawer parsing** for metadata
3. **Tag extraction** and categorization
4. **Timestamp parsing** for scheduling
5. **Error handling** and recovery
6. **Performance optimization**
7. **Advanced features** (recurring, ranges)

This specification provides the foundation for implementing a robust org-mode parser that handles real-world GTD workflows while maintaining compatibility with standard org-mode files.