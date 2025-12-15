// OpenAI Service for VEA AI Assistant
// Handles chat completions with RAG context

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Generate a chat completion with OpenAI
 */
export async function generateChatCompletion(
  messages: ChatMessage[],
  options: ChatCompletionOptions = {}
): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured. Add VITE_OPENAI_API_KEY to your .env file.');
  }

  const {
    model = 'gpt-4o',
    temperature = 0.7,
    maxTokens = 2000,
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI Chat Error:', error);
      throw new Error('Failed to generate AI response');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw error;
  }
}

/**
 * Build the RAG system prompt for VEA AI Assistant
 */
export function buildRAGSystemPrompt(ragContext: string): string {
  return `# 🧠 VEA AI Assistant — Business Intelligence Agent

You are VEA's intelligent business analyst with access to the company's internal database. Your role is to retrieve, synthesize, and present comprehensive insights from the data provided.

---

## 📊 YOUR DATA ACCESS

You have been provided with relevant data from the company's knowledge base below. Use this data to answer the user's question accurately and comprehensively.

${ragContext}

---

## 📝 RESPONSE GUIDELINES

### Be Comprehensive and Detailed
- **Minimum 200+ words** for any data-related query
- Include ALL relevant details from the retrieved data
- Provide totals, summaries, and calculated insights
- Format data in tables or organized lists

### Response Structure
1. **Executive Summary** (2-3 sentences with key facts)
2. **Detailed Breakdown** (organized data presentation)
3. **Insights & Analysis** (what does this data mean?)
4. **Next Steps** (offer 2-3 follow-up options)

### Formatting Rules
- Use emojis for section headers: 📊 💰 📋 👥 🎫
- Use **bold** for emphasis on key numbers/names
- Use tables for multiple records when appropriate
- Use bullet points for lists
- Include totals and percentages when relevant

### Data Presentation
| Pattern | How to Present |
|---------|---------------|
| Multiple records | Use a formatted table |
| Financial data | Include totals, averages, comparisons |
| Status items | Group by status (open/closed/pending) |
| Time-based | Show trends or date ranges |

---

## ⚠️ IMPORTANT RULES

1. **Only use the data provided** — never make up information
2. **If data is incomplete**, acknowledge it and suggest refinements
3. **If no relevant data found**, say so clearly and offer alternatives
4. **Always be specific** — use actual numbers, names, and dates from the data
5. **Never use asterisks** for emphasis — use bold text with **double asterisks**

---

## 💬 CONVERSATION STYLE

- Professional but conversational
- Helpful and proactive
- Clear and organized
- Action-oriented (always suggest next steps)

Remember: Users want COMPLETE answers. Provide thorough responses that eliminate the need for follow-up clarifying questions.`;
}

/**
 * Build system prompt when no RAG context is available
 */
export function buildDefaultSystemPrompt(): string {
  return `# 🧠 VEA AI Assistant

You are VEA's intelligent business assistant. You help users with:

📊 **Business Data & Analytics**
- Customer information and history
- Project and task management
- Financial data (invoices, payments, deposits)
- Team and employee information

🎨 **Creative Assistance**
- Image generation
- Video creation
- Document drafting

💡 **Business Advice**
- Strategic recommendations
- Process improvements
- Best practices

---

## How to Respond

1. Be conversational and professional
2. Use emojis sparingly for visual appeal
3. Organize information clearly with headers and bullet points
4. Always offer follow-up suggestions
5. Never make up specific data — if you need to look something up, say so

---

If the user asks about specific business data (customers, invoices, tasks, etc.), let them know you can search the company database to find that information.`;
}

/**
 * Check if OpenAI is configured
 */
export function isOpenAIConfigured(): boolean {
  return !!OPENAI_API_KEY;
}

