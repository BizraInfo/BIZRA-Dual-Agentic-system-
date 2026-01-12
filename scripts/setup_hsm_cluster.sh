#!/bin/bash
# HSM Cluster Setup Simulation

echo "🏦 HSM CLUSTER SETUP (5 JURISDICTIONS)"
echo "======================================"

# Handle non-root paths
HSM_DIR="/etc/bizra/hsm"
VAR_DIR="/var/lib/bizra/hsm"

if [ ! -w "/etc" ]; then
    HSM_DIR="./etc/bizra/hsm"
    VAR_DIR="./var/lib/bizra/hsm"
    mkdir -p "$HSM_DIR"
    mkdir -p "$VAR_DIR/keystores"
else
    mkdir -p /etc/bizra/hsm
    mkdir -p /var/lib/bizra/hsm/keystores
fi

# Generate simulated HSM configurations
for loc in dubai zurich singapore usa elsalvador; do
    cat > "$HSM_DIR/${loc}.yaml" << CONFIG_EOF
location: ${loc}
hsm_model: YubiHSM2
serial_number: YK-001-144-00$((${RANDOM:0:3}))
status: online
public_key: $(openssl rand -hex 32)
threshold_scheme: 3-of-5
backup_slot: $((RANDOM % 10 + 1))
activation_time: "2026-01-15T00:00:00Z"
CONFIG_EOF
    
    echo "✅ ${loc}: HSM configured"
done

# Generate threshold key shares (simulated)
echo "🔑 Generating 3-of-5 threshold key shares..."
cat > "$VAR_DIR/threshold_keys.json" << KEYS_EOF
{
  "threshold_scheme": "3-of-5",
  "master_public_key": "simulated_pub_key_$(openssl rand -hex 16)",
  "key_shares": {
    "dubai": "share_$(openssl rand -hex 8)",
    "zurich": "share_$(openssl rand -hex 8)",
    "singapore": "share_$(openssl rand -hex 8)",
    "usa": "share_$(openssl rand -hex 8)",
    "elsalvador": "share_$(openssl rand -hex 8)"
  },
  "generated": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "backup_protocol": "ShamirSecretSharing"
}
KEYS_EOF

echo "✅ HSM cluster simulation complete"
