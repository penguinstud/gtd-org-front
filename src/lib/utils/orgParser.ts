import { Task, Project, TaskStatus, Priority, Context, ParseResult, ParseError } from '../types'

// Regular expression patterns for org-mode parsing
export const ORG_PATTERNS = {
  // Headlines with optional TODO keyword, priority, title, and tags
  // Example: "** TODO [#A] Task title :tag1:tag2:"
  HEADLINE: /^(\*+)\s*(?:(TODO|NEXT|WAITING|SOMEDAY|DONE|CANCELED)\s+)?(?:\[#([ABC])\]\s+)?(.*?)(?:\s+(:.+:))?\s*$/,
  
  // Property drawer boundaries
  PROPERTY_START: /^\s*:PROPERTIES:\s*$/,
  PROPERTY_END: /^\s*:END:\s*$/,
  
  // Individual property lines
  // Example: ":EFFORT: 2h" or ":CONTEXT: work"
  PROPERTY_LINE: /^\s*:([A-Z_]+):\s*(.*)$/,
  
  // Scheduling and deadline lines
  // Example: "SCHEDULED: <2024-01-15 Mon>" or "DEADLINE: <2024-01-20 Sat>"
  SCHEDULING: /^\s*(SCHEDULED|DEADLINE):\s*<(.+?)>\s*$/,
  
  // Timestamp parsing with optional time and recurrence
  // Example: "<2024-01-15 Mon 09:00>", "<2024-01-15 Mon +1w>"
  TIMESTAMP: /<(\d{4}-\d{2}-\d{2})\s+\w{3}(?:\s+(\d{1,2}:\d{2}))?(?:\s*([+]\d+[dwmy]))?>/,
  
  // Date range parsing
  // Example: "<2024-01-15 Mon>--<2024-01-17 Wed>"
  DATE_RANGE: /<(\d{4}-\d{2}-\d{2})\s+\w{3}(?:\s+\d{1,2}:\d{2})?>\s*--\s*<(\d{4}-\d{2}-\d{2})\s+\w{3}(?:\s+\d{1,2}:\d{2})?>/,
  
  // Tag extraction from tag string
  // Example: ":work:urgent:dev:" -> ["work", "urgent", "dev"]
  TAGS: /:([^:]+):/g,
  
  // Effort estimation parsing
  // Example: "2h", "30m", "1.5h"
  EFFORT: /^(\d+(?:\.\d+)?)\s*([hm])?$/,
  
  // Priority extraction
  PRIORITY: /\[#([ABC])\]/,
}

// Token types for lexical analysis
export enum TokenType {
  HEADLINE = 'HEADLINE',
  TODO_KEYWORD = 'TODO_KEYWORD',
  PRIORITY = 'PRIORITY',
  TAG = 'TAG',
  PROPERTY_START = 'PROPERTY_START',
  PROPERTY_LINE = 'PROPERTY_LINE',
  PROPERTY_END = 'PROPERTY_END',
  SCHEDULED = 'SCHEDULED',
  DEADLINE = 'DEADLINE',
  TIMESTAMP = 'TIMESTAMP',
  TEXT = 'TEXT',
  NEWLINE = 'NEWLINE',
  EOF = 'EOF'
}

export interface Token {
  type: TokenType
  value: string
  line: number
  column: number
}


export interface OrgNode {
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

export interface ParsedTask {
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
  description?: string
}


/**
 * Lexical analyzer for org-mode content
 */
export class OrgLexer {
  private content: string
  private position: number = 0
  private line: number = 1
  private column: number = 1
  private tokens: Token[] = []

  constructor(content: string) {
    this.content = content
  }

  tokenize(): Token[] {
    this.tokens = []
    this.position = 0
    this.line = 1
    this.column = 1

    while (this.position < this.content.length) {
      this.scanToken()
    }

    this.addToken(TokenType.EOF, '')
    return this.tokens
  }

  private scanToken(): void {
    const line = this.getCurrentLine()
    
    if (line.trim() === '') {
      this.addToken(TokenType.NEWLINE, line)
      this.nextLine()
      return
    }

    // Check for headlines
    const headlineMatch = line.match(ORG_PATTERNS.HEADLINE)
    if (headlineMatch) {
      this.addToken(TokenType.HEADLINE, line)
      this.nextLine()
      return
    }

    // Check for property drawer boundaries
    if (ORG_PATTERNS.PROPERTY_START.test(line)) {
      this.addToken(TokenType.PROPERTY_START, line)
      this.nextLine()
      return
    }

    if (ORG_PATTERNS.PROPERTY_END.test(line)) {
      this.addToken(TokenType.PROPERTY_END, line)
      this.nextLine()
      return
    }

    // Check for property lines
    const propertyMatch = line.match(ORG_PATTERNS.PROPERTY_LINE)
    if (propertyMatch) {
      this.addToken(TokenType.PROPERTY_LINE, line)
      this.nextLine()
      return
    }

    // Check for scheduling
    const schedulingMatch = line.match(ORG_PATTERNS.SCHEDULING)
    if (schedulingMatch) {
      const [, type] = schedulingMatch
      this.addToken(type === 'SCHEDULED' ? TokenType.SCHEDULED : TokenType.DEADLINE, line)
      this.nextLine()
      return
    }

    // Default to text
    this.addToken(TokenType.TEXT, line)
    this.nextLine()
  }

  private getCurrentLine(): string {
    const lineEnd = this.content.indexOf('\n', this.position)
    if (lineEnd === -1) {
      return this.content.slice(this.position)
    }
    return this.content.slice(this.position, lineEnd)
  }

  private nextLine(): void {
    const lineEnd = this.content.indexOf('\n', this.position)
    if (lineEnd === -1) {
      this.position = this.content.length
    } else {
      this.position = lineEnd + 1
      this.line++
      this.column = 1
    }
  }

  private addToken(type: TokenType, value: string): void {
    this.tokens.push({
      type,
      value,
      line: this.line,
      column: this.column
    })
  }
}

/**
 * Parse headline text to extract TODO keyword, priority, title, and tags
 */
export function parseHeadline(headline: string): {
  level: number
  todoKeyword?: string
  priority?: Priority
  title: string
  tags: string[]
} {
  const match = headline.match(ORG_PATTERNS.HEADLINE)
  if (!match) {
    return {
      level: 1,
      title: headline.trim(),
      tags: []
    }
  }

  const [, stars, todoKeyword, priority, title, tagString] = match

  const tags: string[] = []
  if (tagString) {
    let tagMatch
    while ((tagMatch = ORG_PATTERNS.TAGS.exec(tagString)) !== null) {
      tags.push(tagMatch[1])
    }
  }

  return {
    level: stars.length,
    todoKeyword,
    priority: priority as Priority || null,
    title: title.trim(),
    tags
  }
}

/**
 * Parse property drawer content
 */
export function parseProperties(propertyLines: string[]): Record<string, any> {
  const properties: Record<string, any> = {}

  for (const line of propertyLines) {
    const match = line.match(ORG_PATTERNS.PROPERTY_LINE)
    if (match) {
      const [, key, value] = match
      
      // Transform specific property values
      switch (key.toUpperCase()) {
        case 'EFFORT':
          properties.effort = parseEffort(value.trim())
          break
        case 'COST':
          properties.cost = parseFloat(value.trim()) || 0
          break
        case 'CONTEXT':
          properties.context = value.trim().toLowerCase() as Context
          break
        default:
          properties[key.toLowerCase()] = value.trim()
      }
    }
  }

  return properties
}

/**
 * Parse effort estimates (e.g., "2h", "30m", "1.5h")
 */
export function parseEffort(effort: string): number {
  const match = effort.match(ORG_PATTERNS.EFFORT)
  if (!match) return 0

  const [, amount, unit] = match
  const value = parseFloat(amount)

  switch (unit) {
    case 'h':
      return value
    case 'm':
      return value / 60
    default:
      return value // Assume hours if no unit
  }
}

/**
 * Parse timestamps and scheduling information
 */
export function parseTimestamp(timestamp: string): Date | null {
  const match = timestamp.match(ORG_PATTERNS.TIMESTAMP)
  if (!match) return null

  const [, dateStr, timeStr] = match
  const date = new Date(dateStr)
  
  if (timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number)
    date.setHours(hours, minutes)
  }

  return isNaN(date.getTime()) ? null : date
}

/**
 * Map TODO keywords to TaskStatus
 */
export function mapTodoKeywordToStatus(keyword?: string): TaskStatus {
  switch (keyword?.toUpperCase()) {
    case 'TODO': return 'TODO'
    case 'NEXT': return 'NEXT'
    case 'WAITING': return 'WAITING'
    case 'SOMEDAY': return 'SOMEDAY'
    case 'DONE': return 'DONE'
    case 'CANCELED': return 'CANCELED'
    default: return 'TODO'
  }
}

/**
 * Determine context from file path
 */
export function determineContextFromPath(filePath: string): Context {
  if (filePath.includes('/work/') || filePath.includes('\\work\\')) {
    return 'work'
  }
  if (filePath.includes('/home/') || filePath.includes('\\home\\')) {
    return 'home'
  }
  
  // Default fallback
  return 'work'
}

/**
 * Generate unique ID for tasks
 */
export function generateTaskId(title: string, filePath: string, line: number): string {
  const hash = title + filePath + line
  return btoa(hash).replace(/[^a-zA-Z0-9]/g, '').substring(0, 12)
}

/**
 * Main org-mode parser class that handles the complete parsing workflow
 */
export class OrgParser {
  private errors: ParseError[] = []
  private context: Context = 'work'

  constructor(private filePath: string) {
    this.context = determineContextFromPath(filePath)
  }

  /**
   * Parse org-mode content and return structured data
   */
  parse(content: string): ParseResult {
    this.errors = []
    
    try {
      const lexer = new OrgLexer(content)
      const tokens = lexer.tokenize()
      
      const parsedItems = this.parseTokens(tokens)
      const tasks = parsedItems.filter(item => item.level > 1 || item.status !== 'TODO')
      const projects = parsedItems.filter(item => item.level === 1 && !item.status)

      return {
        tasks: tasks.map(item => this.transformToTask(item)),
        projects: projects.map(item => this.transformToProject(item)),
        errors: this.errors,
        metadata: {
          filePath: this.filePath,
          lastModified: new Date(),
          lineCount: content.split('\n').length,
          context: this.context
        }
      }
    } catch (error) {
      this.addError('error', `Failed to parse file: ${(error as Error).message}`, 0, 0, content.substring(0, 100))
      return {
        tasks: [],
        projects: [],
        errors: this.errors,
        metadata: {
          filePath: this.filePath,
          lastModified: new Date(),
          lineCount: content.split('\n').length,
          context: this.context
        }
      }
    }
  }

  /**
   * Parse tokens into structured items
   */
  private parseTokens(tokens: Token[]): ParsedTask[] {
    const items: ParsedTask[] = []
    let i = 0

    while (i < tokens.length) {
      const token = tokens[i]
      
      if (token.type === TokenType.HEADLINE) {
        const { item, nextIndex } = this.parseHeadlineWithProperties(tokens, i)
        if (item) {
          items.push(item)
        }
        i = nextIndex
      } else {
        i++
      }
    }

    return items
  }

  /**
   * Parse a headline with its associated properties and scheduling
   */
  private parseHeadlineWithProperties(tokens: Token[], startIndex: number): {
    item: ParsedTask | null
    nextIndex: number
  } {
    const headlineToken = tokens[startIndex]
    const parsedHeadline = parseHeadline(headlineToken.value)
    
    if (!parsedHeadline.title) {
      return { item: null, nextIndex: startIndex + 1 }
    }

    let i = startIndex + 1
    const propertyLines: string[] = []
    let scheduled: Date | null = null
    let deadline: Date | null = null
    let description = ''
    let inPropertyDrawer = false

    // Look ahead for properties, scheduling, and description
    while (i < tokens.length && tokens[i].type !== TokenType.HEADLINE) {
      const token = tokens[i]

      switch (token.type) {
        case TokenType.PROPERTY_START:
          inPropertyDrawer = true
          break
        
        case TokenType.PROPERTY_END:
          inPropertyDrawer = false
          break
        
        case TokenType.PROPERTY_LINE:
          if (inPropertyDrawer) {
            propertyLines.push(token.value)
          }
          break
        
        case TokenType.SCHEDULED:
          scheduled = this.parseSchedulingLine(token.value)
          break
        
        case TokenType.DEADLINE:
          deadline = this.parseSchedulingLine(token.value)
          break
        
        case TokenType.TEXT:
          if (!inPropertyDrawer && token.value.trim()) {
            description += token.value.trim() + '\n'
          }
          break
      }
      
      i++
    }

    const properties = parseProperties(propertyLines)
    
    const item: ParsedTask = {
      rawContent: headlineToken.value,
      level: parsedHeadline.level,
      title: parsedHeadline.title,
      status: mapTodoKeywordToStatus(parsedHeadline.todoKeyword),
      priority: parsedHeadline.priority || null,
      tags: parsedHeadline.tags,
      properties,
      scheduled: scheduled || undefined,
      deadline: deadline || undefined,
      context: properties.context || this.context,
      description: description.trim() || undefined
    }

    return { item, nextIndex: i }
  }

  /**
   * Parse scheduling lines (SCHEDULED/DEADLINE)
   */
  private parseSchedulingLine(line: string): Date | null {
    const match = line.match(ORG_PATTERNS.SCHEDULING)
    if (!match) return null

    const [, , timestampStr] = match
    return parseTimestamp(`<${timestampStr}>`)
  }

  /**
   * Transform parsed item to Task type
   */
  private transformToTask(item: ParsedTask): Task {
    const now = new Date()
    
    return {
      id: generateTaskId(item.title, this.filePath, 1),
      title: item.title,
      description: item.description,
      status: item.status,
      priority: item.priority || null,
      project: item.properties.project,
      context: item.context,
      scheduled: item.scheduled || undefined,
      deadline: item.deadline || undefined,
      effort: item.properties.effort || 0,
      cost: item.properties.cost || 0,
      area: item.properties.area,
      tags: item.tags,
      properties: item.properties,
      created: now,
      modified: now,
      completedAt: item.status === 'DONE' ? now : undefined
    }
  }

  /**
   * Transform parsed item to Project type
   */
  private transformToProject(item: ParsedTask): Project {
    const now = new Date()
    
    return {
      id: generateTaskId(item.title, this.filePath, 1),
      title: item.title,
      description: item.description,
      status: 'ACTIVE',
      context: item.context,
      tasks: [], // Tasks will be associated separately
      area: item.properties.area,
      priority: item.priority || null,
      created: now,
      modified: now
    }
  }

  /**
   * Add parsing error
   */
  private addError(type: 'warning' | 'error', message: string, line: number, column: number, context: string): void {
    this.errors.push({
      type,
      message,
      line,
      column,
      context: context.substring(0, 50)
    })
  }
}

/**
 * Convenience function to parse org-mode content
 */
export function parseOrgContent(content: string, filePath: string): ParseResult {
  const parser = new OrgParser(filePath)
  return parser.parse(content)
}

/**
 * Parse multiple org files
 */
export async function parseOrgFiles(files: { path: string; content: string }[]): Promise<{
  allTasks: Task[]
  allProjects: Project[]
  errors: ParseError[]
}> {
  const allTasks: Task[] = []
  const allProjects: Project[] = []
  const errors: ParseError[] = []

  for (const file of files) {
    try {
      const result = parseOrgContent(file.content, file.path)
      allTasks.push(...result.tasks)
      allProjects.push(...result.projects)
      errors.push(...result.errors)
    } catch (error) {
      errors.push({
        type: 'error',
        message: `Failed to parse ${file.path}: ${(error as Error).message}`,
        line: 0,
        column: 0,
        context: file.path
      })
    }
  }

  return { allTasks, allProjects, errors }
}