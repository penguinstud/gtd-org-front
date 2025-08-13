import { NextApiRequest, NextApiResponse } from 'next'
import { promises as fs } from 'fs'
import path from 'path'
import { ApiResponse, OrgFile, Context } from '../../../lib/types'
import { validateDirectoryPath, validateFilePath } from '../../../lib/security/pathValidation'
import { withSecurity, fileListRateLimit, sanitizeString } from '../../../lib/security/rateLimiting'

export interface ListFilesResponse {
  files: OrgFile[]
  context?: Context
}

/**
 * API endpoint to list org files in specified directories
 * GET /api/files/list?context=work|home&path=/custom/path
 */
async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<ListFilesResponse>>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    })
  }

  try {
    const { context, path: customPath } = req.query
    
    // Input validation and sanitization
    let contextParam: Context | undefined
    let pathParam: string | undefined
    
    if (context) {
      try {
        const sanitizedContext = sanitizeString(context as string, 20)
        if (sanitizedContext === 'work' || sanitizedContext === 'home') {
          contextParam = sanitizedContext as Context
        } else {
          return res.status(400).json({
            success: false,
            error: 'Invalid context. Must be "work" or "home"'
          })
        }
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: 'Invalid context parameter'
        })
      }
    } else {
      // Context is now REQUIRED for proper isolation
      return res.status(400).json({
        success: false,
        error: 'Context parameter is required. Must specify "work" or "home"'
      })
    }
    
    if (customPath) {
      try {
        pathParam = sanitizeString(customPath as string, 500)
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: 'Invalid path parameter'
        })
      }
    }

    // Default org file directories
    const defaultPaths = {
      work: process.env.ORG_WORK_DIR || path.join(process.cwd(), 'org/work'),
      home: process.env.ORG_HOME_DIR || path.join(process.cwd(), 'org/home')
    }

    let directories: { path: string; context: Context }[] = []

    if (pathParam) {
      // Custom path provided - validate it first
      const pathValidation = validateDirectoryPath(pathParam)
      if (!pathValidation.isValid) {
        return res.status(400).json({
          success: false,
          error: `Security violation: ${pathValidation.error}`
        })
      }
      const detectedContext = determineContextFromPath(pathValidation.sanitizedPath!)
      directories.push({ path: pathValidation.sanitizedPath!, context: detectedContext })
    } else {
      // Only specific context requested (context is now required)
      directories.push({ path: defaultPaths[contextParam], context: contextParam })
    }

    const files: OrgFile[] = []

    for (const dir of directories) {
      try {
        const dirFiles = await listOrgFilesInDirectory(dir.path, dir.context)
        // Enforce context isolation at API level
        const contextFilteredFiles = dirFiles.filter(file => file.context === contextParam)
        files.push(...contextFilteredFiles)
      } catch (error) {
        console.warn(`Failed to list files in ${dir.path}:`, error)
        // Continue with other directories instead of failing completely
      }
    }

    // Additional validation: ensure all returned files match the requested context
    const validatedFiles = files.filter(file => file.context === contextParam)
    
    if (validatedFiles.length !== files.length) {
      console.warn(`Context isolation warning: Found ${files.length - validatedFiles.length} files with incorrect context`)
    }

    res.status(200).json({
      success: true,
      data: {
        files: validatedFiles.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime()),
        context: contextParam
      }
    })

  } catch (error) {
    console.error('Error listing org files:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to list org files',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

/**
 * List all .org files in a directory
 */
async function listOrgFilesInDirectory(dirPath: string, context: Context): Promise<OrgFile[]> {
  const files: OrgFile[] = []

  // Validate directory path for security
  const dirValidation = validateDirectoryPath(dirPath)
  if (!dirValidation.isValid) {
    console.warn(`Invalid directory path rejected: ${dirPath} - ${dirValidation.error}`)
    return files
  }

  const sanitizedDirPath = dirValidation.sanitizedPath!

  try {
    await fs.access(sanitizedDirPath)
  } catch {
    // Directory doesn't exist, return empty array
    return files
  }

  const entries = await fs.readdir(sanitizedDirPath, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(sanitizedDirPath, entry.name)

    if (entry.isFile() && entry.name.endsWith('.org')) {
      // Validate each file path for additional security
      const fileValidation = validateFilePath(fullPath)
      if (!fileValidation.isValid) {
        console.warn(`File rejected due to security validation: ${fullPath} - ${fileValidation.error}`)
        continue
      }

      try {
        const stats = await fs.stat(fileValidation.sanitizedPath!)
        
        files.push({
          path: fileValidation.sanitizedPath!,
          name: entry.name,
          context,
          lastModified: stats.mtime
        })
      } catch (error) {
        console.warn(`Failed to get stats for ${fullPath}:`, error)
      }
      
    } else if (entry.isDirectory() && !entry.name.startsWith('.')) {
      // Recursively list subdirectories with security validation
      try {
        const subFiles = await listOrgFilesInDirectory(fullPath, context)
        files.push(...subFiles)
      } catch (error) {
        console.warn(`Failed to list subdirectory ${fullPath}:`, error)
      }
    }
  }

  return files
}

/**
 * Determine context from file path
 */
function determineContextFromPath(filePath: string): Context {
  if (filePath.includes('/work/') || filePath.includes('\\work\\')) {
    return 'work'
  }
  if (filePath.includes('/home/') || filePath.includes('\\home\\')) {
    return 'home'
  }
  
  // Default fallback
  return 'work'
}
// Export the secured handler with rate limiting
export default withSecurity(handler, fileListRateLimit)