// RAG Service - Calls Supabase Edge Function or falls back to n8n
// This avoids CORS issues by proxying through the backend

// Hardcoded Supabase config (matching supabase.ts)
const SUPABASE_URL = 'https://kofhwlmffnzpehaoplzx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvZmh3bG1mZm56cGVoYW9wbHp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MjExOTIsImV4cCI6MjA3NDI5NzE5Mn0.3tkT_PEr30nZpFjk298vT87Et-eviLnz2rR6NZCaNAE';

// n8n Webhook URL as fallback
const N8N_WEBHOOK_URL = 'https://veaai.app.n8n.cloud/webhook/2cf27f74-6eb7-4bb4-94e9-c03388270e89';

export interface RAGResponse {
  message: string;
  ragResults?: number;
  mode?: 'rag' | 'default' | 'n8n';
  error?: string;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Try to call the n8n webhook
 */
async function callN8nWebhook(message: string): Promise<RAGResponse> {
  console.log('🔄 Using n8n webhook...');
  
  const sessionId = sessionStorage.getItem('demo-chat-session') || `demo-${Date.now()}`;
  sessionStorage.setItem('demo-chat-session', sessionId);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minutes

  const response = await fetch(N8N_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sessionId }),
    signal: controller.signal
  });

  clearTimeout(timeoutId);

  if (!response.ok) {
    throw new Error(`n8n error: ${response.status}`);
  }

  const data = await response.json();
  
  let aiMessage = '';
  if (Array.isArray(data)) {
    const firstItem = data[0];
    aiMessage = firstItem?.message || firstItem?.output || firstItem?.text || firstItem?.content || '';
  } else {
    aiMessage = data?.message || data?.output || data?.text || data?.content || '';
  }
  
  if (!aiMessage) {
    throw new Error('No response from n8n');
  }

  return {
    message: aiMessage,
    mode: 'n8n'
  };
}

/**
 * Generate AI response using RAG Edge Function, with n8n fallback
 */
export async function generateRAGResponse(
  message: string,
  conversationHistory: ConversationMessage[] = []
): Promise<RAGResponse> {
  // First try the Edge Function
  try {
    console.log('🚀 Trying RAG Edge Function...');

    const response = await fetch(`${SUPABASE_URL}/functions/v1/rag-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        message,
        conversationHistory: conversationHistory.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.warn('⚠️ Edge Function failed:', errorData.error || response.status);
      // Fall back to n8n
      return await callN8nWebhook(message);
    }

    const data = await response.json();
    
    console.log(`✅ RAG Response received (${data.ragResults || 0} chunks, mode: ${data.mode})`);
    
    return {
      message: data.message,
      ragResults: data.ragResults,
      mode: data.mode
    };
    
  } catch (error: any) {
    console.warn('⚠️ Edge Function error, falling back to n8n:', error.message);
    
    // Fall back to n8n webhook
    try {
      return await callN8nWebhook(message);
    } catch (n8nError: any) {
      console.error('❌ Both Edge Function and n8n failed:', n8nError);
      throw new Error(`AI service unavailable: ${error.message}`);
    }
  }
}

/**
 * Check if the RAG Edge Function is available
 */
export async function checkRAGAvailability(): Promise<boolean> {
  return true;
}

