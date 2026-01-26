#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# BIZRA Node0 Kernel Synchronization Script
# ═══════════════════════════════════════════════════════════════════════════════
# Purpose: Synchronize bizra_kernel from WSL (Kernel/Source) to Windows (Node/Target)
# Architecture: Standing on the Shoulders of Giants Protocol
# 
# Source: /root/bizra-genesis/bizra_kernel (WSL - Canonical)
# Target: /mnt/c/BIZRA-Dual-Agentic-system--main/bizra_kernel (Windows - Replica)
# ═══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

# Configuration
KERNEL_SOURCE="/root/bizra-genesis/bizra_kernel"
KERNEL_TARGET="/mnt/c/BIZRA-Dual-Agentic-system--main/bizra_kernel"
BACKUP_DIR="/root/bizra-genesis/.kernel_backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
SOURCE_HASH=""
TARGET_HASH=""
NEW_TARGET_HASH=""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[✓]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[!]${NC} $1"; }
log_error() { echo -e "${RED}[✗]${NC} $1"; }

# Pre-flight checks
preflight() {
    log_info "Running preflight checks..."
    
    if [[ ! -d "$KERNEL_SOURCE" ]]; then
        log_error "Source kernel not found: $KERNEL_SOURCE"
        exit 1
    fi
    
    if [[ ! -d "$KERNEL_TARGET" ]]; then
        log_error "Target kernel not found: $KERNEL_TARGET"
        exit 1
    fi
    
    log_success "Both kernel directories exist"
}

# Create backup of target before sync
backup_target() {
    log_info "Creating backup of target kernel..."
    mkdir -p "$BACKUP_DIR"
    
    BACKUP_FILE="$BACKUP_DIR/kernel_backup_${TIMESTAMP}.tar.gz"
    tar -czf "$BACKUP_FILE" -C "$(dirname "$KERNEL_TARGET")" "$(basename "$KERNEL_TARGET")" 2>/dev/null || {
        log_warn "Backup creation failed (non-critical)"
        return 0
    }
    
    log_success "Backup created: $BACKUP_FILE"
}

# Compute hash of directory for comparison
compute_hash() {
    local dir="$1"
    find "$dir" -type f -exec sha256sum {} \; 2>/dev/null | sort | sha256sum | cut -d' ' -f1
}

# Perform synchronization
sync_kernel() {
    log_info "Computing source hash..."
    SOURCE_HASH=$(compute_hash "$KERNEL_SOURCE")
    log_info "Source hash: $SOURCE_HASH"
    
    log_info "Computing target hash..."
    TARGET_HASH=$(compute_hash "$KERNEL_TARGET")
    log_info "Target hash: $TARGET_HASH"
    
    if [[ "$SOURCE_HASH" == "$TARGET_HASH" ]]; then
        log_success "Kernels are already in sync. No action needed."
        NEW_TARGET_HASH="$TARGET_HASH"
        return 0
    fi
    
    log_warn "Kernels diverged. Synchronizing..."
    
    # Sync using rsync (preserves structure, handles deletions)
    rsync -av --delete \
        --exclude="__pycache__" \
        --exclude="*.pyc" \
        --exclude=".pytest_cache" \
        "$KERNEL_SOURCE/" "$KERNEL_TARGET/"
    
    # Verify sync
    NEW_TARGET_HASH=$(compute_hash "$KERNEL_TARGET")
    if [[ "$SOURCE_HASH" == "$NEW_TARGET_HASH" ]]; then
        log_success "Synchronization complete. Hashes match."
    else
        log_error "Post-sync hash mismatch! Manual review required."
        exit 1
    fi
}

# Generate sync receipt
generate_receipt() {
    RECEIPT_FILE="/root/bizra-genesis/receipts/kernel_sync_${TIMESTAMP}.json"
    mkdir -p "$(dirname "$RECEIPT_FILE")"
    
    cat > "$RECEIPT_FILE" << EOF
{
    "operation": "kernel_sync",
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "source": "$KERNEL_SOURCE",
    "target": "$KERNEL_TARGET",
    "source_hash": "$SOURCE_HASH",
    "target_hash_before": "$TARGET_HASH",
    "target_hash_after": "$NEW_TARGET_HASH",
    "status": "SUCCESS",
    "protocol": "StandingOnShouldersOfGiants"
}
EOF
    
    log_success "Receipt generated: $RECEIPT_FILE"
}

# Main execution
main() {
    echo "═══════════════════════════════════════════════════════════════════════════════"
    echo " BIZRA Node0 Kernel Sync - Standing on the Shoulders of Giants Protocol"
    echo "═══════════════════════════════════════════════════════════════════════════════"
    echo ""
    
    preflight
    backup_target
    sync_kernel
    generate_receipt
    
    echo ""
    log_success "All operations completed successfully."
}

main "$@"
