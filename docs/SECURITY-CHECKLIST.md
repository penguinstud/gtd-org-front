# Security Checklist & Testing Procedures

## 🔒 Development Security Checklist

**MANDATORY**: This checklist must be completed for ALL code changes, new features, and deployments.

### ✅ Pre-Development Checklist

Before starting any development work:

- [ ] **Read Security Requirements**: Review [SECURITY-REQUIREMENTS.md](../SECURITY-REQUIREMENTS.md)
- [ ] **Understand Architecture**: Review [SECURITY-ARCHITECTURE.md](./SECURITY-ARCHITECTURE.md)
- [ ] **Identify Security Scope**: Determine if changes involve:
  - [ ] File operations
  - [ ] User input processing
  - [ ] API endpoints
  - [ ] Container configuration
  - [ ] Network communication

### ✅ Code Development Checklist

#### API Endpoint Development
- [ ] **Import Security Modules**:
  ```typescript
  import { withSecurity, validateFilePath, sanitizeString } from '@/lib/security'
  ```
- [ ] **Apply Rate Limiting**:
  ```typescript
  export default withSecurity(handler, appropriateRateLimit)
  ```
- [ ] **Validate All Inputs**:
  ```typescript
  validateRequestBody(req.body, requiredFields)
  const sanitized = sanitizeString(userInput)
  ```
- [ ] **Method Validation**: Only allow GET/POST methods
- [ ] **Error Handling**: No information disclosure in errors
- [ ] **Path Validation**: Use `validateFilePath()` for file operations

#### File Operations
- [ ] **Use Safe File Functions**:
  ```typescript
  const content = await safeReadFile(validatedPath)
  const exists = await safeFileExists(validatedPath)
  ```
- [ ] **Path Validation Required**: All file paths through `validateFilePath()`
- [ ] **Directory Validation**: All directory paths through `validateDirectoryPath()`
- [ ] **No Direct fs Operations**: Prohibited - use security module
- [ ] **Context-Based Access**: Work/Home separation enforced

#### UI Component Development
- [ ] **Input Sanitization**: All user inputs sanitized
- [ ] **XSS Prevention**: No `dangerouslySetInnerHTML` without sanitization
- [ ] **CSP Compliance**: No inline scripts or styles
- [ ] **Form Validation**: Client and server-side validation
- [ ] **Safe Data Display**: Escape user-generated content

#### Container & Infrastructure
- [ ] **Non-Root User**: Container runs as `nextjs:1001`
- [ ] **Capability Restrictions**: Only necessary capabilities enabled
- [ ] **Resource Limits**: Memory and CPU limits configured
- [ ] **Health Checks**: Endpoint responding correctly
- [ ] **Security Context**: `no-new-privileges` enabled

### ✅ Testing Checklist

#### Unit Tests
- [ ] **Path Validation Tests**: Test various attack patterns
- [ ] **Input Sanitization Tests**: Test XSS and injection patterns
- [ ] **Rate Limiting Tests**: Test limit enforcement
- [ ] **Error Handling Tests**: Verify no information disclosure

#### Integration Tests
- [ ] **API Security Tests**: Test endpoint security controls
- [ ] **File Operation Tests**: Test secure file access
- [ ] **Container Security Tests**: Test user privileges and access

#### Security Tests
- [ ] **Path Traversal Tests**: `../../etc/passwd`, URL encoding, null bytes
- [ ] **XSS Tests**: Script injection, HTML injection, attribute injection
- [ ] **Rate Limiting Tests**: Burst requests, sustained load
- [ ] **Input Validation Tests**: Malformed data, oversized inputs

### ✅ Pre-Deployment Checklist

#### Code Review
- [ ] **Security Review**: All security controls implemented
- [ ] **Dependency Check**: No vulnerable dependencies
- [ ] **Configuration Review**: Security settings verified
- [ ] **Documentation Updated**: Security docs reflect changes

#### Environment Validation
- [ ] **Environment Variables**: Security-related vars configured
- [ ] **Container Security**: Non-root execution verified
- [ ] **Network Security**: HTTPS enforcement in production
- [ ] **Monitoring Setup**: Security logging configured

## 🧪 Security Testing Procedures

### 1. Path Traversal Testing

**Objective**: Verify path validation prevents unauthorized file access

**Test Cases**:
```bash
# Basic path traversal
curl -X POST /api/files/read -d '{"filePath": "../../etc/passwd"}'

# URL encoded
curl -X POST /api/files/read -d '{"filePath": "%2e%2e%2f%2e%2e%2fetc%2fpasswd"}'

# Double encoding
curl -X POST /api/files/read -d '{"filePath": "%252e%252e%252f"}'

# Null byte injection
curl -X POST /api/files/read -d '{"filePath": "valid.org%00../../etc/passwd"}'

# Unicode normalization
curl -X POST /api/files/read -d '{"filePath": "..\\u002f..\\u002f"}'
```

**Expected Results**: All requests should return `400 Security violation`

### 2. Input Validation Testing

**Objective**: Verify input sanitization prevents XSS and injection

**Test Cases**:
```bash
# XSS attempts
curl -X POST /api/files/read -d '{"filePath": "<script>alert(\"xss\")</script>"}'
curl -X POST /api/files/read -d '{"filePath": "javascript:alert(1)"}'
curl -X POST /api/files/read -d '{"filePath": "data:text/html,<script>alert(1)</script>"}'

# Command injection attempts
curl -X POST /api/files/read -d '{"filePath": "; cat /etc/passwd"}'
curl -X POST /api/files/read -d '{"filePath": "| rm -rf /"}'
curl -X POST /api/files/read -d '{"filePath": "`whoami`"}'

# Oversized inputs
curl -X POST /api/files/read -d "{\"filePath\": \"$(python3 -c 'print(\"A\" * 10000)')\"}"
```

**Expected Results**: Invalid inputs rejected with appropriate error messages

### 3. Rate Limiting Testing

**Objective**: Verify rate limiting prevents API abuse

**Test Script**:
```bash
#!/bin/bash
# Test file read rate limiting (30 requests/minute)
for i in {1..35}; do
  echo "Request $i"
  curl -s -o /dev/null -w "%{http_code}\n" \
    -X POST /api/files/read \
    -d '{"filePath": "valid-file.org"}'
  sleep 1
done
```

**Expected Results**: 
- Requests 1-30: `200 OK`
- Requests 31+: `429 Too Many Requests`

### 4. Container Security Testing

**Objective**: Verify container security hardening

**Test Commands**:
```bash
# Verify non-root user
docker exec container_name whoami
# Expected: nextjs

# Verify user ID
docker exec container_name id
# Expected: uid=1001(nextjs) gid=1001(nodejs)

# Test file system permissions
docker exec container_name ls -la /app
# Expected: Files owned by nextjs:nodejs

# Test capability restrictions
docker exec container_name capsh --print
# Expected: Limited capabilities only

# Test resource limits
docker stats container_name
# Expected: Memory limit 512M, CPU limit 0.5
```

### 5. Security Headers Testing

**Objective**: Verify security headers are properly configured

**Test Script**:
```bash
#!/bin/bash
# Test security headers
curl -I http://localhost:3000/ | grep -E "(X-Frame-Options|X-Content-Type-Options|X-XSS-Protection|Content-Security-Policy|Strict-Transport-Security)"
```

**Expected Headers**:
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'...
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

## 📋 Security Validation Scripts

### Automated Security Test Suite

Create `tests/security/security-test-suite.js`:
```javascript
const request = require('supertest');
const app = require('../../server');

describe('Security Tests', () => {
  describe('Path Traversal Protection', () => {
    test('should reject path traversal attempts', async () => {
      const maliciousPaths = [
        '../../etc/passwd',
        '../../../root/.ssh/id_rsa',
        '..\\..\\windows\\system32\\config\\sam'
      ];
      
      for (const path of maliciousPaths) {
        const response = await request(app)
          .post('/api/files/read')
          .send({ filePath: path });
        
        expect(response.status).toBe(400);
        expect(response.body.error).toContain('Security violation');
      }
    });
  });

  describe('Rate Limiting', () => {
    test('should enforce rate limits', async () => {
      // Send 31 requests rapidly
      const requests = Array(31).fill().map(() => 
        request(app).post('/api/files/read').send({ filePath: 'test.org' })
      );
      
      const responses = await Promise.all(requests);
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('Input Validation', () => {
    test('should sanitize malicious inputs', async () => {
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        'javascript:alert(1)',
        '; cat /etc/passwd'
      ];
      
      for (const input of maliciousInputs) {
        const response = await request(app)
          .post('/api/files/read')
          .send({ filePath: input });
        
        expect(response.status).toBe(400);
      }
    });
  });
});
```

### Security Monitoring Script

Create `scripts/security-monitor.js`:
```javascript
const fs = require('fs');
const path = require('path');

// Monitor for security violations in logs
function monitorSecurityLogs() {
  const logFile = path.join(__dirname, '../logs/security.log');
  
  if (fs.existsSync(logFile)) {
    const logs = fs.readFileSync(logFile, 'utf8');
    const violations = logs.split('\n').filter(line => 
      line.includes('Security violation') || 
      line.includes('Rate limit exceeded') ||
      line.includes('Path validation failed')
    );
    
    if (violations.length > 0) {
      console.warn(`⚠️  Security violations detected: ${violations.length}`);
      violations.forEach(violation => console.log(violation));
    }
  }
}

// Run monitoring
setInterval(monitorSecurityLogs, 60000); // Check every minute
```

## 🚨 Security Incident Response

### Immediate Response Steps

1. **Identify**: Determine nature and scope of security incident
2. **Contain**: Implement immediate containment measures
3. **Assess**: Evaluate impact and affected systems
4. **Remediate**: Apply fixes and security patches
5. **Monitor**: Continuous monitoring for additional threats

### Response Actions by Incident Type

#### Path Traversal Attack Detected
- [ ] Block attacking IP immediately
- [ ] Review all recent file access logs
- [ ] Verify path validation is working correctly
- [ ] Check for any successful unauthorized access

#### Rate Limiting Exceeded
- [ ] Identify source IP and pattern
- [ ] Determine if legitimate user or attack
- [ ] Adjust rate limits if necessary
- [ ] Implement additional blocking if malicious

#### XSS Attempt Detected
- [ ] Verify input sanitization is working
- [ ] Check for any successful code injection
- [ ] Review CSP violations in browser logs
- [ ] Update input validation if needed

#### Container Security Violation
- [ ] Immediate container restart with security hardening
- [ ] Review container logs for compromise indicators
- [ ] Verify user privileges and capabilities
- [ ] Check file system integrity

## 📊 Security Metrics & KPIs

### Key Metrics to Monitor

- **Path Validation Rejection Rate**: % of requests blocked by path validation
- **Rate Limiting Hit Rate**: % of requests hitting rate limits
- **Input Sanitization Triggers**: Number of malicious inputs detected
- **Security Header Compliance**: % of responses with all security headers
- **Container Security Score**: Compliance with security hardening checklist

### Weekly Security Report Template

```markdown
# Weekly Security Report

## Summary
- Total requests processed: [NUMBER]
- Security violations detected: [NUMBER]
- Rate limiting triggers: [NUMBER]
- Path validation blocks: [NUMBER]

## Security Metrics
- Path validation rejection rate: [PERCENTAGE]
- Rate limiting hit rate: [PERCENTAGE]
- Input sanitization triggers: [NUMBER]
- Container security compliance: [PERCENTAGE]

## Action Items
- [ ] Review and update security configurations
- [ ] Analyze attack patterns and trends
- [ ] Update security documentation if needed
- [ ] Plan security improvements for next week
```

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Review Schedule**: Monthly  
**Next Update**: February 2025