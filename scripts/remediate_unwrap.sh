#!/bin/bash
# UNWRAP REMEDIATION PROTOCOL
set -e

echo "🔒 REMOVING UNWRAP() FROM CRITICAL PATHS..."

# 1. Add deny lint to critical modules
for file in src/receipts.rs src/hookchain.rs src/sape/ihsan.rs src/fate.rs; do
    if [ -f "$file" ]; then
        # Add deny at module level
        if ! grep -q "deny(clippy::unwrap_used)" "$file"; then
            sed -i '1i #![deny(clippy::unwrap_used)]' "$file"
            echo "✓ Deny unwrap added to $file"
        fi
    fi
done

# 2. Replace unwrap() with proper error handling
# Note: We skip tests directory and test modules in production files ideally, but for this script we follow instructions
find src/ -name "*.rs" -exec grep -lF "unwrap()" {} \; | while read file; do
    echo "🔍 Processing $file..."
    
    # Context-aware replacements
    # Using perl for safe replacement
    # Replacing .unwrap() with .context(...)?
    # We must be careful not to break tests that might rely on unwrap panic
    if [[ "$file" == *"test"* ]]; then
        echo "Skipping test file: $file"
        continue
    fi

    # Check if the file has unwrap
    if grep -q "\.unwrap()" "$file"; then
        perl -pi -e 's/\.unwrap\(\)/.context("Failed to unwrap result")?/g' "$file"
        
        # Add anyhow import if needed and not present
        if ! grep -q "use anyhow::Context" "$file"; then
             sed -i '1i use anyhow::Context;' "$file"
        fi
        echo "✓ Replaced unwrap() in $file"
    fi
done

# 3. Update Cargo.toml for better error handling
if ! grep -q "package.metadata.deny-unwrap" Cargo.toml; then
cat >> Cargo.toml << 'EOF'

[features]
strict = ["deny-unwrap"]

[package.metadata.deny-unwrap]
# Critical modules that must not use unwrap
critical = ["receipts", "hookchain", "sape", "fate", "omega"]
EOF
fi

echo "✅ UNWRAP REMEDIATION COMPLETE"
