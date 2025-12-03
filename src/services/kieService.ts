// Kie.ai API Integration for Image & Video Generation
// Image: Nano Banana API (Google's Gemini 2.5 Flash Image Preview)
// Video: Veo 3 API (Google's Veo 3 model)
// Documentation: https://kie.ai/nano-banana

const KIE_API_KEY = import.meta.env.VITE_KIE_API_KEY;
const KIE_IMAGE_URL = 'https://api.kie.ai/api/v1/nano-banana'; // Base Nano Banana endpoint
const KIE_VIDEO_URL = 'https://api.kie.ai/api/v1/veo/generate'; // Veo 3 API

interface KieResponse {
  success: boolean;
  data?: any;
  error?: string;
  taskId?: string;
}

// Image Generation using Kie.ai 4O Image API (GPT-4 Turbo with Vision)
// Excellent quality, takes 50-70 seconds
export const generateImage = async (prompt: string, referenceImages?: string[]): Promise<KieResponse> => {
  try {
    if (!KIE_API_KEY || KIE_API_KEY === 'ADD_YOUR_KIE_API_KEY_HERE') {
      return {
        success: false,
        error: 'Please add your Kie.ai API key to the .env file (VITE_KIE_API_KEY)'
      };
    }

    console.log('🎨 Generating image with Kie.ai:', prompt);
    if (referenceImages && referenceImages.length > 0) {
      console.log('🎨 Using reference images:', referenceImages.length);
      console.log('🎨 Reference image URLs:', referenceImages.map(img => img.substring(0, 50) + '...'));
    }

    // Prepare request body for Nano Banana
    const requestBody: any = {
      prompt: prompt,
      output_format: 'png',
      image_size: '1:1',
    };

    // Add reference images if provided
    if (referenceImages && referenceImages.length > 0) {
      // Use Nano Banana Edit model for image-to-image generation
      requestBody.model = 'google/nano-banana-edit';
      requestBody.image_urls = referenceImages; // Array of image URLs
      
      console.log('🎨 Using Nano Banana Edit model with reference images:', referenceImages.length, 'images');
      console.log('🎨 First reference image:', referenceImages[0].substring(0, 50) + '...');
    } else {
      // Use regular Nano Banana model for text-to-image generation
      requestBody.model = 'google/nano-banana';
      console.log('🎨 Using Nano Banana model for text-to-image generation');
    }

    // Log the request body for debugging
    console.log('🎨 Request body being sent to Kie.ai:', JSON.stringify(requestBody, null, 2));

    // Step 1: Submit image generation request to Nano Banana Edit
    const generateResponse = await fetch(KIE_IMAGE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${KIE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!generateResponse.ok) {
      const errorText = await generateResponse.text();
      console.error('❌ Kie.ai Generation Error:', errorText);
      throw new Error(`API Error: ${generateResponse.status}`);
    }

    const generateData = await generateResponse.json();
    console.log('✅ Nano Banana Edit Response:', generateData);
    
    // Check if the response contains the image directly (synchronous response)
    if (generateData.output && generateData.output.length > 0) {
      const imageUrl = generateData.output[0];
      console.log('✨ Image generated directly:', imageUrl);
      return {
        success: true,
        data: { url: imageUrl },
      };
    }
    
    // Check if there's a task ID for async processing
    const taskId = generateData.taskId || generateData.data?.taskId;
    
    if (!taskId) {
      // If no task ID and no direct output, check for error
      if (generateData.error) {
        throw new Error(generateData.error);
      }
      throw new Error('No taskId or output received from Nano Banana Edit');
    }
    
    console.log('📋 Image taskId:', taskId);
    
    // Step 2: Poll for result using the correct endpoint
    const maxAttempts = 15; // 150 seconds max (15 * 10 seconds = 2.5 minutes)
    let attempt = 0;
    
    while (attempt < maxAttempts) {
      attempt++;
      
      // Wait 10 seconds before polling
      console.log(`⏳ Waiting 10s before checking status (attempt ${attempt}/${maxAttempts})...`);
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      try {
        const statusUrl = `https://api.kie.ai/api/v1/nano-banana/record-info?taskId=${taskId}`;
        console.log(`🔍 Checking status: ${statusUrl}`);
        
        const statusResponse = await fetch(statusUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${KIE_API_KEY}`,
          },
        });
        
        if (!statusResponse.ok) {
          console.error(`❌ Status check failed: ${statusResponse.status}`);
          continue;
        }
        
        const statusData = await statusResponse.json();
        console.log('📦 Status response:', statusData);
        
        if (statusData.code !== 200) {
          console.error('❌ API returned error:', statusData.msg);
          continue;
        }
        
        const taskData = statusData.data;
        const successFlag = taskData.successFlag;
        const progress = taskData.progress;
        
        // successFlag: 0 = generating, 1 = success, 2 = failed
        const progressValue = parseFloat(progress);
        const isComplete = successFlag === 1 || progressValue >= 1.0;
        
        if (isComplete) {
          // Generation complete! Try to get image URL
          console.log('✨ Generation complete! Full task data:', JSON.stringify(taskData, null, 2));
          
          // Try multiple possible locations for the image URL
          let imageUrl = null;
          
          if (taskData.response?.output && taskData.response.output.length > 0) {
            imageUrl = taskData.response.output[0];
          } else if (taskData.response?.resultUrls && taskData.response.resultUrls.length > 0) {
            imageUrl = taskData.response.resultUrls[0];
          } else if (taskData.response?.url) {
            imageUrl = taskData.response.url;
          } else if (typeof taskData.response === 'string' && taskData.response.startsWith('http')) {
            imageUrl = taskData.response;
          }
          
          if (imageUrl) {
            console.log('✨ Image URL found:', imageUrl);
            return {
              success: true,
              data: { url: imageUrl },
            };
          } else {
            console.error('❌ Could not find image URL in response. Full response:', taskData.response);
            throw new Error('No image URLs in successful response. Check console for full response data.');
          }
        } else if (successFlag === 2) {
          // Failed
          const errorMsg = taskData.errorMessage || 'Image generation failed';
          console.error('❌ Generation failed:', errorMsg);
          throw new Error(errorMsg);
        } else if (successFlag === 0) {
          // Still generating
          console.log(`⏳ Still generating... Progress: ${(progressValue * 100).toFixed(1)}%`);
        }
        
      } catch (e: any) {
        console.error(`❌ Error during status check:`, e.message);
      }
    }
    
    // Timeout
    throw new Error(`Image generation timed out after ${maxAttempts * 10} seconds. TaskId: ${taskId}`);

    
  } catch (error: any) {
    console.error('❌ Kie.ai Image Generation Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate image',
    };
  }
};

// Video Generation using Veo 3 API with optional image reference
export const generateVideo = async (prompt: string, referenceImageUrl?: string): Promise<KieResponse> => {
  try {
    if (!KIE_API_KEY || KIE_API_KEY === 'ADD_YOUR_KIE_API_KEY_HERE') {
      return {
        success: false,
        error: 'Video generation is not available. Please add your Kie.ai API key to .env file.'
      };
    }

    console.log('🎬 Generating video with Kie.ai Veo 3:', prompt);

    const requestBody: any = {
      prompt: prompt,
      model: 'veo3', // or 'veo3_fast' for faster generation
      aspectRatio: '16:9',
      enableFallback: false, // Set to true to enable fallback for edge cases
      enableTranslation: true, // Auto-translate prompts to English
    };

    // Add reference image if provided
    if (referenceImageUrl) {
      requestBody.inputImage = referenceImageUrl; // Use correct parameter format
      requestBody.model = 'veo3'; // Ensure correct model
      console.log('🎬 Using reference image for video generation:', referenceImageUrl);
    }

    const response = await fetch(KIE_VIDEO_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${KIE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Kie.ai Veo 3 API Error:', errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Kie.ai Veo 3 Response:', data);
    
    // Veo 3 returns: { code: 200, msg: 'success', data: { taskId: '...' } }
    const taskId = data.data?.taskId || data.taskId;
    
    if (!taskId) {
      console.error('❌ No taskId found in response. Full response:', JSON.stringify(data, null, 2));
      throw new Error('No task ID in response. Check console for full response.');
    }

    console.log('📋 Video taskId:', taskId);

    return {
      success: true,
      data: data,
      taskId: taskId,
    };
  } catch (error: any) {
    console.error('❌ Kie.ai Veo 3 Generation Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate video',
    };
  }
};

// Check Veo 3 video generation status
export const checkVideoStatus = async (taskId: string): Promise<KieResponse> => {
  try {
    if (!KIE_API_KEY) {
      throw new Error('Kie.ai API key not configured');
    }

    // Veo 3 API status endpoint
    const statusUrl = `https://api.kie.ai/api/v1/veo/record-info?taskId=${taskId}`;
    console.log('🔍 Checking Veo 3 status:', statusUrl);

    const response = await fetch(statusUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${KIE_API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Kie.ai Veo 3 Status Error:', errorText);
      throw new Error(`API Error: ${response.status}`);
    }

    const rawData = await response.json();
    console.log('🎬 Veo 3 Status Response:', rawData);

    // Parse Veo 3 response structure
    if (rawData.code === 200 && rawData.data) {
      const taskData = rawData.data;
      const successFlag = taskData.successFlag; // 0=generating, 1=success, 2=failed
      const progress = parseFloat(taskData.progress || 0);

      let status = 'PROCESSING';
      let videoUrl = null;

      if (successFlag === 1) {
        status = 'SUCCESS';
        // Extract video URL from Veo 3 response
        videoUrl = taskData.response?.resultUrls?.[0] 
                || taskData.response?.videoUrl 
                || taskData.response?.url
                || taskData.videoUrl
                || (typeof taskData.response === 'string' && taskData.response.startsWith('http') ? taskData.response : null);
        
        console.log('✅ Video URL found:', videoUrl);
      } else if (successFlag === 2) {
        status = 'FAILED';
        console.error('❌ Video generation failed:', taskData.errorMessage);
      } else if (successFlag === 0) {
        console.log(`⏳ Still generating... Progress: ${(progress * 100).toFixed(1)}%`);
      }

      return {
        success: true,
        data: {
          status,
          progress,
          videoUrl,
          successFlag,
          errorMessage: taskData.errorMessage,
          rawResponse: taskData.response
        },
      };
    }
    
    return {
      success: true,
      data: {
        status: 'PROCESSING',
        progress: 0,
        videoUrl: null
      },
    };
  } catch (error: any) {
    console.error('❌ Kie.ai Veo 3 Status Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to check video status',
    };
  }
};

// Detect if user wants to generate image or video
export const detectMediaRequest = (message: string, hasReferenceImages: boolean = false): {
  type: 'text' | 'image' | 'video';
  cleanPrompt?: string;
} => {
  const lowerMessage = message.toLowerCase();
  
  // Video generation keywords - more comprehensive
  const videoKeywords = [
    'video', 'animate', 'animation', 'moving', 'footage', 'clip', 'movie'
  ];
  
  // Image generation keywords - more comprehensive
  const imageKeywords = [
    'image', 'picture', 'photo', 'illustration', 'draw', 'paint',
    'visualize', 'design', 'logo', 'artwork', 'sketch', 'render'
  ];
  
  // Action words that indicate generation
  const actionWords = ['generate', 'create', 'make', 'produce', 'build', 'show me'];
  
  // Check if message contains action + media type
  const hasAction = actionWords.some(action => lowerMessage.includes(action));
  
  // If there are reference images and the message suggests generation, be more aggressive
  if (hasReferenceImages) {
    // Check for video request
    if (hasAction && videoKeywords.some(keyword => lowerMessage.includes(keyword))) {
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
      let cleanPrompt = message
        .replace(/^(can you|could you|please|would you)/gi, '')
        .replace(/generate|create|make|draw|produce|build|show me/gi, '')
        .replace(/a?n?\s*(image|picture|photo|illustration|drawing|painting)\s*(of)?/gi, '')
        .replace(/\?/g, '')
        .trim();
      return { type: 'image', cleanPrompt: cleanPrompt || message };
    }
    
    // If there are reference images and the message is short, assume image generation
    if (message.length < 50 && (hasAction || lowerMessage.includes('this') || lowerMessage.includes('these'))) {
      return { type: 'image', cleanPrompt: message };
    }
  }
  
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

// Enhanced prompts for better results
export const enhancePrompt = (prompt: string, type: 'image' | 'video', hasReferenceImage: boolean = false): string => {
  if (type === 'image') {
    if (hasReferenceImage) {
      // For image-to-image generation, be more specific about using the reference
      return `Using the provided reference image as the base, ${prompt}, maintain the style and composition of the reference image, professional quality, high detail, 4k`;
    }
    return `${prompt}, professional quality, high detail, 4k`;
  } else {
    if (hasReferenceImage) {
      // For video generation with reference
      return `Using the provided reference image as the starting point, ${prompt}, maintain the visual style and elements from the reference, smooth motion, cinematic, high quality, professional video`;
    }
    // Veo 3 works best with detailed, cinematic prompts
    return `${prompt}, smooth motion, cinematic, high quality, professional video`;
  }
};

