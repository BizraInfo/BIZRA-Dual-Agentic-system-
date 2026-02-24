-- BIZRA Node0 - Invite Enhancements
-- Adds redemption limits, expiry, and permissions metadata.

ALTER TABLE invites
    ADD COLUMN IF NOT EXISTS node_target TEXT;

ALTER TABLE invites
    ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '[]'::jsonb;

ALTER TABLE invites
    ADD COLUMN IF NOT EXISTS max_redemptions INTEGER NOT NULL DEFAULT 1;

ALTER TABLE invites
    ADD COLUMN IF NOT EXISTS redemption_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE invites
    ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_invites_code ON invites(code);
CREATE INDEX IF NOT EXISTS idx_invites_redeemed ON invites(redeemed);
CREATE INDEX IF NOT EXISTS idx_invites_expires_at ON invites(expires_at);
