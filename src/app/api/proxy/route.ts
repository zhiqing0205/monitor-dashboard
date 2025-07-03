import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url, headers: requestHeaders, method = 'GET' } = await request.json();
    
    console.log('🔗 [Proxy Debug] Proxying request to:', url);
    console.log('🔑 [Proxy Debug] Headers count:', Object.keys(requestHeaders || {}).length);
    
    // 过滤掉一些可能导致问题的headers
    const filteredHeaders: Record<string, string> = {};
    if (requestHeaders) {
      Object.entries(requestHeaders).forEach(([key, value]) => {
        const lowerKey = key.toLowerCase();
        // 过滤掉一些浏览器自动添加的headers
        if (!['host', 'origin', 'referer', 'user-agent'].includes(lowerKey)) {
          filteredHeaders[key] = value as string;
        }
      });
    }
    
    console.log('📤 [Proxy Debug] Filtered headers:', Object.keys(filteredHeaders));
    
    const response = await fetch(url, {
      method,
      headers: filteredHeaders,
    });
    
    console.log('📥 [Proxy Debug] Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [Proxy Debug] Response error:', errorText);
      return NextResponse.json(
        { error: `HTTP ${response.status}: ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log('✅ [Proxy Debug] Response data received');
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ [Proxy Debug] Fetch error:', error);
    return NextResponse.json(
      { error: 'Proxy request failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}