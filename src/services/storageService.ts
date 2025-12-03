import { supabase } from '@/lib/supabase';

/**
 * Upload a file from URL to Supabase Storage
 * @param url - The URL of the file to download and upload
 * @param bucket - The storage bucket name ('photos' or 'video')
 * @param fileName - The file name to use in storage
 * @returns The public URL of the uploaded file
 */
export async function uploadMediaFromUrl(
  url: string,
  bucket: 'photos' | 'video',
  fileName: string
): Promise<{ url: string | null; error: string | null }> {
  try {
    console.log(`📤 Uploading to Supabase Storage: ${bucket}/${fileName}`);

    // Download the file from the URL
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download file from URL: ${response.statusText}`);
    }

    const blob = await response.blob();
    const file = new File([blob], fileName, { type: blob.type });

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true, // Replace if exists
      });

    if (error) {
      console.error('Storage upload error:', error);
      return { url: null, error: error.message };
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    console.log(`✅ Uploaded successfully: ${publicUrlData.publicUrl}`);

    return { url: publicUrlData.publicUrl, error: null };
  } catch (error: any) {
    console.error('Error uploading media:', error);
    return { url: null, error: error.message || 'Failed to upload media' };
  }
}

/**
 * Generate a unique file name for storage
 * @param userId - The user ID
 * @param type - The media type ('image' or 'video')
 * @param extension - The file extension (e.g., 'png', 'mp4')
 * @returns A unique file name
 */
export function generateMediaFileName(
  userId: string,
  type: 'image' | 'video',
  extension: string
): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `${userId}/${type}-${timestamp}-${random}.${extension}`;
}

/**
 * Delete a file from Supabase Storage
 * @param bucket - The storage bucket name
 * @param filePath - The path to the file in storage
 * @returns Success status
 */
export async function deleteMediaFromStorage(
  bucket: 'photos' | 'video',
  filePath: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('Storage delete error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error deleting media:', error);
    return { success: false, error: error.message || 'Failed to delete media' };
  }
}

/**
 * Get the storage path from a public URL
 * @param publicUrl - The public URL from Supabase Storage
 * @param bucket - The storage bucket name
 * @returns The file path in storage
 */
export function getStoragePathFromUrl(publicUrl: string, bucket: string): string | null {
  try {
    const url = new URL(publicUrl);
    const pathParts = url.pathname.split(`/storage/v1/object/public/${bucket}/`);
    return pathParts[1] || null;
  } catch {
    return null;
  }
}

















