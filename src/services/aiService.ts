import { supabase } from '@/lib/supabase';
import { detectMediaRequest, generateImage, generateVideo, enhancePrompt, checkVideoStatus } from './kieService';
import { AI_FUNCTIONS, executeFunctionCall } from './aiFunctionsService';

// n8n AI Agent Webhook URL (Production)
const N8N_WEBHOOK_URL = 'https://veaai.app.n8n.cloud/webhook/2cf27f74-6eb7-4bb4-94e9-c03388270e89';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  functionCall?: { name: string; arguments: any };
  functionResult?: any;
}

export interface MediaContent {
  type: 'image' | 'video';
  url: string;
  prompt: string;
}

export const generateAIResponse = async (
  messages: ChatMessage[],
  userId: string,
  systemPrompt?: string,
  referenceImages?: string[]
): Promise<{ type: 'text' | 'image' | 'video'; content: string; mediaUrl?: string; functionCall?: any }> => {
  try {
    // Get the last user message
    const lastMessage = messages[messages.length - 1]?.content || '';
    
    // Check if there are uploaded images in recent messages OR passed as parameter
    const recentMessages = messages.slice(-5); // Check last 5 messages
    const uploadedImageMessages = recentMessages.filter(msg => 
      msg.role === 'user' && msg.mediaType === 'image' && msg.mediaUrl
    );
    const messageReferenceImages = uploadedImageMessages.map(msg => msg.mediaUrl).filter(Boolean) as string[];
    
    // Use passed reference images if available, otherwise use message history
    const finalReferenceImages = referenceImages && referenceImages.length > 0 ? referenceImages : messageReferenceImages;
    
    // Detect if this is a media generation request
    const mediaRequest = detectMediaRequest(lastMessage, finalReferenceImages.length > 0);
    console.log('Media request detection:', mediaRequest);
    console.log('Reference images found:', finalReferenceImages.length);
    console.log('Reference images:', finalReferenceImages);
    
    // Handle Image Generation with Kie.ai
    if (mediaRequest.type === 'image') {
      console.log('🎨 Starting image generation with Kie.ai...');
      const enhancedPrompt = enhancePrompt(mediaRequest.cleanPrompt || lastMessage, 'image', finalReferenceImages.length > 0);
      const result = await generateImage(enhancedPrompt, finalReferenceImages.length > 0 ? finalReferenceImages : undefined);
      
      if (!result.success) {
        // Fall back to text response if image generation fails
        return {
          type: 'text',
          content: `🎨 I'd love to generate an image for you, but image generation encountered an error: ${result.error}\n\nI can still help you with:\n• Business analysis and insights\n• Task prioritization\n• Project management advice\n• Strategic recommendations`
        };
      }
      
      const imageUrl = result.data?.url;
      
      if (!imageUrl) {
        throw new Error('No image URL in response');
      }
      
      const imageMessage = finalReferenceImages.length > 0 
        ? `🎨 Here's your generated image using ${finalReferenceImages.length} reference image(s): "${mediaRequest.cleanPrompt || lastMessage}"`
        : `🎨 Here's your generated image: "${mediaRequest.cleanPrompt || lastMessage}"`;
      
      return {
        type: 'image',
        content: imageMessage,
        mediaUrl: imageUrl
      };
    }
    
    // Handle Video Generation with Kie.ai Veo 3
    if (mediaRequest.type === 'video') {
      console.log('🎬 Starting video generation with Kie.ai Veo 3...');
      const enhancedPrompt = enhancePrompt(mediaRequest.cleanPrompt || lastMessage, 'video', finalReferenceImages.length > 0);
      const result = await generateVideo(enhancedPrompt, finalReferenceImages.length > 0 ? finalReferenceImages[0] : undefined);
      
      if (!result.success) {
        // Fall back to text response if video generation fails
        return {
          type: 'text',
          content: `🎬 I'd love to generate a video for you, but video generation encountered an error: ${result.error}\n\nI can still help you with:\n• Business analysis and insights\n• Task prioritization\n• Project management advice\n• Strategic recommendations`
        };
      }
      
      // Video generation is async, return task ID for polling
      const videoMessage = finalReferenceImages.length > 0 
        ? `🎬 Generating your video with Veo 3 using your uploaded image as reference: "${mediaRequest.cleanPrompt || lastMessage}"\n\nThis may take 30-90 seconds. I'll update you when it's ready!`
        : `🎬 Generating your video with Veo 3: "${mediaRequest.cleanPrompt || lastMessage}"\n\nThis may take 30-90 seconds. I'll update you when it's ready!`;
      
      return {
        type: 'video',
        content: videoMessage,
        mediaUrl: result.taskId // Store task ID for polling
      };
    }
    
    // Build enhanced system prompt with function calling capabilities
    const functionsDescription = AI_FUNCTIONS.map(f => 
      `${f.name}: ${f.description}${Object.keys(f.parameters).length > 0 ? `\nParameters: ${JSON.stringify(f.parameters)}` : ''}`
    ).join('\n\n');

    const enhancedSystemPrompt = systemPrompt || `You are an intelligent business assistant for VEA Dashboard with access to real-time business data.

🎯 YOUR CAPABILITIES:
- Access and analyze ALL business data (projects, tasks, customers, finances, cash flow)
- Create tasks and projects for users
- Pull detailed reports and insights from the database
- Generate images and videos
- Provide actionable business recommendations

📊 AVAILABLE FUNCTIONS:
You can call these functions to help users:

${functionsDescription}

💡 HOW TO USE FUNCTIONS:
When a user asks about business data, USE the appropriate function instead of making up data. For example:
- "Show me my projects" → call get_projects()
- "Create a task for X" → call create_task(title: "X")
- "How's my business doing?" → call analyze_business_health()
- "What are my pending invoices?" → call get_invoices()

To call a function, respond with:
FUNCTION_CALL: function_name(param1: value1, param2: value2)

🎨 MEDIA GENERATION:
Users can ask for images or videos and you'll handle it automatically.

⚙️ STYLE:
- Be conversational and professional
- Use emojis sparingly but effectively  
- Never use asterisks (*) for emphasis
- Keep responses concise (under 200 words) unless detail is requested
- Always prioritize using functions to provide real data over generic advice`;

    // Handle Text Chat with n8n webhook (default)
    // Generate or retrieve session ID
    const sessionId = userId || `session-${Date.now()}`;
    
    // Get just the current user message (last message in the array)
    const currentUserMessage = messages[messages.length - 1]?.content || '';
    
    console.log('🚀 Sending to n8n:', {
      url: N8N_WEBHOOK_URL,
      payload: { message: currentUserMessage, sessionId }
    });
    
    // Create AbortController with 5 minute timeout for long-running n8n workflows
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minutes

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: currentUserMessage,
        sessionId
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log('📡 n8n Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ n8n webhook error:', response.status, errorText);
      throw new Error(`AI service error: ${response.statusText || 'Connection failed'}`);
    }

    const data = await response.json();
    console.log('✅ n8n Response data:', data);
    console.log('✅ n8n Response type:', Array.isArray(data) ? 'Array' : typeof data);

    if (data?.error) {
      console.error('❌ n8n webhook returned error:', data.error);
      throw new Error(data.error);
    }

    // Handle different response formats
    let aiResponse = '';
    let imageUrls: string[] = [];
    
    if (Array.isArray(data)) {
      // If it's an array, try to extract the message
      console.log('📦 Response is an array, extracting...');
      const firstItem = data[0];
      
      // Check for images/files from Code Interpreter
      if (firstItem?.images) {
        imageUrls = Array.isArray(firstItem.images) ? firstItem.images : [firstItem.images];
      } else if (firstItem?.files) {
        imageUrls = Array.isArray(firstItem.files) ? firstItem.files : [firstItem.files];
      }
      
      aiResponse = firstItem?.message || firstItem?.output || firstItem?.text || firstItem?.content || firstItem?.response;
      
      if (!aiResponse) {
        console.error('❌ No recognized message field in array response:', data);
        throw new Error('No response from AI service');
      }
    } else {
      // Check for images/files in the response
      if (data?.images) {
        imageUrls = Array.isArray(data.images) ? data.images : [data.images];
      } else if (data?.files) {
        imageUrls = Array.isArray(data.files) ? data.files : [data.files];
      }
      
      aiResponse = data?.message || data?.output || data?.text || data?.content;
      
      if (!aiResponse) {
        console.error('❌ No message field in response:', data);
        throw new Error('No response from AI service');
      }
    }

    // If there are images from Code Interpreter, append them to the response
    if (imageUrls.length > 0) {
      console.log('📊 Found Code Interpreter outputs:', imageUrls);
      aiResponse += '\n\n';
      imageUrls.forEach((url, index) => {
        aiResponse += `![Generated Graph ${index + 1}](${url})\n`;
      });
    }

    console.log('💬 Extracted message:', aiResponse);

    // Clean up the response - remove asterisks and format properly
    let cleanContent = aiResponse
      .replace(/\*\*/g, '') // Remove bold asterisks
      .replace(/\*/g, '');   // Remove italic asterisks
    
    // Check if AI wants to call a function
    const functionCallMatch = cleanContent.match(/FUNCTION_CALL:\s*(\w+)\((.*?)\)/);
    
    if (functionCallMatch) {
      const [_, functionName, paramsString] = functionCallMatch;
      console.log(`🤖 AI requesting function call: ${functionName}`);
      
      // Parse parameters
      let parameters = {};
      if (paramsString.trim()) {
        try {
          // Convert param1: value1, param2: value2 to JSON
          const paramPairs = paramsString.split(',').map(p => p.trim());
          for (const pair of paramPairs) {
            const [key, ...valueParts] = pair.split(':');
            const value = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
            parameters[key.trim()] = value;
          }
        } catch (e) {
          console.error('Error parsing function parameters:', e);
        }
      }
      
      // Execute the function
      const result = await executeFunctionCall(functionName, parameters, userId);
      
      if (result.success) {
        // Send the function result back to AI for final response
        const followUpMessages = [
          ...messages,
          { role: 'assistant' as const, content: cleanContent },
          { role: 'system' as const, content: `Function ${functionName} returned:\n${JSON.stringify(result.data, null, 2)}` }
        ];
        
        // Get the last message for follow-up
        const followUpMessage = followUpMessages[followUpMessages.length - 1]?.content || '';
        
        // Create AbortController with 5 minute timeout for follow-up requests
        const followUpController = new AbortController();
        const followUpTimeoutId = setTimeout(() => followUpController.abort(), 300000); // 5 minutes

        const followUpResponse = await fetch(N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: followUpMessage,
            sessionId
          }),
          signal: followUpController.signal
        });

        clearTimeout(followUpTimeoutId);
        
        const finalResponse = followUpResponse.ok ? await followUpResponse.json() : null;
        
        if (!followUpResponse.ok || !finalResponse?.message) {
          // Fallback: return raw data
          return {
            type: 'text',
            content: `✅ Here's what I found:\n\n${JSON.stringify(result.data, null, 2)}`
          };
        }
        
        return {
          type: 'text',
          content: finalResponse.message.replace(/\*\*/g, '').replace(/\*/g, '')
        };
      } else {
        return {
          type: 'text',
          content: `❌ I encountered an error: ${result.error}\n\nLet me know if you'd like me to try something else!`
        };
      }
    }
    
    return {
      type: 'text',
      content: cleanContent
    };
    
  } catch (error: any) {
    console.error('AI Service Error:', error);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. The AI is taking longer than expected. Please try again or simplify your question.');
    }
    throw new Error(error.message || 'Failed to get AI response. Please try again.');
  }
};

// Streaming is not implemented yet with Edge Functions
// Can be added later if needed

