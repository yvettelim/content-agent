import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, comment_id } = body;

    if (!url || !comment_id) {
      return NextResponse.json(
        { error: 'Missing url or comment_id parameter' },
        { status: 400 }
      );
    }

    // Use API key
    const apiKey = '25ba56491d799f392c7d';

    // Build external API URL
    const externalUrl = `http://data.wxrank.com/weixin/getrk`;

    console.log('Proxying article rank request to:', externalUrl);

    // Call external API
    const response = await fetch(externalUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: apiKey,
        url: url,
        comment_id: comment_id
      }),
    });

    if (!response.ok) {
      throw new Error(`External API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Return response
    return NextResponse.json(data);

  } catch (error) {
    console.error('Article rank proxy error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'Get article rank failed',
        message: errorMessage
      },
      { status: 500 }
    );
  }
}