/**
 * Serverless PSI Telemetry Handler
 * Endpoint: GET /api/psi
 * Upstream: https://api-open.data.gov.sg/v2/real-time/api/psi
 * No API key required.
 */

const DATA_GOV_PSI_V2_ENDPOINT = 'https://api-open.data.gov.sg/v2/real-time/api/psi';

export interface DataGovV2PsiResponse {
  code: number;
  data: {
    regionMetadata: Array<{
      name: string;
      labelLocation: { latitude: number; longitude: number };
    }>;
    items: Array<{
      date: string;
      updatedTimestamp: string;
      timestamp: string;
      readings: Record<string, Record<string, number>>;
    }>;
  };
  errorMsg?: string;
}

export default async function handler(req: any, res?: any) {
  // Handle CORS preflight
  if (req && req.method === 'OPTIONS') {
    if (res && typeof res.status === 'function') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      return res.status(204).end();
    }
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  try {
    const upstreamResponse = await fetch(DATA_GOV_PSI_V2_ENDPOINT, {
      headers: {
        'User-Agent': 'Singapore-PSI-Live-Monitor/1.0',
        'Accept': 'application/json',
      },
    });

    if (!upstreamResponse.ok) {
      throw new Error(
        `data.gov.sg upstream error: HTTP ${upstreamResponse.status} ${upstreamResponse.statusText}`
      );
    }

    const json: DataGovV2PsiResponse = await upstreamResponse.json();

    if (json.code !== 0 || !json.data || !json.data.items || json.data.items.length === 0) {
      throw new Error(json.errorMsg || 'Invalid payload received from data.gov.sg');
    }

    const latestItem = json.data.items[json.data.items.length - 1];
    const readings = latestItem.readings || {};
    const psi24 = readings.psi_twenty_four_hourly || {};
    const pm25_24 = readings.pm25_twenty_four_hourly || {};

    // Calculate national average if not explicitly present in v2 API
    const regions = ['north', 'south', 'east', 'west', 'central'];
    const validPsiValues = regions
      .map((r) => psi24[r])
      .filter((v): v is number => typeof v === 'number');

    const nationalPsi =
      validPsiValues.length > 0
        ? Math.round(validPsiValues.reduce((a, b) => a + b, 0) / validPsiValues.length)
        : 50;

    const payload = {
      status: 'success',
      source: 'data.gov.sg',
      endpoint: DATA_GOV_PSI_V2_ENDPOINT,
      timestamp: latestItem.timestamp,
      updatedTimestamp: latestItem.updatedTimestamp,
      nationalPsi,
      readings,
      regionMetadata: json.data.regionMetadata,
      raw: json,
    };

    // Node.js / Express response
    if (res && typeof res.status === 'function') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
      return res.status(200).json(payload);
    }

    // Web Standard Fetch response
    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error: any) {
    const errorPayload = {
      status: 'error',
      message: error?.message || 'Failed to fetch PSI data from data.gov.sg',
      timestamp: new Date().toISOString(),
    };

    if (res && typeof res.status === 'function') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(502).json(errorPayload);
    }

    return new Response(JSON.stringify(errorPayload), {
      status: 502,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

// Support for Next.js App Router / Edge runtime
export async function GET(req?: Request) {
  return handler(req);
}
