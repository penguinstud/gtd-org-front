import { NextApiRequest, NextApiResponse } from 'next'
import { promises as fs } from 'fs'
import path from 'path'
import { ApiResponse, OrgFile, Context } from '../../../lib/types'

export interface ListFilesResponse {
  files: OrgFile[]
  context?: Context
}

/**
 * API endpoint to list org files in specified directories
 * GET /api/files/list?context=work|home&path=/custom/path
 */
export default async function handler(
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
    const contextParam = context as Context
    const pathParam = customPath as string

    // Default org file directories
    const defaultPaths = {
      work: process.env.ORG_WORK_DIR || path.join(process.cwd(), 'org/work'),
      home: process.env.ORG_HOME_DIR || path.join(process.cwd(), 'org/home')
    }

    let directories: { path: string; context: Context }[] = []

    if (pathParam) {
      // Custom path provided
      const detectedContext = determineContextFromPath(pathParam)
      directories.push({ path: pathParam, context: detectedContext })
    } else if (contextParam && (contextParam === 'work' || contextParam === 'home')) {
      // Specific context requested
      directories.push({ path: defaultPaths[contextParam], context: contextParam })
    } else {
      // List both contexts
      directories.push(
        { path: defaultPaths.work, context: 'work' },
        { path: defaultPaths.home, context: 'home' }
      )
    }

    const files: OrgFile[] = []

    for (const dir of directories) {
      try {
        const dirFiles = await listOrgFilesInDirectory(dir.path, dir.context)
        files.push(...dirFiles)
      } catch (error) {
        console.warn(`Failed to list files in ${dir.path}:`, error)
        // Continue with other directories instead of failing completely
      }
    }

    res.status(200).json({
      success: true,
      data: {
        files: files.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime()),
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

  try {
    await fs.access(dirPath)
  } catch {
    // Directory doesn't exist, return empty array
    return files
  }

  const entries = await fs.readdir(dirPath, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name)

    if (entry.isFile() && entry.name.endsWith('.org')) {
      try {
        const stats = await fs.stat(fullPath)
        
        files.push({
          path: fullPath,
          name: entry.name,
          context,
          lastModified: stats.mtime
        })
      } catch (error) {
        console.warn(`Failed to get stats for ${fullPath}:`, error)
      }
    } else if (entry.isDirectory() && !entry.name.startsWith('.')) {
      // Recursively list subdirectories
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
  return 'work' // Default fallback
}