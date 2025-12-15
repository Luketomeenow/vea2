// Pinecone RAG Service for VEA AI Assistant
// Handles semantic search against the company knowledge base

const PINECONE_API_KEY = import.meta.env.VITE_PINECONE_API_KEY;
const PINECONE_HOST = import.meta.env.VITE_PINECONE_HOST; // e.g., https://internaldata-xxxxx.svc.pinecone.io
const PINECONE_NAMESPACE = import.meta.env.VITE_PINECONE_NAMESPACE || 'sql_knowledge';
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export interface PineconeMatch {
  id: string;
  score: number;
  metadata: {
    pageContent?: string;
    text?: string;
    content?: string;
    table?: string;
    source?: string;
    [key: string]: any;
  };
}

export interface RAGContext {
  chunks: string[];
  metadata: any[];
  totalResults: number;
}

/**
 * Generate embedding for a query using OpenAI
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured. Add VITE_OPENAI_API_KEY to your .env file.');
  }

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
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

/**
 * Expand a user query into a semantically rich search query
 */
export function expandQuery(userQuery: string): string {
  const query = userQuery.toLowerCase();
  
  // Semantic expansion mappings
  const expansions: Record<string, string> = {
    // Financial queries
    'deposit': 'deposits payments received money incoming transactions bank deposits account',
    'deposits': 'deposits payments received money incoming transactions bank deposits account',
    'revenue': 'revenue income sales earnings monthly totals invoices paid financial',
    'invoice': 'invoice invoices billing amount due payment status paid unpaid overdue',
    'invoices': 'invoice invoices billing amount due payment status paid unpaid overdue',
    'payment': 'payment payments received deposits transactions money cash',
    'payments': 'payment payments received deposits transactions money cash',
    'overdue': 'overdue unpaid past due outstanding balance payment pending late',
    'outstanding': 'outstanding unpaid overdue balance accounts receivable pending',
    
    // Customer queries
    'customer': 'customer client account contact information address notes history',
    'customers': 'customers clients accounts contacts information addresses',
    'client': 'client customer account contact information address notes',
    'account': 'account customer client profile contact information',
    
    // Project queries
    'project': 'project status milestones timeline team budget tasks deliverables',
    'projects': 'projects status milestones timelines teams budgets tasks',
    
    // Task queries
    'task': 'task assignment work item to-do responsibility project due date',
    'tasks': 'tasks assignments work items to-do responsibilities projects due dates',
    
    // Ticket queries
    'ticket': 'ticket issue request status resolution notes service field',
    'tickets': 'tickets issues requests status resolutions service field',
    
    // Team queries
    'employee': 'employee team member staff role department schedule assignments',
    'employees': 'employees team members staff roles departments schedules',
    'team': 'team employees members staff roles departments assignments',
  };

  // Check for keywords and expand
  let expandedQuery = userQuery;
  
  for (const [keyword, expansion] of Object.entries(expansions)) {
    if (query.includes(keyword)) {
      expandedQuery = `${userQuery} ${expansion}`;
      break;
    }
  }

  return expandedQuery;
}

/**
 * Query Pinecone for relevant context
 */
export async function queryKnowledgebase(
  query: string,
  topK: number = 10
): Promise<RAGContext> {
  if (!PINECONE_API_KEY || !PINECONE_HOST) {
    console.warn('⚠️ Pinecone not configured. Add VITE_PINECONE_API_KEY and VITE_PINECONE_HOST to your .env file.');
    return { chunks: [], metadata: [], totalResults: 0 };
  }

  try {
    console.log('🔍 RAG Query:', query);
    
    // Expand the query for better semantic search
    const expandedQuery = expandQuery(query);
    console.log('🔍 Expanded Query:', expandedQuery);
    
    // Generate embedding for the query
    const embedding = await generateEmbedding(expandedQuery);
    
    // Query Pinecone
    const response = await fetch(`${PINECONE_HOST}/query`, {
      method: 'POST',
      headers: {
        'Api-Key': PINECONE_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vector: embedding,
        topK: topK,
        includeMetadata: true,
        namespace: PINECONE_NAMESPACE,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Pinecone Query Error:', error);
      throw new Error('Failed to query knowledge base');
    }

    const data = await response.json();
    const matches: PineconeMatch[] = data.matches || [];
    
    console.log(`📚 Found ${matches.length} relevant chunks`);

    // Extract and format the context
    const chunks: string[] = [];
    const metadata: any[] = [];

    for (const match of matches) {
      // Extract text content from various possible fields
      const content = 
        match.metadata?.pageContent || 
        match.metadata?.text || 
        match.metadata?.content ||
        '';
      
      if (content) {
        chunks.push(content);
        metadata.push({
          ...match.metadata,
          score: match.score,
          id: match.id,
        });
      }
    }

    return {
      chunks,
      metadata,
      totalResults: matches.length,
    };
  } catch (error) {
    console.error('❌ RAG Query Error:', error);
    return { chunks: [], metadata: [], totalResults: 0 };
  }
}

/**
 * Format RAG context for the AI prompt
 */
export function formatContextForPrompt(context: RAGContext): string {
  if (context.chunks.length === 0) {
    return '';
  }

  let formattedContext = '## 📊 RETRIEVED DATA FROM KNOWLEDGE BASE\n\n';
  
  // Group by table/source if available
  const groupedBySource: Record<string, string[]> = {};
  
  context.metadata.forEach((meta, index) => {
    const source = meta.table || meta.source || 'General';
    if (!groupedBySource[source]) {
      groupedBySource[source] = [];
    }
    groupedBySource[source].push(context.chunks[index]);
  });

  for (const [source, chunks] of Object.entries(groupedBySource)) {
    formattedContext += `### Source: ${source}\n`;
    chunks.forEach((chunk, i) => {
      formattedContext += `${chunk}\n\n`;
    });
  }

  return formattedContext;
}

/**
 * Check if Pinecone is configured
 */
export function isPineconeConfigured(): boolean {
  return !!(PINECONE_API_KEY && PINECONE_HOST && OPENAI_API_KEY);
}

