// Kie.ai API Integration for Image & Video Generation
// Image: 4O Image API (GPT-4 Turbo with Vision)
// Video: Veo 3 API (Google's Veo 3 model)
// Documentation: https://docs.kie.ai/

const KIE_API_KEY = import.meta.env.VITE_KIE_API_KEY;
const KIE_IMAGE_URL = 'https://kieai.erweima.ai/api/v1/gpt4o-image/generate';
const KIE_VIDEO_URL = 'https://api.kie.ai/api/v1/veo/generate'; // Veo 3 API

interface KieResponse {
  success: boolean;
  data?: any;
  error?: string;
  taskId?: string;
}

// Image Generation using Kie.ai 4O Image API (GPT-4 Turbo with Vision)
// Excellent quality, takes 50-70 seconds
export const generateImage = async (prompt: string): Promise<KieResponse> => {
  try {
    if (!KIE_API_KEY || KIE_API_KEY === 'ADD_YOUR_KIE_API_KEY_HERE') {
      return {
        success: false,
        error: 'Please add your Kie.ai API key to the .env file (VITE_KIE_API_KEY)'
      };
    }

    console.log('🎨 Generating image with Kie.ai:', prompt);

    // Step 1: Submit image generation request
    const generateResponse = await fetch('https://api.kie.ai/api/v1/gpt4o-image/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${KIE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        size: '1:1',
        nVariants: 1,
        isEnhance: true,
      }),
    });

    if (!generateResponse.ok) {
      const errorText = await generateResponse.text();
      console.error('❌ Kie.ai Generation Error:', errorText);
      throw new Error(`API Error: ${generateResponse.status}`);
    }

    const generateData = await generateResponse.json();
    console.log('✅ Kie.ai Generation Response:', generateData);
    
    const taskId = generateData.data?.taskId;
    
    if (!taskId) {
      throw new Error('No taskId received from Kie.ai');
    }
    
    console.log('📋 Image taskId:', taskId);
    
    // Step 2: Poll for result using the correct endpoint: /record-info
    const maxAttempts = 15; // 150 seconds max (15 * 10 seconds = 2.5 minutes)
    let attempt = 0;
    
    while (attempt < maxAttempts) {
      attempt++;
      
      // Wait 10 seconds before polling (as recommended in docs)
      console.log(`⏳ Waiting 10s before checking status (attempt ${attempt}/${maxAttempts})...`);
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      try {
        const statusUrl = `https://api.kie.ai/api/v1/gpt4o-image/record-info?taskId=${taskId}`;
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
        // BUT also check if progress is 1.00 (100%) - sometimes successFlag lags behind
        const progressValue = parseFloat(progress);
        const isComplete = successFlag === 1 || progressValue >= 1.0;
        
        if (isComplete) {
          // Generation complete! Try to get image URL
          console.log('✨ Generation complete! Full task data:', JSON.stringify(taskData, null, 2));
          
          // Try multiple possible locations for the image URL
          let imageUrl = null;
          
          // Option 1: response.resultUrls array (camelCase - this is what Kie.ai uses!)
          if (taskData.response?.resultUrls && taskData.response.resultUrls.length > 0) {
            imageUrl = taskData.response.resultUrls[0];
          }
          // Option 2: response.result_urls array (snake_case - just in case)
          else if (taskData.response?.result_urls && taskData.response.result_urls.length > 0) {
            imageUrl = taskData.response.result_urls[0];
          }
          // Option 3: response.imageUrl
          else if (taskData.response?.imageUrl) {
            imageUrl = taskData.response.imageUrl;
          }
          // Option 4: response.url
          else if (taskData.response?.url) {
            imageUrl = taskData.response.url;
          }
          // Option 5: response is a string (direct URL)
          else if (typeof taskData.response === 'string' && taskData.response.startsWith('http')) {
            imageUrl = taskData.response;
          }
          // Option 6: Check if response needs to be parsed
          else if (typeof taskData.response === 'string' && taskData.response.startsWith('{')) {
            try {
              const parsed = JSON.parse(taskData.response);
              imageUrl = parsed.resultUrls?.[0] || parsed.result_urls?.[0] || parsed.imageUrl || parsed.url;
            } catch (e) {
              console.error('Failed to parse response string:', e);
            }
          }
          
          if (imageUrl) {
            console.log('✨ Image URL found:', imageUrl);
            return {
              success: true,
              data: { url: imageUrl },
            };
          } else {
            // If progress is 100% but no URL yet, wait one more cycle
            if (progressValue >= 0.93 && attempt < maxAttempts - 1) {
              console.log('⏳ Progress at 93%+, waiting for final URL...');
              continue;
            }
            
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

// Video Generation using Veo 3 API
export const generateVideo = async (prompt: string): Promise<KieResponse> => {
  try {
    if (!KIE_API_KEY || KIE_API_KEY === 'ADD_YOUR_KIE_API_KEY_HERE') {
      return {
        success: false,
        error: 'Video generation is not available. Please add your Kie.ai API key to .env file.'
      };
    }

    console.log('🎬 Generating video with Kie.ai Veo 3:', prompt);

    const response = await fetch(KIE_VIDEO_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${KIE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        model: 'veo3', // or 'veo3_fast' for faster generation
        aspectRatio: '16:9',
        enableFallback: false, // Set to true to enable fallback for edge cases
        enableTranslation: true, // Auto-translate prompts to English
      }),
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
export const detectMediaRequest = (message: string): {
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
export const enhancePrompt = (prompt: string, type: 'image' | 'video'): string => {
  if (type === 'image') {
    return `${prompt}, professional quality, high detail, 4k`;
  } else {
    // Veo 3 works best with detailed, cinematic prompts
    return `${prompt}, smooth motion, cinematic, high quality, professional video`;
  }
};

