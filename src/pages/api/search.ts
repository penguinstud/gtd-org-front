import { NextApiRequest, NextApiResponse } from 'next'
import { ApiResponse, SearchResult, Context } from '../../lib/types'
import { withSecurity, fileReadRateLimit, sanitizeString, validateRequestBody } from '../../lib/security/rateLimiting'
import { safeReadFile, listOrgFiles } from '../../lib/security/pathValidation'
import { parseOrgContent } from '../../lib/utils/orgParser'
import { logger } from '../../lib/utils/logger'

export interface SearchRequest {
  query: string
  context?: Context | 'all'
  limit?: number
}

export interface SearchResponse {
  results: SearchResult[]
  query: string
  context: Context | 'all'
  totalResults: number
}

/**
 * API endpoint to search across org files
 * POST /api/search
 * Body: { query: string, context?: 'work' | 'home' | 'all', limit?: number }
 */
async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<SearchResponse>>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    })
  }

  try {
    const { query, context = 'all', limit = 50 } = req.body

    // Input validation
    try {
      validateRequestBody(req.body, ['query'])
      const sanitizedQuery = sanitizeString(query, 100)
      
      if (!sanitizedQuery || sanitizedQuery.length < 2) {
        return res.status(400).json({
          success: false,
          error: 'Query must be at least 2 characters long'
        })
      }
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: `Input validation failed: ${error instanceof Error ? error.message : 'Invalid input'}`
      })
    }

    // Determine which contexts to search
    const contextsToSearch: Context[] = context === 'all' 
      ? ['work', 'home'] 
      : [context as Context]

    const allResults: SearchResult[] = []

    // Search through each context
    for (const ctx of contextsToSearch) {
      try {
        const orgFiles = await listOrgFiles(ctx)
        
        for (const filePath of orgFiles) {
          try {
            const content = await safeReadFile(filePath)
            const parsed = parseOrgContent(content, filePath)
            
            // Search in tasks
            for (const task of parsed.tasks) {
              const relevance = calculateRelevance(query, task.title, task.description, task.tags)
              if (relevance > 0) {
                allResults.push({
                  type: 'task',
                  id: task.id,
                  title: task.title,
                  description: task.description,
                  context: ctx,
                  relevance
                })
              }
            }
            
            // Search in projects
            for (const project of parsed.projects) {
              const relevance = calculateRelevance(query, project.title, project.description)
              if (relevance > 0) {
                allResults.push({
                  type: 'project',
                  id: project.id,
                  title: project.title,
                  description: project.description,
                  context: ctx,
                  relevance
                })
              }
            }
          } catch (fileError) {
            logger.error(`Failed to search in file ${filePath}:`, fileError)
            // Continue with other files
          }
        }
      } catch (contextError) {
        logger.error(`Failed to search in context ${ctx}:`, contextError)
        // Continue with other contexts
      }
    }

    // Sort by relevance and limit results
    allResults.sort((a, b) => b.relevance - a.relevance)
    const limitedResults = allResults.slice(0, limit)

    res.status(200).json({
      success: true,
      data: {
        results: limitedResults,
        query: query,
        context: context,
        totalResults: allResults.length
      }
    })

  } catch (error) {
    logger.error('Search error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to perform search',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

/**
 * Calculate relevance score for a search query against content
 * Returns a score between 0 and 1
 */
function calculateRelevance(
  query: string, 
  title?: string, 
  description?: string, 
  tags?: string[]
): number {
  const lowerQuery = query.toLowerCase()
  const queryWords = lowerQuery.split(/\s+/).filter(w => w.length > 0)
  
  let score = 0
  let maxScore = 0

  // Title matching (highest weight)
  if (title) {
    const lowerTitle = title.toLowerCase()
    maxScore += 3
    
    // Exact match in title
    if (lowerTitle === lowerQuery) {
      score += 3
    }
    // Contains full query
    else if (lowerTitle.includes(lowerQuery)) {
      score += 2.5
    }
    // Contains all query words
    else if (queryWords.every(word => lowerTitle.includes(word))) {
      score += 2
    }
    // Contains some query words
    else {
      const matchedWords = queryWords.filter(word => lowerTitle.includes(word))
      score += (matchedWords.length / queryWords.length) * 1.5
    }
  }

  // Description matching (medium weight)
  if (description) {
    const lowerDesc = description.toLowerCase()
    maxScore += 2
    
    // Contains full query
    if (lowerDesc.includes(lowerQuery)) {
      score += 1.5
    }
    // Contains all query words
    else if (queryWords.every(word => lowerDesc.includes(word))) {
      score += 1
    }
    // Contains some query words
    else {
      const matchedWords = queryWords.filter(word => lowerDesc.includes(word))
      score += (matchedWords.length / queryWords.length) * 0.5
    }
  }

  // Tag matching (lower weight)
  if (tags && tags.length > 0) {
    const lowerTags = tags.map(t => t.toLowerCase())
    maxScore += 1
    
    // Exact tag match
    if (lowerTags.includes(lowerQuery)) {
      score += 1
    }
    // Tag contains query
    else if (lowerTags.some(tag => tag.includes(lowerQuery))) {
      score += 0.7
    }
    // Query words in tags
    else {
      const matchedInTags = queryWords.filter(word => 
        lowerTags.some(tag => tag.includes(word))
      )
      score += (matchedInTags.length / queryWords.length) * 0.5
    }
  }

  // Normalize score to 0-1 range
  return maxScore > 0 ? Math.min(score / maxScore, 1) : 0
}

// Export the secured handler with rate limiting
export default withSecurity(handler, fileReadRateLimit)