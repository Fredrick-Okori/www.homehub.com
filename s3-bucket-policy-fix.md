# Fix S3 Bucket Access Denied Error

## Problem
You're getting "Access Denied" when trying to view images from your S3 bucket. This means the bucket doesn't allow public read access.

## Solution

### Step 1: Update S3 Bucket Policy

1. Go to AWS S3 Console
2. Select your bucket
3. Go to **Permissions** tab
4. Scroll to **Bucket Policy**
5. Add this policy (replace `your-bucket-name` with your actual bucket name):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/listings/*"
    }
  ]
}
```

### Step 2: Configure Block Public Access Settings

1. In the same **Permissions** tab
2. Click **Edit** on "Block public access (bucket settings)"
3. **Uncheck** "Block all public access" (or at least uncheck "Block public access to buckets and objects granted through new public bucket or access point policies")
4. Save changes
5. Confirm the change

### Step 3: Configure CORS (if accessing from browser)

1. Go to **Permissions** tab
2. Scroll to **Cross-origin resource sharing (CORS)**
3. Add this CORS configuration:

```json
[
  {
    "AllowedHeaders": [
      "*"
    ],
    "AllowedMethods": [
      "GET",
      "HEAD"
    ],
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://your-domain.com"
    ],
    "ExposeHeaders": [
      "ETag"
    ],
    "MaxAgeSeconds": 3000
  }
]
```

Replace `your-domain.com` with your actual production domain.

### Step 4: Verify Object ACLs (if using ACLs)

If your bucket allows ACLs:
1. Go to **Permissions** tab
2. Under "Object Ownership", make sure it's set to "ACLs enabled"
3. The upload code should set `ACL: 'public-read'` (but we removed this because your bucket has ACLs disabled)

## Alternative: Use Pre-signed URLs (More Secure)

If you don't want public access, you can generate pre-signed URLs that expire after a certain time. This requires updating the upload route and how you store/retrieve URLs.

## Testing

After making these changes:
1. Try accessing an image URL directly in your browser
2. You should see the image instead of "Access Denied"
3. The listing details page should now display images correctly

