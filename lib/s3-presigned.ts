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
    if (urls.length === 0) {
      return new Map();
    }

    // Batch requests if more than 50 URLs (API limit)
    const BATCH_SIZE = 50;
    const urlMap = new Map<string, string>();

    if (urls.length <= BATCH_SIZE) {
      // Single request for small batches
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
      data.urls.forEach((item: { original: string; presigned: string | null; error?: string }) => {
        if (item.presigned) {
          urlMap.set(item.original, item.presigned);
        } else {
          // Fallback to original URL if pre-signing fails
          urlMap.set(item.original, item.original);
        }
      });
    } else {
      // Batch requests for large arrays
      const batches: string[][] = [];
      for (let i = 0; i < urls.length; i += BATCH_SIZE) {
        batches.push(urls.slice(i, i + BATCH_SIZE));
      }

      // Fetch all batches in parallel
      const batchPromises = batches.map(async (batch) => {
        const response = await fetch('/api/s3-presigned', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ urls: batch }),
        });

        if (!response.ok) {
          const error = await response.json();
          console.error('Error fetching pre-signed URLs batch:', error);
          // Return fallback map for this batch
          const fallbackMap = new Map<string, string>();
          batch.forEach((url) => fallbackMap.set(url, url));
          return fallbackMap;
        }

        const data = await response.json();
        const batchMap = new Map<string, string>();
        data.urls.forEach((item: { original: string; presigned: string | null; error?: string }) => {
          if (item.presigned) {
            batchMap.set(item.original, item.presigned);
          } else {
            batchMap.set(item.original, item.original);
          }
        });
        return batchMap;
      });

      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach((batchMap) => {
        batchMap.forEach((value, key) => urlMap.set(key, value));
      });
    }

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

