-- 002_poi_ledger.sql
-- Gate 5: Proof of Impact & Gate 6: Invite System
-- BIZRA Node-0 Hardening Phase
BEGIN;
-- ══════════════════════════════════════════════════════════════════════════════
-- PROOF OF IMPACT (The Canonical Table)
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS proof_of_impact (
    poi_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    -- Anchor for sovereignty
    event_type TEXT NOT NULL,
    -- Task, Reward, Mint, InviteRedeemed, etc.
    impact_score DOUBLE PRECISION NOT NULL DEFAULT 0,
    ihsan_score DOUBLE PRECISION NOT NULL DEFAULT 0,
    reward_bzc DOUBLE PRECISION NOT NULL DEFAULT 0,
    -- BizraCoin Reward
    reward_imp DOUBLE PRECISION NOT NULL DEFAULT 0,
    -- Impact Point Reward
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS poi_user_idx ON proof_of_impact(user_id);
CREATE INDEX IF NOT EXISTS poi_event_idx ON proof_of_impact(event_type);
CREATE INDEX IF NOT EXISTS poi_verified_idx ON proof_of_impact(verified);
-- ══════════════════════════════════════════════════════════════════════════════
-- POI LEDGER VIEW (Gate 5 Naming Parity)
-- ══════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE VIEW poi_ledger AS
SELECT poi_id,
    user_id,
    event_type,
    impact_score,
    ihsan_score,
    reward_bzc,
    reward_imp,
    verified,
    metadata,
    created_at AS timestamp
FROM proof_of_impact;
-- ══════════════════════════════════════════════════════════════════════════════
-- INVITE TOKENS (Gate 6 Onboarding)
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS invite_tokens (
    token_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token TEXT NOT NULL UNIQUE,
    issuer_id UUID NOT NULL,
    -- Admin or existing user
    redeemer_id UUID,
    -- Set upon redemption
    status TEXT NOT NULL DEFAULT 'ISSUED',
    -- ISSUED, REDEEMED, REVOKED
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    CONSTRAINT valid_status CHECK (status IN ('ISSUED', 'REDEEMED', 'REVOKED'))
);
CREATE INDEX IF NOT EXISTS invite_token_idx ON invite_tokens(token);
CREATE INDEX IF NOT EXISTS invite_status_idx ON invite_tokens(status);
COMMIT;