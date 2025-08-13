import { NextApiRequest, NextApiResponse } from 'next'
import { promises as fs } from 'fs'
import path from 'path'
import { ApiResponse, ParseResult } from '../../../lib/types'
import { parseOrgContent } from '../../../lib/utils/orgParser'
import { validateFilePath, safeReadFile } from '../../../lib/security/pathValidation'
import { withSecurity, fileReadRateLimit, sanitizeString, validateRequestBody } from '../../../lib/security/rateLimiting'

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
async function handler(
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

    // Comprehensive input validation
    try {
      validateRequestBody(req.body, ['filePath'])
      const sanitizedFilePath = sanitizeString(filePath, 500)
      
      if (!sanitizedFilePath) {
        return res.status(400).json({
          success: false,
          error: 'File path is required and must be a valid string'
        })
      }
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: `Input validation failed: ${error instanceof Error ? error.message : 'Invalid input'}`
      })
    }

    // Security validation: comprehensive path validation
    const pathValidation = validateFilePath(filePath)
    if (!pathValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: `Security violation: ${pathValidation.error}`
      })
    }

    const sanitizedPath = pathValidation.sanitizedPath!

    // Securely read and parse the file
    let content: string
    try {
      content = await safeReadFile(filePath)
    } catch (error) {
      return res.status(404).json({
        success: false,
        error: 'File not found or inaccessible',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    const parsed = parseOrgContent(content, sanitizedPath)

    res.status(200).json({
      success: true,
      data: {
        filePath: sanitizedPath,
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

// Export the secured handler with rate limiting
export default withSecurity(handler, fileReadRateLimit)