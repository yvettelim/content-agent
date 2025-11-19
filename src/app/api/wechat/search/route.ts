import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword');

    if (!keyword) {
      return NextResponse.json(
        { error: 'Missing keyword parameter' },
        { status: 400 }
      );
    }

    // 使用API密钥
    const apiKey = '25ba56491d799f392c7d';

    // 构建外部API URL
    const externalUrl = `http://data.wxrank.com/weixin/getso?key=${encodeURIComponent(apiKey)}&keyword=${encodeURIComponent(keyword)}`;

    console.log('Proxying request to:', externalUrl);

    // 调用外部API
    const response = await fetch(externalUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`External API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // 返回响应
    return NextResponse.json(data);

  } catch (error) {
    console.error('Search articles proxy error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'Search articles failed',
        message: errorMessage
      },
      { status: 500 }
    );
  }
}
