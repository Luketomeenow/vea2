// Google Cloud Vertex AI Integration for Image & Video Generation
// Image: Imagen API (Google's Imagen 3.0)
// Video: Veo API (Google's Veo video generation)
// Documentation: 
// - https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/imagen-api
// - https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/veo-video-generation

const VERTEX_AI_PROJECT_ID = import.meta.env.VITE_VERTEX_AI_PROJECT_ID;
const VERTEX_AI_LOCATION = import.meta.env.VITE_VERTEX_AI_LOCATION || 'us-central1';
const VERTEX_AI_ACCESS_TOKEN = import.meta.env.VITE_VERTEX_AI_ACCESS_TOKEN;

interface VertexAIResponse {
  success: boolean;
  data?: any;
  error?: string;
  taskId?: string;
}

// Generate access token using gcloud CLI (for development)
// In production, use service account key or OAuth2
const getAccessToken = async (): Promise<string> => {
  if (VERTEX_AI_ACCESS_TOKEN) {
    return VERTEX_AI_ACCESS_TOKEN;
  }
  
  // For development, you can use gcloud auth print-access-token
  // In production, implement proper authentication
  throw new Error('Please set VITE_VERTEX_AI_ACCESS_TOKEN in your .env file');
};

// Image Generation using Google Cloud Imagen API
export const generateImageWithImagen = async (prompt: string): Promise<VertexAIResponse> => {
  try {
    if (!VERTEX_AI_PROJECT_ID) {
      return {
        success: false,
        error: 'Please set VITE_VERTEX_AI_PROJECT_ID in your .env file'
      };
    }

    console.log('🎨 Generating image with Google Cloud Imagen:', prompt);

    const accessToken = await getAccessToken();
    const apiUrl = `https://${VERTEX_AI_LOCATION}-aiplatform.googleapis.com/v1/projects/${VERTEX_AI_PROJECT_ID}/locations/${VERTEX_AI_LOCATION}/publishers/google/models/imagen-3.0-generate-002:predict`;

    const requestBody = {
      instances: [
        {
          prompt: prompt,
        }
      ],
      parameters: {
        sampleCount: 1,
        aspectRatio: "1:1",
        safetyFilterLevel: "block_some",
        personGeneration: "allow_adult",
        addWatermark: false,
      }
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Imagen API Error:', errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Imagen API Response:', data);

    if (data.predictions && data.predictions.length > 0) {
      const prediction = data.predictions[0];
      const imageData = prediction.bytesBase64Encoded;
      
      if (imageData) {
        // Convert base64 to data URL
        const mimeType = prediction.mimeType || 'image/png';
        const dataUrl = `data:${mimeType};base64,${imageData}`;
        
        return {
          success: true,
          data: { 
            url: dataUrl,
            mimeType: mimeType,
            enhancedPrompt: prediction.prompt // If prompt enhancement was used
          },
        };
      }
    }

    throw new Error('No image data in response');
  } catch (error: any) {
    console.error('❌ Imagen Generation Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate image',
    };
  }
};

// Video Generation using Google Cloud Veo API
export const generateVideoWithVeo = async (prompt: string): Promise<VertexAIResponse> => {
  try {
    if (!VERTEX_AI_PROJECT_ID) {
      return {
        success: false,
        error: 'Please set VITE_VERTEX_AI_PROJECT_ID in your .env file'
      };
    }

    console.log('🎬 Generating video with Google Cloud Veo:', prompt);

    const accessToken = await getAccessToken();
    const apiUrl = `https://${VERTEX_AI_LOCATION}-aiplatform.googleapis.com/v1/projects/${VERTEX_AI_PROJECT_ID}/locations/${VERTEX_AI_LOCATION}/publishers/google/models/veo-3:predict`;

    const requestBody = {
      instances: [
        {
          prompt: prompt,
        }
      ],
      parameters: {
        sampleCount: 1,
        aspectRatio: "16:9",
        duration: "5s", // Default duration
        safetyFilterLevel: "block_some",
        personGeneration: "allow_adult",
      }
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Veo API Error:', errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Veo API Response:', data);

    if (data.predictions && data.predictions.length > 0) {
      const prediction = data.predictions[0];
      const videoData = prediction.bytesBase64Encoded;
      
      if (videoData) {
        // Convert base64 to data URL
        const mimeType = prediction.mimeType || 'video/mp4';
        const dataUrl = `data:${mimeType};base64,${videoData}`;
        
        return {
          success: true,
          data: { 
            url: dataUrl,
            mimeType: mimeType,
            enhancedPrompt: prediction.prompt
          },
        };
      }
    }

    // If no immediate video data, check if it's an async operation
    if (data.operation && data.operation.name) {
      // This is an async operation - return task ID for polling
      return {
        success: true,
        data: data,
        taskId: data.operation.name,
      };
    }

    throw new Error('No video data in response');
  } catch (error: any) {
    console.error('❌ Veo Generation Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate video',
    };
  }
};

// Check Veo video generation status (for async operations)
export const checkVeoVideoStatus = async (operationName: string): Promise<VertexAIResponse> => {
  try {
    if (!VERTEX_AI_PROJECT_ID) {
      throw new Error('Vertex AI project ID not configured');
    }

    const accessToken = await getAccessToken();
    const apiUrl = `https://${VERTEX_AI_LOCATION}-aiplatform.googleapis.com/v1/${operationName}`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Veo Status Error:', errorText);
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    console.log('🎬 Veo Status Response:', data);

    let status = 'PROCESSING';
    let videoUrl = null;
    let progress = 0;

    if (data.done) {
      if (data.error) {
        status = 'FAILED';
        console.error('❌ Video generation failed:', data.error);
      } else if (data.response) {
        status = 'SUCCESS';
        // Extract video URL from response
        const prediction = data.response.predictions?.[0];
        if (prediction?.bytesBase64Encoded) {
          const mimeType = prediction.mimeType || 'video/mp4';
          videoUrl = `data:${mimeType};base64,${prediction.bytesBase64Encoded}`;
        }
        progress = 100;
      }
    } else {
      // Still processing - estimate progress based on time elapsed
      // This is a rough estimate since Google doesn't provide exact progress
      progress = Math.min(50, Date.now() % 100); // Placeholder progress
    }

    return {
      success: true,
      data: {
        status,
        progress,
        videoUrl,
        operationName,
        rawResponse: data
      },
    };
  } catch (error: any) {
    console.error('❌ Veo Status Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to check video status',
    };
  }
};

// Detect if user wants to generate image or video
export const detectMediaRequest = (message: string): {
  type: 'text' | 'image' | 'video';
  cleanPrompt?: string;
} => {
  const lowerMessage = message.toLowerCase();
  
  // Video generation keywords
  const videoKeywords = [
    'video', 'animate', 'animation', 'moving', 'footage', 'clip', 'movie', 'cinematic'
  ];
  
  // Image generation keywords
  const imageKeywords = [
    'image', 'picture', 'photo', 'illustration', 'draw', 'paint',
    'visualize', 'design', 'logo', 'artwork', 'sketch', 'render'
  ];
  
  // Action words that indicate generation
  const actionWords = ['generate', 'create', 'make', 'produce', 'build', 'show me'];
  
  // Check if message contains action + media type
  const hasAction = actionWords.some(action => lowerMessage.includes(action));
  
  // Check for video request
  if (hasAction && videoKeywords.some(keyword => lowerMessage.includes(keyword))) {
    // Extract the main subject from the prompt
    let cleanPrompt = message
      .replace(/^(can you|could you|please|would you)/gi, '')
      .replace(/generate|create|make|produce|build|show me/gi, '')
      .replace(/a?\s*video\s*(of)?/gi, '')
      .replace(/\?/g, '')
      .trim();
    return { type: 'video', cleanPrompt: cleanPrompt || message };
  }
  
  // Check for image request
  if (hasAction && imageKeywords.some(keyword => lowerMessage.includes(keyword))) {
    // Extract the main subject from the prompt
    let cleanPrompt = message
      .replace(/^(can you|could you|please|would you)/gi, '')
      .replace(/generate|create|make|draw|produce|build|show me/gi, '')
      .replace(/a?n?\s*(image|picture|photo|illustration|drawing|painting)\s*(of)?/gi, '')
      .replace(/\?/g, '')
      .trim();
    return { type: 'image', cleanPrompt: cleanPrompt || message };
  }
  
  return { type: 'text' };
};

// Enhanced prompts for better results with Vertex AI
export const enhancePrompt = (prompt: string, type: 'image' | 'video'): string => {
  if (type === 'image') {
    return `${prompt}, professional quality, high detail, 4k resolution, photorealistic`;
  } else {
    // Veo works best with detailed, cinematic prompts
    return `${prompt}, smooth motion, cinematic quality, professional video, high definition`;
  }
};

// Upscale image using Imagen API
export const upscaleImage = async (imageData: string, upscaleFactor: 'x2' | 'x4' = 'x2'): Promise<VertexAIResponse> => {
  try {
    if (!VERTEX_AI_PROJECT_ID) {
      return {
        success: false,
        error: 'Please set VITE_VERTEX_AI_PROJECT_ID in your .env file'
      };
    }

    console.log('🔍 Upscaling image with Imagen API');

    const accessToken = await getAccessToken();
    const apiUrl = `https://${VERTEX_AI_LOCATION}-aiplatform.googleapis.com/v1/projects/${VERTEX_AI_PROJECT_ID}/locations/${VERTEX_AI_LOCATION}/publishers/google/models/imagegeneration@002:predict`;

    // Convert data URL to base64
    const base64Data = imageData.includes(',') ? imageData.split(',')[1] : imageData;

    const requestBody = {
      instances: [
        {
          prompt: "Upscale this image",
          image: {
            bytesBase64Encoded: base64Data
          }
        }
      ],
      parameters: {
        sampleCount: 1,
        mode: "upscale",
        upscaleConfig: {
          upscaleFactor: upscaleFactor
        }
      }
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Imagen Upscale Error:', errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Imagen Upscale Response:', data);

    if (data.predictions && data.predictions.length > 0) {
      const prediction = data.predictions[0];
      const upscaledData = prediction.bytesBase64Encoded;
      
      if (upscaledData) {
        const mimeType = prediction.mimeType || 'image/png';
        const dataUrl = `data:${mimeType};base64,${upscaledData}`;
        
        return {
          success: true,
          data: { 
            url: dataUrl,
            mimeType: mimeType,
            upscaleFactor: upscaleFactor
          },
        };
      }
    }

    throw new Error('No upscaled image data in response');
  } catch (error: any) {
    console.error('❌ Imagen Upscale Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to upscale image',
    };
  }
};
