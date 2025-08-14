import { NextApiRequest, NextApiResponse } from 'next'

interface HealthResponse {
  status: string
  timestamp: string
  uptime: number
  version: string
}

/**
 * Health check endpoint for monitoring and Docker health checks
 * GET /api/health
 */
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '0.1.0'
    })
  }

  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '0.1.0'
  })
}