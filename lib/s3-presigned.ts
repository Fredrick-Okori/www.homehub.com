/**
 * Utility functions for generating pre-signed S3 URLs
 */

/**
 * Get pre-signed URLs for S3 objects
 * @param urls Array of S3 URLs or keys
 * @returns Array of pre-signed URLs
 */
export async function getPresignedUrls(urls: string[]): Promise<Map<string, string>> {
  try {
    const response = await fetch('/api/s3-presigned', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ urls }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Error fetching pre-signed URLs:', error);
      throw new Error(error.error || 'Failed to get pre-signed URLs');
    }

    const data = await response.json();
    const urlMap = new Map<string, string>();

    data.urls.forEach((item: { original: string; presigned: string | null; error?: string }) => {
      if (item.presigned) {
        urlMap.set(item.original, item.presigned);
      } else {
        console.warn(`Failed to get pre-signed URL for ${item.original}:`, item.error);
        // Fallback to original URL if pre-signing fails
        urlMap.set(item.original, item.original);
      }
    });

    return urlMap;
  } catch (error) {
    console.error('Error in getPresignedUrls:', error);
    // Return a map with original URLs as fallback
    const urlMap = new Map<string, string>();
    urls.forEach((url) => urlMap.set(url, url));
    return urlMap;
  }
}

/**
 * Get a single pre-signed URL
 * @param url S3 URL or key
 * @returns Pre-signed URL
 */
export async function getPresignedUrl(url: string): Promise<string> {
  const urlMap = await getPresignedUrls([url]);
  return urlMap.get(url) || url;
}

