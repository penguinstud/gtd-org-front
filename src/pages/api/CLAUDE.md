# API Routes Documentation

## Overview
The API routes provide secure backend functionality for the GTD Org application. All endpoints are protected with comprehensive security measures including input validation, path security, and rate limiting. The API focuses on file operations for org-mode task management.

## API Structure
```
api/
├── health.ts           → System health check
└── files/              → File operations
    ├── list.ts         → List org files by context
    └── read.ts         → Read and parse org file content
```

## Security Measures
All API endpoints implement:
- **Rate Limiting**: Prevents abuse and DoS attacks
- **Input Validation**: Sanitizes all user inputs
- **Path Security**: Validates file paths against whitelist
- **Error Handling**: Safe error messages without information leakage

## Endpoint Specifications

### Health Check
**GET `/api/health`**

Monitor application health and container status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "uptime": 3600,
  "version": "0.1.0"
}
```

**Status Codes:**
- `200`: System is healthy
- `405`: Method not allowed (non-GET)

**Usage:**
```typescript
// Docker health check
HEALTHCHECK CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"
```

### List Files
**GET `/api/files/list`**

List org files in specified context directory.

**Query Parameters:**
- `context` (required): `"work"` or `"home"`
- `path` (optional): Custom directory path

**Rate Limit:** 20 requests per minute

**Response:**
```json
{
  "success": true,
  "data": {
    "files": [
      {
        "path": "/app/org-files/work/tasks.org",
        "name": "tasks.org",
        "context": "work",
        "lastModified": "2025-01-15T10:00:00.000Z"
      }
    ],
    "context": "work"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Context parameter is required. Must specify \"work\" or \"home\""
}
```

**Status Codes:**
- `200`: Success
- `400`: Invalid parameters or security violation
- `405`: Method not allowed
- `429`: Rate limit exceeded
- `500`: Server error

**Example Request:**
```typescript
// List work files
const response = await fetch('/api/files/list?context=work')
const { data } = await response.json()

// With custom path
const response = await fetch('/api/files/list?context=work&path=/custom/path')
```

### Read File
**POST `/api/files/read`**

Read and parse org file content.

**Request Body:**
```json
{
  "filePath": "/app/org-files/work/tasks.org"
}
```

**Rate Limit:** 30 requests per minute

**Response:**
```json
{
  "success": true,
  "data": {
    "filePath": "/app/org-files/work/tasks.org",
    "content": "* TODO Complete project documentation\n** DONE Write API specs",
    "parsed": {
      "tasks": [
        {
          "id": "task-1",
          "title": "Complete project documentation",
          "status": "TODO",
          "context": "work",
          "priority": null,
          "scheduled": null,
          "deadline": null,
          "tags": []
        }
      ],
      "metadata": {
        "totalTasks": 1,
        "todoCount": 1,
        "doneCount": 0
      }
    }
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Security violation: Path contains forbidden pattern"
}
```

**Status Codes:**
- `200`: Success
- `400`: Invalid file path or security violation
- `404`: File not found
- `405`: Method not allowed
- `429`: Rate limit exceeded
- `500`: Server error

**Example Request:**
```typescript
const response = await fetch('/api/files/read', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ filePath: '/app/org-files/work/tasks.org' })
})
const { data } = await response.json()
```

## Security Implementation

### Path Validation
```typescript
// All file paths are validated
const validation = validateFilePath(filePath)
if (!validation.isValid) {
  return res.status(400).json({
    success: false,
    error: `Security violation: ${validation.error}`
  })
}
```

### Rate Limiting
```typescript
// Applied via middleware
export default withSecurity(handler, fileReadRateLimit)
```

### Input Sanitization
```typescript
// All inputs are sanitized
const sanitizedPath = sanitizeString(filePath, 500)
validateRequestBody(req.body, ['filePath'])
```

## Common API Patterns

### Error Handling
```typescript
try {
  // API logic
} catch (error) {
  logger.error('API error', { endpoint, error })
  res.status(500).json({
    success: false,
    error: 'Operation failed',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined
  })
}
```

### Response Format
```typescript
// Success
{
  success: true,
  data: { /* response data */ }
}

// Error
{
  success: false,
  error: "Error description",
  message?: "Additional details (dev only)"
}
```

### Context Isolation
All file operations enforce context boundaries:
```typescript
// Files are filtered by context
const contextFilteredFiles = files.filter(file => file.context === requestedContext)
```

## Testing API Endpoints

### Integration Tests
```typescript
describe('API: /api/files/list', () => {
  it('requires context parameter', async () => {
    const res = await request(app).get('/api/files/list')
    expect(res.status).toBe(400)
    expect(res.body.error).toContain('Context parameter is required')
  })
  
  it('returns files for valid context', async () => {
    const res = await request(app).get('/api/files/list?context=work')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data.files)).toBe(true)
  })
})
```

### Security Tests
```typescript
describe('API Security', () => {
  it('blocks path traversal attempts', async () => {
    const res = await request(app)
      .post('/api/files/read')
      .send({ filePath: '../../etc/passwd' })
    expect(res.status).toBe(400)
    expect(res.body.error).toContain('Security violation')
  })
})
```

## Future API Endpoints (Planned)

### File Operations
- **POST `/api/files/write`** - Create/update org files
- **DELETE `/api/files/delete`** - Remove org files
- **POST `/api/files/move`** - Move/rename files

### Task Management
- **POST `/api/tasks/create`** - Create new task
- **PATCH `/api/tasks/:id`** - Update task
- **DELETE `/api/tasks/:id`** - Delete task
- **POST `/api/tasks/bulk`** - Bulk operations

### System Operations
- **GET `/api/stats`** - Application statistics
- **POST `/api/backup`** - Trigger backup
- **GET `/api/config`** - Get configuration

## API Development Guidelines

1. **Security First**: Always validate inputs and paths
2. **Rate Limiting**: Apply appropriate limits
3. **Error Handling**: Never expose sensitive information
4. **Documentation**: Update this file for new endpoints
5. **Testing**: Write tests for all endpoints
6. **Monitoring**: Log all security events

## Dependencies
- **Next.js**: API route framework
- **Security Module**: Path validation, rate limiting
- **Utils**: Org parsing, logging
- **Types**: TypeScript interfaces

## Related Modules
- **Parent**: [`pages/CLAUDE.md`](../CLAUDE.md) - Pages overview
- **Security**: [`lib/security/CLAUDE.md`](../../lib/security/CLAUDE.md) - Security implementation
- **Types**: [`lib/types.ts`](../../lib/types.ts) - Type definitions
- **Utils**: [`lib/utils/CLAUDE.md`](../../lib/utils/CLAUDE.md) - Utility functions