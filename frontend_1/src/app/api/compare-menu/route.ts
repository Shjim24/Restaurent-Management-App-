import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get('name');

  console.log('[API] Received compare-menu request');
  console.log('[API] Query param name:', name);

  if (!name) {
    console.warn('[API] Missing "name" query parameter');
    return NextResponse.json({ error: 'Missing name parameter' }, { status: 400 });
  }

  const prompt = `
You are a food menu matching assistant helping compare prices in Dhaka, Bangladesh.

Find up to 2 items to 20(genrally as much data you got 20 max) realtime menu items that are **highly similar** to the product: "${name}".
Only search for items inside **Dhaka, Bangladesh**.
Use reliable online food sources like **Foodpanda**, **Foodie**, **PathaoFood**, or **official restaurant websites** like kfc, bfc, burger Lab, Pizza Burg, Pizza Lab, Pizza Hut, Dominoz. I'm trying to say search websites but inside dhaka.
Try to extract from websites so that the data is as accurate as possible.
Respond in this exact JSON format:
[
  {
    "name": "product name",
    "price": 450,
    "restaurant_name": "restaurant name",
    "source_url": "https://link-if-available.com"
  },
  ...
]

If the item seems not like or verry irrelevant to food return empty array.. Do not include generic or irrelevant items from outside Dhaka or unrelated categories.

Only return JSON. No extra explanation, no headings — just valid JSON data.
`;

  try {
    console.log('[API] Sending request to Gemini...');
    const geminiRes = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyBu2VXEpkRl95URtIDOnMDLwwkakuZhhyU', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      }),
    });

    console.log('[API] Gemini response status:', geminiRes.status);
    const geminiJson = await geminiRes.json();
    console.log('[API] Gemini raw response:', JSON.stringify(geminiJson, null, 2));

    const contentText = geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!contentText) {
      console.warn('[API] No content text found in Gemini response');
      return NextResponse.json([], { status: 200 });
    }

    console.log('[API] Extracted content text:', contentText.slice(0, 500)); // Preview

    const match = contentText.match(/\[[\s\S]*\]/); // match array
    if (!match) {
      console.warn('[API] No JSON array found in content');
      return NextResponse.json([], { status: 200 });
    }

    let parsed: any[] = [];
    try {
      parsed = JSON.parse(match[0]);
    } catch (jsonErr) {
      console.error('[API] Failed to parse JSON from Gemini response:', jsonErr);
      return NextResponse.json([], { status: 200 });
    }

    console.log('[API] Parsed Gemini data (pre-limit):', parsed);

    const limited = parsed.slice(0, 20);
    console.log('[API] Final limited response:', limited);

    return NextResponse.json(limited);
  } catch (error) {
    console.error('[API] Unexpected error during compare-menu:', error);
    return NextResponse.json({ error: 'Failed to fetch comparison data' }, { status: 500 });
  }
}
