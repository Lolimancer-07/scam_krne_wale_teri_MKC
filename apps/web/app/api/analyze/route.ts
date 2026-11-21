import { NextResponse } from 'next/server';
import { z } from 'zod';

const analyzeSchema = z.object({
  text: z.string().min(1).max(5000),
  enableAi: z.boolean().optional().default(false),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _input = analyzeSchema.parse(body);

    // TODO: wire up @scamshield/detector using _input.text and _input.enableAi
    return NextResponse.json({
      verdict: 'safe',
      score: 0,
      category: 'other',
      redFlags: [],
      signals: [],
      ruleScore: 0,
      fusionDetails: {
        ruleScore: 0,
        mlScore: 0,
        urlScore: 0,
        aiNudge: 0,
        finalScore: 0,
        formula: '0.5*rule + 0.3*ml + 0.15*url + 0.05*ai',
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
