#!/bin/bash
# connect_local_db.sh
# Connects BIZRA node to local LM Studio or Ollama instance

echo "🔌 Configuring BIZRA for Local AI Model..."

# 1. Determine Backend
if curl -s -f "http://192.168.56.1:1234/v1/models" > /dev/null; then
    echo "✅ LM Studio / OpenAI detected at 192.168.56.1:1234"
    export OLLAMA_URL="http://192.168.56.1:1234"
    export OLLAMA_API_TYPE="openai"
    # Specific model requested by user
    export OLLAMA_MODEL="nvidia/nemotron-3-nano"
elif curl -s http://localhost:11434/api/tags > /dev/null; then
    echo "✅ Native Ollama detected."
    export OLLAMA_URL="http://localhost:11434"
    export OLLAMA_API_TYPE="ollama"
elif curl -s http://host.docker.internal:1234/v1/models > /dev/null; then
    echo "✅ LM Studio / OpenAI-Compatible detected (via host.docker.internal)."
    export OLLAMA_URL="http://host.docker.internal:1234"
    export OLLAMA_API_TYPE="openai"
elif curl -s http://localhost:1234/v1/models > /dev/null; then
    echo "✅ LM Studio / OpenAI-Compatible detected (via localhost)."
    export OLLAMA_URL="http://localhost:1234"
    export OLLAMA_API_TYPE="openai"
else
    echo "⚠️  No local AI model detected running on standard ports (11434 or 1234)."
    echo "Assuming manual config or waiting for start..."
    # Default to LM Studio port if not sure, as consistent with user request
    export OLLAMA_URL="http://localhost:1234" 
    export OLLAMA_API_TYPE="openai"
fi

# 2. Set Model Name (User provided path, but we need the API model name)
# In LM Studio, the model name in API calls often matches the filename or is "local-model"
# We'll set a default but allow override
export OLLAMA_MODEL="NVIDIA-Nemotron-3-Nano-30B-A3B-GGUF"

echo "Layer 4 Cognitive Config:"
echo "-------------------------"
echo "URL:      $OLLAMA_URL"
echo "TYPE:     $OLLAMA_API_TYPE"
echo "MODEL:    $OLLAMA_MODEL"
echo "-------------------------"

# 3. Validation Check
echo "Testing connection..."
if [ "$OLLAMA_API_TYPE" == "ollama" ]; then
    curl -s $OLLAMA_URL/api/tags | grep "models" && echo "✅ Connection Verified" || echo "❌ Connection Failed"
else
    # OpenAI style check
    curl -s $OLLAMA_URL/v1/models | grep "object" && echo "✅ Connection Verified" || echo "❌ Connection Failed"
fi

echo "Ready to launch node."
