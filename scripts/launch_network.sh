#!/bin/bash
# Launch the BIZRA network (Simulation)
echo "🚀 LAUNCHING BIZRA NETWORK"

cat > docker-compose.genesis.yml << 'DOCKER_EOF'
version: '3.8'
services:
  bizra-node-0:
    image: bizra/node:omega
DOCKER_EOF

echo "✅ Network launch complete"
