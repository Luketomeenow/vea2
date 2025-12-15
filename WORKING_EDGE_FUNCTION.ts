// Copy this ENTIRE file and paste it into your Supabase Edge Function

import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse request
    const { messages, systemPrompt } = await req.json()
    
    if (!messages || !Array.isArray(messages)) {
      throw new Error('Invalid messages format')
    }

    // Get API key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured in Supabase secrets')
    }

    console.log('Calling OpenAI with', messages.length, 'messages')

    // Call OpenAI
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: systemPrompt || 'You are an intelligent business assistant for VEA Dashboard. You help users manage their business by analyzing data, prioritizing tasks, and providing strategic recommendations. Be concise, actionable, and professional.'
          },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    })

    if (!openaiResponse.ok) {
      const error = await openaiResponse.json()
      console.error('OpenAI error:', error)
      throw new Error(`OpenAI API error: ${error.error?.message || openaiResponse.statusText}`)
    }

    const data = await openaiResponse.json()
    const aiMessage = data.choices?.[0]?.message?.content

    if (!aiMessage) {
      throw new Error('No response from OpenAI')
    }

    console.log('Successfully got response from OpenAI')

    return new Response(
      JSON.stringify({ message: aiMessage }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: error.toString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})























