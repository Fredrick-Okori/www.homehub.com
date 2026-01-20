'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Plus,
  X,
  Upload,
  Image as ImageIcon,
  Video,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

// Validation schema
const listingFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  location: z.string().min(1, 'Location is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.string().min(1, 'Price is required').refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, 'Price must be a valid number greater than 0'),
});

type ListingFormValues = z.infer<typeof listingFormSchema>;

interface MediaFile {
  file: File;
  preview: string;
  type: 'image' | 'video';
  url?: string; // Will be populated after S3 upload
}

export default function CreateListingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [mediaFiles, setMediaFiles] = React.useState<MediaFile[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<ListingFormValues>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
      title: '',
      location: '',
      description: '',
      price: '',
    },
  });

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (mediaFiles.length + files.length > 4) {
      toast.error('Maximum 4 media files allowed');
      return;
    }

    files.forEach((file) => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');

      if (!isImage && !isVideo) {
        toast.error(`${file.name} is not a valid image or video file`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = e.target?.result as string;
        setMediaFiles((prev) => [
          ...prev,
          {
            file,
            preview,
            type: isImage ? 'image' : 'video',
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    e.target.value = '';
  };

  // Remove media file
  const handleRemoveMedia = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Upload media to S3 via API route
  const uploadMediaToS3 = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload file');
    }

    const data = await response.json();
    return data.url;
  };

  // Handle form submission
  const onSubmit = async (data: ListingFormValues) => {
    if (mediaFiles.length === 0) {
      toast.error('Please upload at least one media file');
      return;
    }

    setIsSubmitting(true);
    setIsUploading(true);

    try {
      // Upload all media files to S3
      const mediaUrls: string[] = [];
      
      for (let i = 0; i < mediaFiles.length; i++) {
        const mediaFile = mediaFiles[i];
        try {
          toast.loading(`Uploading file ${i + 1} of ${mediaFiles.length}...`);
          const url = await uploadMediaToS3(mediaFile.file);
          mediaUrls.push(url);
          // Update the media file with the URL
          setMediaFiles((prev) => {
            const updated = [...prev];
            updated[i].url = url;
            return updated;
          });
        } catch (error) {
          console.error(`Failed to upload ${mediaFile.file.name}:`, error);
          toast.error(`Failed to upload ${mediaFile.file.name}. Please try again.`);
          setIsSubmitting(false);
          setIsUploading(false);
          return;
        }
      }
      
      toast.dismiss(); // Dismiss loading toast

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You must be logged in to create a listing');
        router.push('/admin/login');
        return;
      }

      // Try to use user.id, but if profile doesn't exist, use null
      // The foreign key constraint requires created_by to reference profiles.id
      // If the profile doesn't exist, we'll set it to null (column is nullable)
      let createdById: string | null = user.id;
      
      // Try inserting with user.id first
      let insertData = {
        title: data.title,
        description: data.description,
        images: mediaUrls.length > 0 ? mediaUrls : null, // Array of image/video URLs (text[])
        created_by: createdById,
        status: 'available', // Default status in table
      };

      console.log('Inserting listing with data:', insertData);

      // Save listing to Supabase
      // Table structure: id, title, description, images, status, created_by, created_at, updated_at
      // Missing from table: location, price, type, beds, baths, area
      let { data: listing, error } = await supabase
        .from('listings')
        .insert(insertData)
        .select()
        .single();

      // If foreign key constraint fails (profile doesn't exist), try with null
      if (error && error.code === '23503') {
        console.warn('Foreign key constraint failed (profile may not exist), trying with created_by = null');
        insertData.created_by = null;
        const retryResult = await supabase
          .from('listings')
          .insert(insertData)
          .select()
          .single();
        listing = retryResult.data;
        error = retryResult.error;
      }

      if (error) {
        console.error('Error creating listing:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        console.error('Error details:', error.details);
        console.error('Error hint:', error.hint);
        toast.error(`Failed to create listing: ${error.message || error.code || 'Unknown error'}`);
        setIsSubmitting(false);
        return;
      }

      toast.success('Listing created successfully!');
      router.push('/dashboard/listings');
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New Listing</h1>
          <p className="text-muted-foreground mt-1">
            Add a new property listing to your portfolio
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Media Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle>Media</CardTitle>
              <CardDescription>
                Upload up to 4 images or videos. At least 1 is required.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Media Preview Grid */}
                {mediaFiles.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {mediaFiles.map((media, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-video rounded-lg overflow-hidden bg-muted border-2 border-dashed">
                          {media.type === 'image' ? (
                            <img
                              src={media.preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <video
                              src={media.preview}
                              className="w-full h-full object-cover"
                              controls={false}
                            />
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveMedia(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <div className="absolute bottom-2 left-2">
                          {media.type === 'image' ? (
                            <ImageIcon className="h-4 w-4 text-white drop-shadow" />
                          ) : (
                            <Video className="h-4 w-4 text-white drop-shadow" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Button */}
                {mediaFiles.length < 4 && (
                  <div>
                    <Label htmlFor="media-upload" className="cursor-pointer">
                      <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload images or videos
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {mediaFiles.length} / 4 files
                        </p>
                      </div>
                    </Label>
                    <input
                      id="media-upload"
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={isUploading || isSubmitting}
                    />
                  </div>
                )}

                {isUploading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Uploading media files...</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Provide the essential details about your property
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Modern Downtown Loft"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Kampala, Uganda"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 450000"
                        step="0.01"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the price in your local currency
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the property in detail..."
                        className="min-h-[120px]"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a detailed description of the property
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isUploading}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Listing
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

