import { NextRequest, NextResponse } from 'next/server';
import { POST as analyzeTextV1 } from '../v1/analyze/text/route';

export async function POST(req: NextRequest): Promise<NextResponse> {
  return analyzeTextV1(req);
}
