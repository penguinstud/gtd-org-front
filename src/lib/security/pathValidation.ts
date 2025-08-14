import path from 'path'
import { promises as fs } from 'fs'
import { Context } from '../types'

/**
 * Security utility for validating and sanitizing file paths
 * Implements whitelist-based approach to prevent path traversal attacks
 */

export interface SecurityConfig {
  allowedDirectories: string[]
  allowedExtensions: string[]
  maxPathLength: number
  blocklistPatterns: RegExp[]
}

// Default security configuration
const DEFAULT_CONFIG: SecurityConfig = {
  allowedDirectories: [
    process.env.ORG_WORK_DIR || path.join(process.cwd(), 'org-files/work'),
    process.env.ORG_HOME_DIR || path.join(process.cwd(), 'org-files/home'),
    path.join(process.cwd(), 'tests/fixtures') // For testing only
  ],
  allowedExtensions: ['.org'],
  maxPathLength: 500,
  blocklistPatterns: [
    /\.\./,           // Path traversal
    /~\//,            // Home directory expansion
    /\$\{.*\}/,       // Variable expansion
    /\|/,             // Pipe commands
    /;/,              // Command separation
    /&/,              // Command chaining
    /`/,              // Command substitution
    /\x00/,           // Null bytes
    /[\x01-\x1f\x7f-\x9f]/, // Control characters
  ]
}

/**
 * Validates if a file path is safe and within allowed directories
 */
export function validateFilePath(
  filePath: string, 
  config: Partial<SecurityConfig> = {}
): { isValid: boolean; error?: string; sanitizedPath?: string } {
  const securityConfig = { ...DEFAULT_CONFIG, ...config }

  // Input validation
  if (!filePath || typeof filePath !== 'string') {
    return { isValid: false, error: 'File path must be a non-empty string' }
  }

  // Length validation
  if (filePath.length > securityConfig.maxPathLength) {
    return { isValid: false, error: `File path exceeds maximum length of ${securityConfig.maxPathLength}` }
  }

  // Check against blocklist patterns
  for (const pattern of securityConfig.blocklistPatterns) {
    if (pattern.test(filePath)) {
      return { isValid: false, error: `File path contains forbidden pattern: ${pattern.source}` }
    }
  }

  // Normalize and resolve path
  let normalizedPath: string
  try {
    // Remove any URL encoding
    const decodedPath = decodeURIComponent(filePath)
    
    // Normalize path separators and resolve relative paths
    normalizedPath = path.normalize(decodedPath)
    
    // Convert to absolute path for security checks
    const absolutePath = path.resolve(normalizedPath)
    
    // Validate file extension
    const ext = path.extname(absolutePath).toLowerCase()
    if (securityConfig.allowedExtensions.indexOf(ext) === -1) {
      return { 
        isValid: false, 
        error: `File extension '${ext}' not allowed. Allowed: ${securityConfig.allowedExtensions.join(', ')}` 
      }
    }

    // Check if path is within allowed directories
    const isInAllowedDir = securityConfig.allowedDirectories.some(allowedDir => {
      const resolvedAllowedDir = path.resolve(allowedDir)
      return absolutePath.startsWith(resolvedAllowedDir + path.sep) || 
             absolutePath === resolvedAllowedDir
    })

    if (!isInAllowedDir) {
      return { 
        isValid: false, 
        error: 'File path is outside allowed directories' 
      }
    }

    return { 
      isValid: true, 
      sanitizedPath: absolutePath 
    }

  } catch (error) {
    return { 
      isValid: false, 
      error: `Path validation error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}

/**
 * Validates directory path for listing operations
 */
export function validateDirectoryPath(
  dirPath: string,
  config: Partial<SecurityConfig> = {}
): { isValid: boolean; error?: string; sanitizedPath?: string } {
  if (!dirPath || typeof dirPath !== 'string') {
    return { isValid: false, error: 'Directory path must be a non-empty string' }
  }

  // Use similar validation as file paths but without extension check
  const pathValidation = validateFilePath(dirPath + '.org', {
    ...config,
    allowedExtensions: ['.org'] // Temporarily add extension for validation
  })

  if (!pathValidation.isValid) {
    return { isValid: false, error: pathValidation.error }
  }

  // Remove the temporary extension from the sanitized path
  const sanitizedDirPath = pathValidation.sanitizedPath?.replace(/\.org$/, '')

  return {
    isValid: true,
    sanitizedPath: sanitizedDirPath
  }
}

/**
 * Checks if a file exists safely
 */
export async function safeFileExists(filePath: string): Promise<boolean> {
  const validation = validateFilePath(filePath)
  if (!validation.isValid || !validation.sanitizedPath) {
    return false
  }

  try {
    await fs.access(validation.sanitizedPath)
    const stats = await fs.stat(validation.sanitizedPath)
    return stats.isFile()
  } catch {
    return false
  }
}

/**
 * Safely reads a file with path validation
 */
export async function safeReadFile(filePath: string): Promise<string> {
  const validation = validateFilePath(filePath)
  if (!validation.isValid || !validation.sanitizedPath) {
    throw new Error(validation.error || 'Invalid file path')
  }

  try {
    return await fs.readFile(validation.sanitizedPath, 'utf-8')
  } catch (error) {
    throw new Error(`Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Gets allowed directories for current configuration
 */
export function getAllowedDirectories(): string[] {
  return DEFAULT_CONFIG.allowedDirectories.map(dir => path.resolve(dir))
}

/**
 * Lists all org files in a specific context directory
 */
export async function listOrgFiles(context: Context): Promise<string[]> {
  const defaultPaths = {
    work: process.env.ORG_WORK_DIR || path.join(process.cwd(), 'org-files/work'),
    home: process.env.ORG_HOME_DIR || path.join(process.cwd(), 'org-files/home')
  }
  
  const dirPath = defaultPaths[context]
  const files: string[] = []
  
  // Validate directory path
  const dirValidation = validateDirectoryPath(dirPath)
  if (!dirValidation.isValid || !dirValidation.sanitizedPath) {
    return files
  }
  
  try {
    await fs.access(dirValidation.sanitizedPath)
    const entries = await fs.readdir(dirValidation.sanitizedPath, { withFileTypes: true })
    
    for (const entry of entries) {
      const fullPath = path.join(dirValidation.sanitizedPath, entry.name)
      
      if (entry.isFile() && entry.name.endsWith('.org')) {
        const fileValidation = validateFilePath(fullPath)
        if (fileValidation.isValid && fileValidation.sanitizedPath) {
          files.push(fileValidation.sanitizedPath)
        }
      } else if (entry.isDirectory() && !entry.name.startsWith('.')) {
        // Recursively list subdirectories
        const subFiles = await listOrgFilesInDirectory(fullPath)
        files.push(...subFiles)
      }
    }
  } catch {
    // Directory doesn't exist or can't be accessed
    return files
  }
  
  return files
}

/**
 * Helper function to recursively list org files in a directory
 */
async function listOrgFilesInDirectory(dirPath: string): Promise<string[]> {
  const files: string[] = []
  
  const dirValidation = validateDirectoryPath(dirPath)
  if (!dirValidation.isValid || !dirValidation.sanitizedPath) {
    return files
  }
  
  try {
    const entries = await fs.readdir(dirValidation.sanitizedPath, { withFileTypes: true })
    
    for (const entry of entries) {
      const fullPath = path.join(dirValidation.sanitizedPath, entry.name)
      
      if (entry.isFile() && entry.name.endsWith('.org')) {
        const fileValidation = validateFilePath(fullPath)
        if (fileValidation.isValid && fileValidation.sanitizedPath) {
          files.push(fileValidation.sanitizedPath)
        }
      } else if (entry.isDirectory() && !entry.name.startsWith('.')) {
        const subFiles = await listOrgFilesInDirectory(fullPath)
        files.push(...subFiles)
      }
    }
  } catch {
    // Continue with empty array
  }
  
  return files
}