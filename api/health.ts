/**
 * Serverless Health Check Handler
 * Endpoint: GET /api/health
 */

export interface HealthResponse {
  status: 'ok' | 'degraded';
  service: string;
  timestamp: string;
  uptimeSeconds: number;
  environment: string;
}

export default async function handler(req: any, res?: any) {
  const healthData: HealthResponse = {
    status: 'ok',
    service: 'singapore-psi-serverless-api',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime ? process.uptime() : 0),
    environment: process.env.NODE_ENV || 'production',
  };

  // Node.js / Express / Vercel Serverless response
  if (res && typeof res.status === 'function') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.status(200).json(healthData);
  }

  // Web Standard Fetch Request/Response (Cloudflare Workers / Edge Runtime)
  return new Response(JSON.stringify(healthData), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}

// Support for Next.js App Router / Web standard runtime
export async function GET(req?: Request) {
  return handler(req);
}
