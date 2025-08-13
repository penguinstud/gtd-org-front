import { NextApiRequest, NextApiResponse } from 'next'
import { promises as fs } from 'fs'
import path from 'path'
import { ApiResponse, ParseResult } from '../../../lib/types'
import { parseOrgContent } from '../../../lib/utils/orgParser'

export interface ReadFileResponse {
  filePath: string
  content: string
  parsed: ParseResult
}

/**
 * API endpoint to read and parse an org file
 * POST /api/files/read
 * Body: { filePath: string }
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<ReadFileResponse>>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    })
  }

  try {
    const { filePath } = req.body

    if (!filePath) {
      return res.status(400).json({
        success: false,
        error: 'File path is required'
      })
    }

    // Security check: ensure the file path is safe
    if (!isValidOrgFilePath(filePath)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid file path'
      })
    }

    // Check if file exists
    try {
      await fs.access(filePath)
    } catch {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      })
    }

    // Read and parse the file
    const content = await fs.readFile(filePath, 'utf-8')
    const parsed = parseOrgContent(content, filePath)

    res.status(200).json({
      success: true,
      data: {
        filePath,
        content,
        parsed
      }
    })

  } catch (error) {
    console.error('Error reading org file:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to read org file',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

/**
 * Validate that the file path is safe and points to an .org file
 */
function isValidOrgFilePath(filePath: string): boolean {
  // Must be an .org file
  if (!filePath.endsWith('.org')) {
    return false
  }

  // Resolve to absolute path and check for path traversal
  const resolvedPath = path.resolve(filePath)
  
  // Should not contain path traversal patterns
  if (filePath.includes('..') || filePath.includes('~')) {
    return false
  }

  // Must be within allowed directories (basic security)
  const allowedDirs = [
    process.env.ORG_WORK_DIR || path.join(process.cwd(), 'org/work'),
    process.env.ORG_HOME_DIR || path.join(process.cwd(), 'org/home'),
    path.join(process.cwd(), 'tests/fixtures') // For testing
  ]

  return allowedDirs.some(dir => {
    const resolvedDir = path.resolve(dir)
    return resolvedPath.startsWith(resolvedDir)
  })
}