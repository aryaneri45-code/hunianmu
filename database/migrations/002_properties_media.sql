CREATE SEQUENCE property_code_seq;
CREATE TABLE properties (
 id serial PRIMARY KEY, code text NOT NULL UNIQUE DEFAULT ('HM-' || lpad(nextval('property_code_seq')::text, 4, '0')),
 slug text NOT NULL UNIQUE, title text NOT NULL, description text NOT NULL,
 type_id int NOT NULL REFERENCES property_types(id), location_id int NOT NULL REFERENCES locations(id),
 public_address text NOT NULL, price bigint NOT NULL CHECK(price>=0), price_period text NOT NULL CHECK(price_period IN ('bulan','tahun','sekali')),
 land_area numeric NOT NULL DEFAULT 0 CHECK(land_area>=0), building_area numeric NOT NULL DEFAULT 0 CHECK(building_area>=0),
 bedrooms int NOT NULL DEFAULT 0 CHECK(bedrooms>=0), bathrooms int NOT NULL DEFAULT 0 CHECK(bathrooms>=0),
 certificate text NOT NULL DEFAULT '', furniture text NOT NULL DEFAULT '', kos_type text NOT NULL DEFAULT '' CHECK(kos_type IN ('','putra','putri','campur')),
 room_size text NOT NULL DEFAULT '', rules text NOT NULL DEFAULT '', video_url text NOT NULL DEFAULT '',
 availability text NOT NULL DEFAULT 'tersedia' CHECK(availability IN ('tersedia','dipesan','terisi')),
 featured boolean NOT NULL DEFAULT false, status text NOT NULL DEFAULT 'draf' CHECK(status IN ('draf','terbit','arsip')),
 owner_name text NOT NULL DEFAULT '', owner_contact text NOT NULL DEFAULT '',
 seo_title text NOT NULL DEFAULT '', seo_description text NOT NULL DEFAULT '',
 published_at timestamptz, updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz
);
CREATE INDEX properties_catalog ON properties(status,type_id,location_id,price) WHERE deleted_at IS NULL;
CREATE INDEX properties_search ON properties USING gin(to_tsvector('simple', title || ' ' || description || ' ' || public_address));
CREATE TABLE property_facilities (property_id int REFERENCES properties(id) ON DELETE CASCADE, facility_id int REFERENCES facilities(id), PRIMARY KEY(property_id,facility_id));
CREATE TABLE property_media (id serial PRIMARY KEY, property_id int NOT NULL REFERENCES properties(id) ON DELETE CASCADE, path text NOT NULL, medium_path text NOT NULL, thumb_path text NOT NULL, alt text NOT NULL, sort_order int NOT NULL DEFAULT 0, is_cover boolean NOT NULL DEFAULT false, width int NOT NULL, height int NOT NULL);
CREATE UNIQUE INDEX property_one_cover ON property_media(property_id) WHERE is_cover;
CREATE TABLE property_redirects (slug text PRIMARY KEY, property_id int NOT NULL REFERENCES properties(id));
