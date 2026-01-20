import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

/**
 * Generate pre-signed URLs for S3 objects
 * POST /api/s3-presigned
 * Body: { urls: string[] } - Array of S3 URLs or keys
 * 
 * Returns: { urls: string[] } - Array of pre-signed URLs
 */
export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_S3_BUCKET_NAME) {
      console.error('Missing AWS credentials in environment variables');
      return NextResponse.json(
        { error: 'S3 configuration is missing. Please check your environment variables.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { urls } = body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: 'URLs array is required' },
        { status: 400 }
      );
    }

    // Limit to prevent abuse
    if (urls.length > 20) {
      return NextResponse.json(
        { error: 'Maximum 20 URLs allowed per request' },
        { status: 400 }
      );
    }

    const bucketName = process.env.AWS_S3_BUCKET_NAME!;
    const region = process.env.AWS_REGION || 'us-east-1';
    const expirationTime = 3600; // 1 hour

    // Extract S3 keys from URLs
    const extractKey = (url: string): string => {
      try {
        // If it's already a key (doesn't start with http), return as is
        if (!url.startsWith('http')) {
          return url;
        }

        // Parse the URL
        const urlObj = new URL(url);
        let pathname = urlObj.pathname;
        
        // Remove leading slash
        if (pathname.startsWith('/')) {
          pathname = pathname.slice(1);
        }
        
        // If pathname is empty, the URL might be malformed
        if (!pathname) {
          console.warn(`Could not extract key from URL: ${url}`);
          return url; // Return original as fallback
        }
        
        return pathname;
      } catch (error) {
        // If URL parsing fails, assume it's already a key
        console.warn(`Error parsing URL ${url}, treating as key:`, error);
        return url;
      }
    };

    // Generate pre-signed URLs
    const presignedUrls = await Promise.all(
      urls.map(async (url) => {
        try {
          const key = extractKey(url);
          
          if (!key) {
            return { original: url, presigned: null, error: 'Invalid URL format' };
          }

          const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: key,
          });

          const presignedUrl = await getSignedUrl(s3Client, command, {
            expiresIn: expirationTime,
          });

          return { original: url, presigned: presignedUrl };
        } catch (error: any) {
          console.error(`Error generating pre-signed URL for ${url}:`, error);
          return { original: url, presigned: null, error: error.message };
        }
      })
    );

    return NextResponse.json({
      urls: presignedUrls,
    });
  } catch (error: any) {
    console.error('Pre-signed URL generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate pre-signed URLs' },
      { status: 500 }
    );
  }
}

