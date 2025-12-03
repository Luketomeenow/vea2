# 📦 Supabase Storage Setup Guide

## ✅ **Storage Buckets Created:**
You've already created:
- ✅ `photos` - For AI-generated images
- ✅ `video` - For AI-generated videos

---

## 🔧 **Required Configuration:**

### **Step 1: Make Buckets Public**

1. **Go to Supabase Dashboard** → https://supabase.com/dashboard
2. **Select your project**
3. **Click "Storage"** in the left sidebar
4. **For Each Bucket (`photos` and `video`):**
   - Click the bucket name
   - Click the **⚙️ Settings** icon (top right)
   - Toggle **"Public bucket"** to **ON**
   - Click **"Save"**

---

### **Step 2: Set Up Storage Policies (Optional for Better Security)**

If you want user-specific folders, run this SQL in **SQL Editor**:

```sql
-- Allow authenticated users to upload to their own folders
CREATE POLICY "Users can upload to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'photos' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can upload videos to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'video' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow anyone to view files (public buckets)
CREATE POLICY "Anyone can view photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'photos');

CREATE POLICY "Anyone can view videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'video');

-- Allow users to delete their own files
CREATE POLICY "Users can delete own photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'photos' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own videos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'video' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);
```

---

## 🎯 **How It Works Now:**

### **Image Generation:**
1. User asks AI: "Generate an image of X"
2. AI calls Kie.ai 4O Image API
3. Kie.ai returns image URL
4. **App downloads image** from Kie.ai
5. **App uploads to Supabase Storage** → `photos/{userId}/image-{timestamp}.png`
6. **App saves storage URL to database** → `chat_messages.metadata`
7. User sees image in chat (from Supabase Storage)
8. Toast notification: "Image saved to your library" ✅

### **Video Generation:**
1. User asks AI: "Generate a video of Y"
2. AI calls Kie.ai Veo 3 API
3. App polls for video status (with progress indicator)
4. Once complete, Kie.ai returns video URL
5. **App downloads video** from Kie.ai
6. **App uploads to Supabase Storage** → `video/{userId}/video-{timestamp}.mp4`
7. **App saves storage URL to database** → `chat_messages.metadata`
8. User sees video in chat (from Supabase Storage)
9. Toast notification: "Video saved to your library" ✅

---

## 🔍 **Chat History:**

- All images and videos are **saved to chat_messages.metadata**
- When you reload the chat, it pulls media from the database
- Media displays from **Supabase Storage URLs** (not temporary Kie.ai URLs)
- Your media is **permanently stored** in your Supabase project

---

## 📂 **File Structure in Storage:**

```
photos/
  └── {user-id}/
      ├── image-1729123456789-abc123.png
      ├── image-1729123567890-def456.png
      └── ...

video/
  └── {user-id}/
      ├── video-1729123456789-xyz789.mp4
      ├── video-1729123567890-qrs456.mp4
      └── ...
```

---

## 🐛 **Troubleshooting:**

### **Media not appearing?**
1. Check buckets are **public**
2. Check browser console for errors
3. Verify storage policies allow uploads

### **Upload failing?**
1. Check Supabase project has storage enabled
2. Check you're not exceeding storage quota
3. Check network connectivity

### **Media not persisting in chat?**
1. Run the `FINAL_FIX_WITH_DATA.sql` script first (fixes RLS)
2. Make sure you're logged in (not using temp session)
3. Check database has `chat_messages` table

---

## ✅ **Test It:**

1. **Go to your dashboard** → http://localhost:5173
2. **Open AI Assistant**
3. **Type:** "Generate an image of a sunset over mountains"
4. **Wait for generation** (10-15 seconds)
5. **See toast:** "Image saved to your library"
6. **Refresh the page** → Image should still be there!
7. **Go to Supabase Storage** → See your image in `photos/` bucket

🎉 **That's it! Your media is now being saved!**

















