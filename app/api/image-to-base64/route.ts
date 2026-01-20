import { NextRequest, NextResponse } from 'next/server';

/**
 * API route to fetch an image from a URL and convert it to base64
 * This bypasses CORS issues by fetching server-side
 */
export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Fetch the image from the URL
    const response = await fetch(url, {
      headers: {
        'Accept': 'image/*',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.statusText}` },
        { status: response.status }
      );
    }

    // Convert to buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Convert to base64
    const base64 = buffer.toString('base64');
    
    // Determine content type
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const dataUrl = `data:${contentType};base64,${base64}`;

    return NextResponse.json({
      dataUrl,
      contentType,
    });
  } catch (error: any) {
    console.error('Error converting image to base64:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to convert image to base64' },
      { status: 500 }
    );
  }
}

