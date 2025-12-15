import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Semantic query expansion for better search
function expandQuery(userQuery: string): string {
  const query = userQuery.toLowerCase();
  
  const expansions: Record<string, string> = {
    'deposit': 'deposits payments received money incoming transactions bank deposits account',
    'deposits': 'deposits payments received money incoming transactions bank deposits account',
    'revenue': 'revenue income sales earnings monthly totals invoices paid financial',
    'invoice': 'invoice invoices billing amount due payment status paid unpaid overdue',
    'invoices': 'invoice invoices billing amount due payment status paid unpaid overdue',
    'payment': 'payment payments received deposits transactions money cash',
    'payments': 'payment payments received deposits transactions money cash',
    'overdue': 'overdue unpaid past due outstanding balance payment pending late',
    'customer': 'customer client account contact information address notes history',
    'customers': 'customers clients accounts contacts information addresses',
    'project': 'project status milestones timeline team budget tasks deliverables',
    'projects': 'projects status milestones timelines teams budgets tasks',
    'task': 'task assignment work item to-do responsibility project due date',
    'tasks': 'tasks assignments work items to-do responsibilities projects due dates',
    'ticket': 'ticket issue request status resolution notes service field',
    'tickets': 'tickets issues requests status resolutions service field',
    'employee': 'employee team member staff role department schedule assignments',
    'team': 'team employees members staff roles departments assignments',
  };

  let expandedQuery = userQuery;
  for (const [keyword, expansion] of Object.entries(expansions)) {
    if (query.includes(keyword)) {
      expandedQuery = `${userQuery} ${expansion}`;
      break;
    }
  }
  return expandedQuery;
}

// Generate embedding using OpenAI
async function generateEmbedding(text: string, apiKey: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('OpenAI Embedding Error:', error);
    throw new Error('Failed to generate embedding');
  }

  const data = await response.json();
  return data.data[0].embedding;
}

// Query Pinecone for relevant context
async function queryPinecone(
  embedding: number[],
  pineconeHost: string,
  pineconeApiKey: string,
  namespace: string,
  topK: number = 12
): Promise<any[]> {
  const response = await fetch(`${pineconeHost}/query`, {
    method: 'POST',
    headers: {
      'Api-Key': pineconeApiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      vector: embedding,
      topK: topK,
      includeMetadata: true,
      namespace: namespace,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Pinecone Query Error:', error);
    throw new Error('Failed to query knowledge base');
  }

  const data = await response.json();
  return data.matches || [];
}

// Format RAG context for the AI prompt
function formatContext(matches: any[]): string {
  if (matches.length === 0) return '';

  let context = '## 📊 RETRIEVED DATA FROM KNOWLEDGE BASE\n\n';
  
  const groupedBySource: Record<string, string[]> = {};
  
  for (const match of matches) {
    const content = match.metadata?.pageContent || match.metadata?.text || match.metadata?.content || '';
    const source = match.metadata?.table || match.metadata?.source || 'General';
    
    if (content) {
      if (!groupedBySource[source]) {
        groupedBySource[source] = [];
      }
      groupedBySource[source].push(content);
    }
  }

  for (const [source, chunks] of Object.entries(groupedBySource)) {
    context += `### Source: ${source}\n`;
    chunks.forEach((chunk) => {
      context += `${chunk}\n\n`;
    });
  }

  return context;
}

// Build RAG system prompt
function buildSystemPrompt(ragContext: string): string {
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

---

## ⚠️ IMPORTANT RULES

1. **Only use the data provided** — never make up information
2. **If data is incomplete**, acknowledge it and suggest refinements
3. **If no relevant data found**, say so clearly and offer alternatives
4. **Always be specific** — use actual numbers, names, and dates from the data

Remember: Users want COMPLETE answers. Provide thorough responses that eliminate the need for follow-up clarifying questions.`;
}

// Default prompt when no RAG context
function buildDefaultPrompt(): string {
  return `# 🧠 VEA AI Assistant

You are VEA's intelligent business assistant. You help users with:

📊 **Business Data & Analytics**
- Customer information and history
- Project and task management
- Financial data (invoices, payments, deposits)
- Team and employee information

💡 **Business Advice**
- Strategic recommendations
- Process improvements
- Best practices

Be conversational, professional, and helpful. Use emojis sparingly for visual appeal.
If the user asks about specific business data, let them know you can search the company database.`;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory = [] } = await req.json();

    // Get environment variables
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const pineconeApiKey = Deno.env.get('PINECONE_API_KEY');
    const pineconeHost = Deno.env.get('PINECONE_HOST');
    const pineconeNamespace = Deno.env.get('PINECONE_NAMESPACE') || 'sql_knowledge';

    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    let systemPrompt = buildDefaultPrompt();
    let ragResults = 0;

    // Only use RAG if Pinecone is configured
    if (pineconeApiKey && pineconeHost) {
      console.log('🔍 Using RAG mode...');
      
      try {
        // Expand the query for better semantic search
        const expandedQuery = expandQuery(message);
        console.log('Expanded Query:', expandedQuery);

        // Generate embedding
        const embedding = await generateEmbedding(expandedQuery, openaiApiKey);

        // Query Pinecone
        const matches = await queryPinecone(
          embedding,
          pineconeHost,
          pineconeApiKey,
          pineconeNamespace,
          12
        );
        
        ragResults = matches.length;
        console.log(`📚 Retrieved ${ragResults} chunks from Pinecone`);

        // Format context and build system prompt
        if (matches.length > 0) {
          const context = formatContext(matches);
          systemPrompt = buildSystemPrompt(context);
        }
      } catch (ragError) {
        console.error('RAG Error (falling back to default):', ragError);
        // Continue with default prompt if RAG fails
      }
    } else {
      console.log('⚠️ Pinecone not configured, using default mode');
    }

    // Build messages for OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-5),
      { role: 'user', content: message }
    ];

    // Call OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: messages,
        temperature: 0.7,
        max_tokens: 2500,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API error');
    }

    const data = await response.json();
    const aiMessage = data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

    return new Response(
      JSON.stringify({ 
        message: aiMessage,
        ragResults: ragResults,
        mode: pineconeApiKey && pineconeHost ? 'rag' : 'default'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Edge Function Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});

