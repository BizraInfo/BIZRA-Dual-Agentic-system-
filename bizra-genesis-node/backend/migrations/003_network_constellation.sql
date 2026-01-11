-- BIZRA Node0 - Network Constellation Table
-- Document ID: BIZRA-NODE0-v1.0.0-GENESIS
-- Purpose: Track the founding constellation nodes (Node-1 to Node-N) assigned by Genesis.
-- Create invites table first
CREATE TABLE IF NOT EXISTS invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    issued_by TEXT NOT NULL DEFAULT 'NODE0-TITAN',
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    redeemed BOOLEAN DEFAULT FALSE,
    redeemed_at TIMESTAMPTZ,
    redeemed_by TEXT -- Node-ID (e.g., "Node-1")
);
CREATE TABLE IF NOT EXISTS network_constellation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_seq_id INTEGER NOT NULL UNIQUE,
    -- 1, 2, 3... (Node-1, Node-2)
    node_codename TEXT NOT NULL UNIQUE,
    -- e.g., "SandyRavine-44"
    public_key TEXT,
    -- Optional identity key
    invite_code_used TEXT NOT NULL REFERENCES invites(code),
    ip_address INET,
    platform TEXT,
    -- 'macOS', 'windows', 'linux'
    connected_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'offline', 'banned'))
);
-- Index for sequence lookup
CREATE INDEX IF NOT EXISTS idx_network_seq ON network_constellation(node_seq_id);