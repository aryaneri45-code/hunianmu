CREATE TABLE admins (id serial PRIMARY KEY, name text NOT NULL, email text NOT NULL UNIQUE, password_hash text NOT NULL, failed_attempts int NOT NULL DEFAULT 0, locked_until timestamptz, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE admin_sessions (id text PRIMARY KEY, admin_id int NOT NULL REFERENCES admins(id) ON DELETE CASCADE, expires_at timestamptz NOT NULL);
CREATE TABLE property_types (id serial PRIMARY KEY, name text NOT NULL, slug text NOT NULL UNIQUE);
CREATE TABLE locations (id serial PRIMARY KEY, name text NOT NULL, slug text NOT NULL UNIQUE, kind text NOT NULL DEFAULT 'kecamatan', parent_id int REFERENCES locations(id));
CREATE TABLE facilities (id serial PRIMARY KEY, name text NOT NULL, slug text NOT NULL UNIQUE, icon text NOT NULL DEFAULT 'check');
