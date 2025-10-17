# 🎨 AI Media Generation Setup Guide

## Google Cloud Vertex AI Setup (Recommended)

### 1. Set Up Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Vertex AI API
4. Go to [APIs & Services > Credentials](https://console.cloud.google.com/apis/credentials)
5. Create credentials (API Key or Service Account)

### 2. Get Access Token
For development, you can use:
```bash
gcloud auth print-access-token
```

### 3. Add Configuration to Your Project

**Create or edit the `.env` file** in your project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# OpenAI Configuration  
VITE_OPENAI_API_KEY=your-openai-api-key

# Google Cloud Vertex AI Configuration
VITE_VERTEX_AI_PROJECT_ID=your-google-cloud-project-id
VITE_VERTEX_AI_LOCATION=us-central1
VITE_VERTEX_AI_ACCESS_TOKEN=your-google-cloud-access-token

# Kie.ai Configuration (Alternative)
VITE_KIE_API_KEY=your-kie-api-key
```

## Kie.AI Setup (Alternative)

### 1. Get Your Kie.AI API Key
1. Go to [https://kie.ai/dashboard/api-keys](https://kie.ai/dashboard/api-keys)
2. Sign up or log in
3. Copy your API key

**Replace** `your-actual-kie-api-key-here` with your actual Kie.AI API key.

### 3. Restart Dev Server

```bash
# Stop current server (Ctrl+C)
# Then restart:
npm run dev
```

## ✅ Test It!

Try these commands in the AI Assistant:

### Image Generation:
- "Generate an image of a modern office"
- "Create a picture of a sunset"
- "Make an image of a futuristic car"

### Video Generation:
- "Generate a video of ocean waves"
- "Create a video of a product launch"
- "Make a video of a mountain landscape"

## 🎯 Features Now Available:

✅ **Smart Detection** - AI automatically detects image/video requests  
✅ **Image Generation** - Powered by Kie.AI 4O Image API  
✅ **Video Generation** - Powered by Kie.AI Runway API  
✅ **Clean Responses** - No more asterisks in chat  
✅ **Rich Media Display** - Images and videos display inline  

## 📝 Note:

- **Images**: Generate in ~2-5 seconds
- **Videos**: Take 30-60 seconds to generate
- Videos are queued and you'll be notified when ready

## 🚨 Troubleshooting:

If image/video generation doesn't work:

1. **Check API Key**: Make sure you copied it correctly to `.env`
2. **Restart Server**: API keys are loaded at startup
3. **Check Console**: Open browser DevTools to see detailed errors
4. **Verify Credits**: Make sure your Kie.AI account has credits

---

**Need Help?** Check the browser console (F12) for detailed error messages.



