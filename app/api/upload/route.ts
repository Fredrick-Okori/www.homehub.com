import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

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

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: 'File must be an image or video' },
        { status: 400 }
      );
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 50MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Get folder and subfolder from query parameters
    const requestUrl = new URL(request.url);
    const folder = requestUrl.searchParams.get('folder') || 'listings';
    const subfolder = requestUrl.searchParams.get('subfolder'); // For applicant name folder (surname-givenname)
    
    // Generate unique file name
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}-${randomString}-${sanitizedFileName}`;
    
    // Build the S3 key path
    // For applications: applications/{surname-givenname}/fileName
    // For listings: listings/fileName
    const key = subfolder 
      ? `${folder}/${subfolder}/${fileName}`
      : `${folder}/${fileName}`;
    
    console.log('Uploading to S3:', { folder, subfolder, fileName, key });

    // Upload to S3
    // Note: ACL is removed because the bucket has ACLs disabled
    // Make sure your bucket policy allows public read access if needed
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      CacheControl: 'max-age=31536000', // Cache for 1 year
    });

    await s3Client.send(command);

    // Construct the S3 URL
    // Format: https://bucket-name.s3.region.amazonaws.com/key
    const region = process.env.AWS_REGION || 'us-east-1';
    const bucketName = process.env.AWS_S3_BUCKET_NAME!;
    
    // Handle different S3 URL formats based on region
    let url: string;
    if (region === 'us-east-1') {
      // us-east-1 uses a different URL format
      url = `https://${bucketName}.s3.amazonaws.com/${key}`;
    } else {
      url = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
    }

    return NextResponse.json({
      url,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      key, // Return the S3 key for reference
    });
  } catch (error: any) {
    console.error('S3 Upload error:', error);
    
    // Provide more specific error messages
    if (error.name === 'CredentialsProviderError' || error.message?.includes('credentials')) {
      return NextResponse.json(
        { error: 'Invalid AWS credentials. Please check your environment variables.' },
        { status: 500 }
      );
    }
    
    if (error.name === 'NoSuchBucket') {
      return NextResponse.json(
        { error: 'S3 bucket not found. Please check your bucket name.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to upload file to S3' },
      { status: 500 }
    );
  }
}

