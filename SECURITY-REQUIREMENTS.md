# Security Requirements - GTD Org Front

## 🔒 Project Security Standards

This document outlines the mandatory security requirements for the GTD Org Front application. **ALL future development must comply with these requirements.**

## 📋 Security Context

- **Application Type**: Single-user GTD productivity application
- **Data Sensitivity**: Mixed personal/professional data with context-based security
- **Deployment**: Potential external exposure requiring comprehensive security
- **Architecture**: Local-first with Next.js frontend and file-based data storage

## 🛡️ Core Security Principles

### 1. Defense in Depth
- Multiple layers of security controls
- No single point of failure in security architecture
- Redundant security measures across all attack vectors

### 2. Principle of Least Privilege
- Minimal required permissions for all operations
- Non-root container execution
- Restricted file system access

### 3. Secure by Default
- All new features must implement security controls from inception
- Security headers enabled by default
- Input validation required for all user inputs

### 4. Zero Trust Architecture
- Validate all inputs and file paths
- No implicit trust of user-provided data
- Comprehensive logging and monitoring

## 🔍 Mandatory Security Controls

### A. Input Validation & Sanitization

**REQUIREMENT**: All user inputs MUST be validated and sanitized using the established security module.

```typescript
// REQUIRED for all API endpoints
import { sanitizeString, validateRequestBody } from '@/lib/security'

// Input validation example
validateRequestBody(req.body, ['filePath'])
const sanitizedInput = sanitizeString(userInput, maxLength)
```

**Validation Rules**:
- Maximum input lengths enforced
- XSS prevention through character filtering
- SQL injection prevention (future database integration)
- No execution of user-provided scripts or commands

### B. File System Security

**REQUIREMENT**: All file operations MUST use the secure path validation module.

```typescript
// REQUIRED for all file operations
import { validateFilePath, safeReadFile } from '@/lib/security'

// Path validation example
const pathValidation = validateFilePath(userPath)
if (!pathValidation.isValid) {
  return res.status(400).json({ error: pathValidation.error })
}
```

**File Access Rules**:
- Whitelist-based directory access only
- Path traversal protection mandatory
- File extension validation required
- No direct file system access without validation

### C. API Security

**REQUIREMENT**: All API endpoints MUST implement rate limiting and security middleware.

```typescript
// REQUIRED wrapper for all API endpoints
import { withSecurity, fileReadRateLimit } from '@/lib/security'

async function handler(req, res) { /* endpoint logic */ }
export default withSecurity(handler, fileReadRateLimit)
```

**API Security Rules**:
- Rate limiting per endpoint type
- Security headers on all responses
- Error handling without information disclosure
- Method validation (GET, POST only)

### D. Container Security

**REQUIREMENT**: All containerized deployments MUST follow the hardened Docker configuration.

**Container Rules**:
- Non-root user execution (nextjs:1001)
- Minimal capability sets
- Read-only application mounts where possible
- Resource limits enforced
- Health checks implemented

### E. Network Security

**REQUIREMENT**: All network communications MUST use the configured security headers.

**Network Rules**:
- Content Security Policy (CSP) enabled
- HTTPS enforcement in production
- CORS policies restrictive by default
- Security headers on all responses

## 📝 Development Guidelines

### New API Endpoints

When creating new API endpoints, developers MUST:

1. **Import security modules**:
   ```typescript
   import { withSecurity, validateFilePath, sanitizeString } from '@/lib/security'
   ```

2. **Implement input validation**:
   ```typescript
   // Validate request body structure
   validateRequestBody(req.body, requiredFields)
   
   // Sanitize all string inputs
   const sanitizedInput = sanitizeString(userInput)
   ```

3. **Apply rate limiting**:
   ```typescript
   export default withSecurity(handler, appropriateRateLimit)
   ```

4. **Validate file paths** (if applicable):
   ```typescript
   const pathValidation = validateFilePath(filePath)
   if (!pathValidation.isValid) {
     return res.status(400).json({ error: pathValidation.error })
   }
   ```

### New UI Components

When creating new UI components, developers MUST:

1. **Sanitize displayed data**:
   ```typescript
   // Use safe HTML rendering
   dangerouslySetInnerHTML: { __html: sanitizeHtml(content) }
   ```

2. **Validate form inputs**:
   ```typescript
   // Client-side validation with server-side verification
   const isValid = validateInput(formData)
   ```

3. **Implement CSP-compliant code**:
   - No inline scripts or styles
   - Use nonce-based CSP where needed
   - External resources from whitelisted domains only

### File Operations

When implementing file operations, developers MUST:

1. **Use secure file utilities**:
   ```typescript
   import { safeReadFile, safeFileExists } from '@/lib/security'
   
   const content = await safeReadFile(validatedPath)
   ```

2. **Implement context-based access**:
   ```typescript
   // Separate work/home contexts
   const allowedDirs = getAllowedDirectories()
   ```

3. **Add audit logging**:
   ```typescript
   // Log security-relevant file operations
   console.log(`File access: ${sanitizedPath} by ${clientId}`)
   ```

## ⚠️ Security Violations

The following patterns are **STRICTLY FORBIDDEN**:

### ❌ Direct File System Access
```typescript
// FORBIDDEN - No direct fs operations
const content = fs.readFileSync(userPath)

// REQUIRED - Use security module
const content = await safeReadFile(userPath)
```

### ❌ Unvalidated Input Processing
```typescript
// FORBIDDEN - Direct user input usage
const result = processData(req.body.userInput)

// REQUIRED - Validated and sanitized input
const sanitized = sanitizeString(req.body.userInput)
const result = processData(sanitized)
```

### ❌ Missing Rate Limiting
```typescript
// FORBIDDEN - Direct export without security
export default function handler(req, res) { }

// REQUIRED - Security wrapper
export default withSecurity(handler, rateLimit)
```

### ❌ Path Traversal Vulnerabilities
```typescript
// FORBIDDEN - Direct path usage
const filePath = path.join(baseDir, userPath)

// REQUIRED - Path validation
const validation = validateFilePath(userPath)
const filePath = validation.sanitizedPath
```

## 🔧 Security Module Usage

### Core Security Imports
```typescript
// Path validation and file security
import { 
  validateFilePath, 
  validateDirectoryPath, 
  safeReadFile, 
  safeFileExists 
} from '@/lib/security'

// Rate limiting and input validation
import { 
  withSecurity, 
  fileReadRateLimit, 
  fileListRateLimit, 
  sanitizeString, 
  validateRequestBody 
} from '@/lib/security'
```

### Configuration
```typescript
// Environment-specific security settings
const securityConfig = {
  allowedDirectories: [
    process.env.ORG_WORK_DIR || '/app/org-files/work',
    process.env.ORG_HOME_DIR || '/app/org-files/home'
  ],
  allowedExtensions: ['.org'],
  maxPathLength: 500
}
```

## 📊 Security Monitoring

### Required Logging
- All file access attempts (successful and failed)
- Rate limiting violations
- Input validation failures
- Security header violations

### Health Checks
- API endpoint: `/api/health`
- Docker health checks enabled
- Security module integrity verification

## 🚨 Incident Response

If security violations are detected:

1. **Immediate**: Stop processing and return error
2. **Log**: Record security event with details
3. **Alert**: Notify monitoring systems
4. **Review**: Analyze attack patterns

## 📋 Security Checklist

Before deploying any changes, verify:

- [ ] All inputs validated and sanitized
- [ ] File paths validated through security module
- [ ] Rate limiting applied to API endpoints
- [ ] Security headers configured
- [ ] Container running as non-root
- [ ] No direct file system access
- [ ] Error handling prevents information disclosure
- [ ] Logging captures security events

## 🔄 Regular Security Reviews

### Required Actions
- Monthly security dependency updates
- Quarterly security architecture reviews
- Annual penetration testing
- Continuous security monitoring

This document is **MANDATORY** reading for all developers and AI assistants working on this project. Non-compliance with these requirements is considered a critical security violation.

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Status**: MANDATORY COMPLIANCE REQUIRED