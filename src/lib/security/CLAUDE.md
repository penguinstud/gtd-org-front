# Security Module

## Overview
The security module provides comprehensive protection against common web vulnerabilities. It implements defense-in-depth strategies including input validation, path traversal prevention, rate limiting, and sanitization to ensure safe file operations and API interactions.

## Key Files
- `pathValidation.ts` - File path security and validation
- `rateLimiting.ts` - API rate limiting and request throttling
- `index.ts` - Central security exports

## Security Components

### Path Validation (`pathValidation.ts`)
- **Purpose**: Prevent directory traversal and unauthorized file access
- **Features**: Whitelist validation, pattern blocking, safe file operations
- **Key Functions**:
  - `validateFilePath()` - Validates and sanitizes file paths
  - `validateDirectoryPath()` - Directory-specific validation
  - `safeReadFile()` - Secure file reading with validation

#### Validation Rules
```typescript
// Blocked patterns
const blocklistPatterns = [
  /\.\./,           // Parent directory traversal
  /~\//,            // Home directory expansion
  /\$\{.*\}/,       // Variable expansion
  /\|/,             // Pipe commands
  /;/,              // Command separation
  /&/,              // Command chaining
  /`/,              // Command substitution
  /\x00/,           // Null bytes
]

// Allowed directories (whitelist)
const allowedDirectories = [
  process.env.ORG_WORK_DIR,
  process.env.ORG_HOME_DIR,
  'tests/fixtures' // Testing only
]
```

### Rate Limiting (`rateLimiting.ts`)
- **Purpose**: Prevent API abuse and DoS attacks
- **Features**: Per-IP tracking, configurable windows, automatic cleanup
- **Middleware**: `withSecurity()` wrapper for API routes
- **Key Functions**:
  - `createRateLimiter()` - Create custom rate limiters
  - `withSecurity()` - Apply security middleware to handlers
  - `sanitizeString()` - Input sanitization
  - `validateRequestBody()` - Request validation

#### Rate Limit Configuration
```typescript
// Default limits
export const generalRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  maxRequests: 100
})

export const fileReadRateLimit = createRateLimiter({
  windowMs: 60 * 1000,        // 1 minute
  maxRequests: 30
})

export const fileListRateLimit = createRateLimiter({
  windowMs: 60 * 1000,        // 1 minute
  maxRequests: 20
})
```

## Security Patterns

### Input Validation
```typescript
// Sanitize user input
export function sanitizeString(input: unknown, maxLength = 1000): string {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string')
  }
  
  // Remove dangerous characters
  return input
    .slice(0, maxLength)
    .replace(/[<>\"'&\\]/g, '')
    .trim()
}
```

### Path Security
```typescript
// Example: Secure file read
export async function safeReadFile(filePath: string): Promise<string> {
  const validation = validateFilePath(filePath)
  
  if (!validation.isValid) {
    throw new Error(`Security violation: ${validation.error}`)
  }
  
  return fs.readFile(validation.sanitizedPath!, 'utf-8')
}
```

### API Protection
```typescript
// Example: Protected API route
export default withSecurity(async (req, res) => {
  // Request already validated and rate-limited
  const { filePath } = req.body
  const content = await safeReadFile(filePath)
  res.json({ success: true, data: content })
}, fileReadRateLimit)
```

## Common Security Tasks

### Adding a New Validation Rule
1. Add pattern to `blocklistPatterns` array
2. Write test case for the pattern
3. Document the security threat it prevents
4. Update error messages if needed

### Creating a Custom Rate Limiter
```typescript
const customLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000,  // 5 minutes
  maxRequests: 10,
  message: 'Too many requests for this operation'
})
```

### Validating Request Data
```typescript
// Validate required fields
validateRequestBody(req.body, ['field1', 'field2'])

// Custom validation
if (!isValidEmail(req.body.email)) {
  throw new Error('Invalid email format')
}
```

## Security Headers
Applied via Next.js configuration:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Content-Security-Policy: [strict policy]`
- `Strict-Transport-Security: max-age=31536000`

## Testing Security

### Path Validation Tests
```typescript
describe('Path Validation', () => {
  it('blocks directory traversal', () => {
    const result = validateFilePath('../../../etc/passwd')
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('forbidden pattern')
  })
  
  it('allows valid org files', () => {
    const result = validateFilePath('/app/org-files/work/tasks.org')
    expect(result.isValid).toBe(true)
  })
})
```

### Rate Limiting Tests
```typescript
describe('Rate Limiting', () => {
  it('enforces request limits', async () => {
    const limiter = createRateLimiter({ windowMs: 1000, maxRequests: 2 })
    
    expect(limiter.checkLimit('127.0.0.1')).toBe(true) // 1st
    expect(limiter.checkLimit('127.0.0.1')).toBe(true) // 2nd
    expect(limiter.checkLimit('127.0.0.1')).toBe(false) // 3rd - blocked
  })
})
```

## Security Best Practices
1. **Never trust user input** - Always validate and sanitize
2. **Whitelist over blacklist** - Define what's allowed explicitly
3. **Fail securely** - Default to denying access
4. **Log security events** - Track violations for monitoring
5. **Defense in depth** - Multiple layers of protection

## Common Vulnerabilities Prevented
- **Path Traversal**: Access to files outside allowed directories
- **Command Injection**: Execution of system commands
- **XSS**: Cross-site scripting via input
- **DoS**: Denial of service through request flooding
- **Null Byte Injection**: Bypassing file extension checks

## Integration Points
- **API Routes**: All file operations go through security
- **File System**: Validated paths only
- **Logging**: Security events tracked
- **Error Handling**: Safe error messages (no path leaks)

## Future Enhancements
- CSRF token validation
- Content type validation
- File upload security
- SQL injection prevention (when DB added)
- Authentication/authorization middleware

## Dependencies
- **Node.js fs**: File system operations
- **TypeScript**: Type safety
- **Path module**: Path resolution

## Related Modules
- **Parent**: [`lib/CLAUDE.md`](../CLAUDE.md) - Library overview
- **API Routes**: [`pages/api/CLAUDE.md`](../../pages/api/CLAUDE.md) - Protected endpoints
- **Utils**: [`utils/CLAUDE.md`](../utils/CLAUDE.md) - Helper functions
- **Security Docs**: [`docs/SECURITY-ARCHITECTURE.md`](../../../docs/SECURITY-ARCHITECTURE.md) - Full security details