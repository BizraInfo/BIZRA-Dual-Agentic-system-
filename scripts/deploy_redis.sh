#!/bin/bash
# deploy_redis.sh
# Status: PRODUCTION_PERSISTENCE_V1
# BIZRA v9.0 Redis Deployment for Chain Persistence

set -e

echo "🔴 Deploying Redis for Chain Persistence"
echo "========================================"

# Configuration paths
REDIS_DIR="/etc/bizra/redis"
REDIS_DATA="/var/lib/bizra-redis"
BIZRA_CONF="/etc/bizra"

# Create directories
mkdir -p "$REDIS_DIR"
mkdir -p "$REDIS_DATA"
mkdir -p "$BIZRA_CONF"

# Generate strong password
REDIS_PASSWORD=$(openssl rand -hex 32)

# Create Redis configuration
cat > "$REDIS_DIR/redis.conf" << EOF
# BIZRA Production Redis Configuration
# Generated: $(date -Iseconds)
bind 127.0.0.1 ::1
port 6379
protected-mode yes

# Authentication
requirepass $REDIS_PASSWORD

# Persistence - AOF + RDB for durability
appendonly yes
appendfsync everysec
save 900 1
save 300 10
save 60 10000
dir $REDIS_DATA

# Memory settings (adjust based on system)
maxmemory 16gb
maxmemory-policy volatile-lru

# Performance tuning
tcp-keepalive 300
timeout 0
tcp-backlog 511

# Lua scripting (required for atomic CAS)
lua-time-limit 5000

# Security - disable dangerous commands
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command CONFIG "CONFIG_SECRET_$(openssl rand -hex 8)"

# Logging
loglevel notice
logfile /var/log/bizra-redis.log
EOF

echo "✅ Redis configuration created"

# Create systemd service
cat > /etc/systemd/system/bizra-redis.service << EOF
[Unit]
Description=BIZRA Redis Chain Storage
After=network.target
Requires=network.target

[Service]
Type=simple
User=root
Group=root
ExecStart=/usr/bin/redis-server $REDIS_DIR/redis.conf
ExecStop=/usr/bin/redis-cli -a $REDIS_PASSWORD shutdown
Restart=always
RestartSec=10

# Security hardening
NoNewPrivileges=yes
PrivateTmp=yes

# Resource limits
LimitNOFILE=65536
LimitNPROC=65536

[Install]
WantedBy=multi-user.target
EOF

echo "✅ Systemd service created"

# Set permissions
chmod 750 "$REDIS_DATA"
chmod 640 "$REDIS_DIR/redis.conf"

# Check if Redis is installed
if ! command -v redis-server &> /dev/null; then
    echo "📥 Installing Redis..."
    apt-get update -qq
    apt-get install -y redis-server redis-tools
fi

# Enable and start service
systemctl daemon-reload
systemctl enable bizra-redis.service
systemctl start bizra-redis.service

# Wait for Redis to start
echo "⏳ Waiting for Redis to start..."
for i in {1..30}; do
    if redis-cli -a "$REDIS_PASSWORD" ping 2>/dev/null | grep -q PONG; then
        echo "✅ Redis is running"
        break
    fi
    sleep 1
    if [ $i -eq 30 ]; then
        echo "❌ Redis failed to start"
        journalctl -u bizra-redis.service --no-pager -n 20
        exit 1
    fi
done

# Test Redis persistence
echo "🧪 Testing Redis persistence..."
TEST_KEY="bizra:test:$(date +%s)"
TEST_VALUE="persistence_test_$(openssl rand -hex 8)"
redis-cli -a "$REDIS_PASSWORD" SET "$TEST_KEY" "$TEST_VALUE" >/dev/null 2>&1

# Verify write
RECOVERED_VALUE=$(redis-cli -a "$REDIS_PASSWORD" GET "$TEST_KEY" 2>/dev/null)
if [ "$RECOVERED_VALUE" = "$TEST_VALUE" ]; then
    echo "✅ Redis read/write verified"
else
    echo "❌ Redis read/write test failed"
    exit 1
fi

# Clean up test
redis-cli -a "$REDIS_PASSWORD" DEL "$TEST_KEY" >/dev/null 2>&1

# Store connection info in secure location
cat > "$BIZRA_CONF/redis.env" << EOF
# BIZRA Redis Connection Configuration
# Generated: $(date -Iseconds)
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=$REDIS_PASSWORD
REDIS_DB=0
REDIS_URL=redis://:$REDIS_PASSWORD@127.0.0.1:6379/0
EOF

chmod 600 "$BIZRA_CONF/redis.env"

# Also export for current session
export REDIS_URL="redis://:$REDIS_PASSWORD@127.0.0.1:6379/0"

echo ""
echo "🎯 REDIS DEPLOYMENT COMPLETE"
echo "============================"
echo "Host: 127.0.0.1:6379"
echo "Status: 🔴 Running"
echo "Persistence: ✅ Enabled (AOF + RDB)"
echo "Auth: 🔐 Password-protected"
echo "Service: bizra-redis.service"
echo "Data Dir: $REDIS_DATA"
echo "Config: $BIZRA_CONF/redis.env"
echo ""
echo "To use in BIZRA:"
echo "  source /etc/bizra/redis.env"
echo "  export REDIS_URL"
echo ""
echo "Next: cargo build --release && systemctl start bizra-node"
