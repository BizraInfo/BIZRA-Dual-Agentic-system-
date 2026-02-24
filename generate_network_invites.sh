#!/bin/bash
# generate_network_invites.sh
# Generate invites for Node-1 through Node-6

echo "=== GENERATING NETWORK INVITATIONS ==="
echo "Sponsor: TitanBeast-0x99f8a (Node-0)"
echo "Constellation Size: 7 Nodes"
echo ""

INVITE_FILE="/root/bizra_invites_$(date +%Y%m%d).txt"
echo "Network Invitations - Generated: $(date -u +'%Y-%m-%dT%H:%M:%SZ')" > $INVITE_FILE
echo "Sponsor: TitanBeast-0x99f8a" >> $INVITE_FILE
echo "Trust Anchor: 8c5ee15603b937c4e4556ebf25ada33f92023b661582ac977a8b2c75a2872580" >> $INVITE_FILE
echo "Expiration: 7 days from generation" >> $INVITE_FILE
echo "" >> $INVITE_FILE
echo "=== INVITE TOKENS ===" >> $INVITE_FILE

for i in {1..6}; do
    echo ""
    echo "Generating invite for Node-$i..."
    
    invite_json=$(curl -s -X POST "http://localhost:33333/onboarding/invite/generate" \
        -H "Content-Type: application/json" \
        -H "Authorization: Invite Node0-Elite-Token" \
        -d "{
            \"sponsor_id\": \"TitanBeast-0x99f8a\",
            \"node_target\": \"Node-$i\",
            \"max_redemptions\": 1,
            \"expiry_days\": 7,
            \"permissions\": [
                \"network_join\",
                \"poi_submission\",
                \"consensus_voting\"
            ]
        }")
    
    invite_token=$(echo "$invite_json" | jq -r '.invite_token')
    invite_id=$(echo "$invite_json" | jq -r '.invite_id')
    expiry=$(echo "$invite_json" | jq -r '.expiry')
    
    if [ -n "$invite_token" ] && [ "$invite_token" != "null" ]; then
        echo "✅ Node-$i: $invite_token"
        
        # Store in file
        echo "Node-$i:" >> $INVITE_FILE
        echo "  Invite ID: $invite_id" >> $INVITE_FILE
        echo "  Token: $invite_token" >> $INVITE_FILE
        echo "  Expires: $expiry" >> $INVITE_FILE
        echo "  Redemption URL: http://bizra.ai/onboarding/redeem/$invite_token" >> $INVITE_FILE
        echo "" >> $INVITE_FILE
    else
        echo "❌ Failed to generate invite for Node-$i"
        exit 1
    fi
done

echo "" >> $INVITE_FILE
echo "=== SETUP INSTRUCTIONS ===" >> $INVITE_FILE
echo "1. Hardware Requirements:" >> $INVITE_FILE
echo "   - AMD Ryzen AI 9 HX370 or equivalent" >> $INVITE_FILE
echo "   - 32GB+ RAM" >> $INVITE_FILE
echo "   - 2TB NVMe SSD" >> $INVITE_FILE
echo "   - TPM 2.0" >> $INVITE_FILE
echo "2. Software Requirements:" >> $INVITE_FILE
echo "   - Ubuntu 24.04 LTS" >> $INVITE_FILE
echo "   - Rust nightly-2025-12-01" >> $INVITE_FILE
echo "   - PostgreSQL 16" >> $INVITE_FILE

echo ""
echo "=== INVITE GENERATION COMPLETE ==="
echo "Invites saved to: $INVITE_FILE"
