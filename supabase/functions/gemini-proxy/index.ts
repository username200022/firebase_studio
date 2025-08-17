import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

console.log('GEMINI PROXY: Function cold start');

serve(async (req) => {
  console.log('GEMINI PROXY: Received a request');

  if (req.method === 'OPTIONS') {
    console.log('GEMINI PROXY: Handling OPTIONS request');
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('GEMINI PROXY: Attempting to get secret key...');
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

    if (!GEMINI_API_KEY) {
      console.error('GEMINI PROXY ERROR: GEMINI_API_KEY secret not found!');
      throw new Error('Server configuration error: Missing API key.');
    }
    console.log('GEMINI PROXY: Secret key found.');

    const { history } = await req.json();
    console.log('GEMINI PROXY: Parsed request body history.');

    const requestBody = {
      contents: history.map((message: { role: string; content: string }) => ({
        role: message.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: message.content }],
      })),
    };
    console.log('GEMINI PROXY: Constructed request body for Gemini.');

    const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    
    console.log('GEMINI PROXY: Calling Gemini API...');
    const geminiResponse = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });
    console.log('GEMINI PROXY: Received response from Gemini with status:', geminiResponse.status);

    if (!geminiResponse.ok) {
      const errorBody = await geminiResponse.text();
      console.error('GEMINI PROXY ERROR: Gemini API error:', errorBody);
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    console.log('GEMINI PROXY: Parsed Gemini JSON response.');
    
    const responseText = geminiData.candidates[0].content.parts[0].text;
    console.log('GEMINI PROXY: Extracted response text successfully.');

    return new Response(JSON.stringify({ text: responseText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('GEMINI PROXY CATCH BLOCK ERROR:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
