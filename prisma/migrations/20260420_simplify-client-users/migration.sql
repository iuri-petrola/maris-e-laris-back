ALTER TABLE client_users DROP COLUMN IF EXISTS email;
ALTER TABLE client_users DROP COLUMN IF EXISTS whatsapp;
ALTER TABLE client_users DROP COLUMN IF EXISTS password_hash;
ALTER TABLE client_users ADD COLUMN IF NOT EXISTS contato TEXT;