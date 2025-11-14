import { NextRequest, NextResponse } from 'next/server';

const LOCAL_MODEL_URL = process.env.LOCAL_MODEL_URL || 'http://localhost:12434';
const LOCAL_MODEL_NAME = process.env.LOCAL_MODEL_NAME || 'llama2';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing local model at:', LOCAL_MODEL_URL);
    
    // Test 1: Check if model server is running
    const tagsResponse = await fetch(`${LOCAL_MODEL_URL}/api/tags`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });

    if (!tagsResponse.ok) {
      return NextResponse.json({
        success: false,
        error: `Model server not responding: ${tagsResponse.status}`,
        url: LOCAL_MODEL_URL
      }, { status: 500 });
    }

    const availableModels = await tagsResponse.json();
    
    // Test 2: Try a simple generation
    const testPrompt = "Extract symptoms from: 'I have chest pain and headache'. Respond with JSON: {\"symptoms\": [\"chest pain\", \"headache\"]}";
    
    const generateResponse = await fetch(`${LOCAL_MODEL_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: LOCAL_MODEL_NAME,
        prompt: testPrompt,
        stream: false,
        options: {
          temperature: 0.1,
          max_tokens: 100
        }
      }),
      signal: AbortSignal.timeout(10000)
    });

    if (!generateResponse.ok) {
      return NextResponse.json({
        success: false,
        error: `Generation failed: ${generateResponse.status}`,
        available_models: availableModels,
        model_used: LOCAL_MODEL_NAME
      }, { status: 500 });
    }

    const generationResult = await generateResponse.json();

    return NextResponse.json({
      success: true,
      model_server: {
        url: LOCAL_MODEL_URL,
        status: 'connected',
        available_models: availableModels
      },
      test_generation: {
        model: LOCAL_MODEL_NAME,
        prompt: testPrompt,
        response: generationResult.response,
        success: true
      },
      config: {
        LOCAL_MODEL_URL: process.env.LOCAL_MODEL_URL,
        LOCAL_MODEL_NAME: process.env.LOCAL_MODEL_NAME
      }
    });

  } catch (error) {
    console.error('Local model test error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      model_server: {
        url: LOCAL_MODEL_URL,
        status: 'failed'
      },
      suggestions: [
        'Make sure Docker model is running on port 12434',
        'Check if the model name is correct',
        'Verify LOCAL_MODEL_URL and LOCAL_MODEL_NAME in .env.local'
      ]
    }, { status: 500 });
  }
}