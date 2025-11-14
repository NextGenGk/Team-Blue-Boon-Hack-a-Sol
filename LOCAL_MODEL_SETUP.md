# Local Docker Model Setup Guide

## Overview
Your healthcare app now uses a local Docker model on port 12434 instead of external AI services like Gemini. This provides better privacy and control over your AI processing.

## Setup Options

### Option 1: Using Ollama (Recommended)

1. **Install Ollama with Docker:**
```bash
# Run Ollama container on port 12434
docker run -d -v ollama:/root/.ollama -p 12434:11434 --name ollama ollama/ollama

# Pull a medical-friendly model
docker exec -it ollama ollama pull llama2
# or for better medical knowledge:
docker exec -it ollama ollama pull codellama
docker exec -it ollama ollama pull mistral
```

2. **Test the model:**
```bash
# Test if it's working
curl http://localhost:12434/api/tags

# Test generation
curl http://localhost:12434/api/generate -d '{
  "model": "llama2",
  "prompt": "Extract symptoms from: I have chest pain. Respond with JSON.",
  "stream": false
}'
```

### Option 2: Using LM Studio

1. **Download LM Studio** from https://lmstudio.ai/
2. **Load a model** (recommend: Llama 2 7B or Mistral 7B)
3. **Start local server** on port 12434
4. **Configure** to use OpenAI-compatible API

### Option 3: Using LocalAI

1. **Run LocalAI with Docker:**
```bash
docker run -p 12434:8080 -v $PWD/models:/models -ti --rm quay.io/go-skynet/local-ai:latest
```

2. **Download models** to the models directory

## Environment Configuration

Your `.env.local` is already configured:
```env
LOCAL_MODEL_URL=http://localhost:12434
LOCAL_MODEL_NAME=llama2
```

## API Endpoints to Test

1. **Health Check:**
```
GET http://localhost:3000/api/health-check
```

2. **Test Local Model:**
```
GET http://localhost:3000/api/test-local-model
```

3. **Search with AI:**
```
GET http://localhost:3000/api/search?query=chest pain&lang=en
```

## Expected Responses

### Health Check (with local model):
```json
{
  "status": "healthy",
  "ai": {
    "local_model_available": true,
    "local_model_url": "http://localhost:12434",
    "local_model_name": "llama2"
  },
  "features": {
    "ai_search": true
  }
}
```

### Test Local Model:
```json
{
  "success": true,
  "model_server": {
    "url": "http://localhost:12434",
    "status": "connected",
    "available_models": ["llama2"]
  },
  "test_generation": {
    "model": "llama2",
    "response": "{\"symptoms\": [\"chest pain\", \"headache\"]}",
    "success": true
  }
}
```

## Troubleshooting

### Model Not Available
- Check if Docker container is running: `docker ps`
- Verify port 12434 is accessible: `curl http://localhost:12434/api/tags`
- Check model is pulled: `docker exec -it ollama ollama list`

### Slow Responses
- Use smaller models (7B instead of 13B)
- Increase Docker memory allocation
- Consider using GPU acceleration

### API Errors
- Check model name matches what's available
- Verify API format (Ollama vs OpenAI compatible)
- Check Docker logs: `docker logs ollama`

## Model Recommendations

### For Medical Use:
- **Llama 2 7B**: Good general knowledge, fast
- **Code Llama 7B**: Better structured output
- **Mistral 7B**: Excellent reasoning
- **Gemma 7B**: Google's efficient model

### Performance vs Accuracy:
- **Fast**: 7B models (2-4GB RAM)
- **Balanced**: 13B models (8-16GB RAM)
- **Accurate**: 70B models (40GB+ RAM)

## Security Benefits

✅ **Privacy**: All AI processing happens locally
✅ **Control**: No external API dependencies
✅ **Cost**: No per-request charges
✅ **Reliability**: Works offline
✅ **Compliance**: Data never leaves your server

## Next Steps

1. Start your Docker model
2. Run the healthcare schema in Supabase
3. Test the API endpoints
4. Your healthcare search should now work with local AI!