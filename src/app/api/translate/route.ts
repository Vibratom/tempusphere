
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { text, sourceLang, targetLang } = await req.json();

    if (!text || !sourceLang || !targetLang) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });

    const prompt = `Translate the following text from ${sourceLang} to ${targetLang}. Only provide the translated text, with no additional commentary or explanations.

Text to translate:
"${text}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const translation = response.text();
    
    return NextResponse.json({ translation });

  } catch (error: any) {
    console.error('Error generating translation:', error);
    return NextResponse.json({ error: 'Failed to generate translation', details: error.message }, { status: 500 });
  }
}
