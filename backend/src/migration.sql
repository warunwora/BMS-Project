-- Run this in Supabase SQL Editor to create missing tables

-- booking
CREATE TABLE IF NOT EXISTS booking (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE,
  member_id INTEGER REFERENCES member(id),
  booking_date DATE,
  play_date DATE,
  status TEXT DEFAULT 'Upcoming',
  subtotal NUMERIC(10,2) DEFAULT 0,
  discount NUMERIC(10,2) DEFAULT 0,
  points_redeemed INTEGER DEFAULT 0,
  net_amount NUMERIC(10,2) DEFAULT 0,
  deposit NUMERIC(10,2) DEFAULT 0,
  change NUMERIC(10,2) DEFAULT 0,
  points_earned INTEGER DEFAULT 0
);

CREATE OR REPLACE FUNCTION trg_booking_code() RETURNS TRIGGER AS $$
BEGIN NEW.code := 'BK-' || LPAD(NEW.id::TEXT,5,'0'); RETURN NEW; END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS set_booking_code ON booking;
CREATE TRIGGER set_booking_code BEFORE INSERT ON booking FOR EACH ROW WHEN (NEW.code IS NULL) EXECUTE FUNCTION trg_booking_code();

CREATE TABLE IF NOT EXISTS booking_court (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES booking(id) ON DELETE CASCADE,
  court_id INTEGER REFERENCES court(id),
  date DATE,
  start_time TIME,
  end_time TIME,
  hours NUMERIC(4,2)
);

-- rental
CREATE TABLE IF NOT EXISTS rental (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE,
  member_id INTEGER REFERENCES member(id),
  date DATE,
  status TEXT DEFAULT 'Rented',
  total_fee NUMERIC(10,2) DEFAULT 0,
  subtotal NUMERIC(10,2) DEFAULT 0,
  discount NUMERIC(10,2) DEFAULT 0,
  total_deposit NUMERIC(10,2) DEFAULT 0,
  net_refund NUMERIC(10,2) DEFAULT 0,
  change NUMERIC(10,2) DEFAULT 0,
  points_earned INTEGER DEFAULT 0
);

CREATE OR REPLACE FUNCTION trg_rental_code() RETURNS TRIGGER AS $$
BEGIN NEW.code := 'RN-' || LPAD(NEW.id::TEXT,5,'0'); RETURN NEW; END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS set_rental_code ON rental;
CREATE TRIGGER set_rental_code BEFORE INSERT ON rental FOR EACH ROW WHEN (NEW.code IS NULL) EXECUTE FUNCTION trg_rental_code();

CREATE TABLE IF NOT EXISTS rental_item (
  id SERIAL PRIMARY KEY,
  rental_id INTEGER REFERENCES rental(id) ON DELETE CASCADE,
  asset_id INTEGER REFERENCES asset(id),
  condition_out TEXT DEFAULT 'Good',
  condition_in TEXT,
  rate NUMERIC(10,2) DEFAULT 0,
  deposit NUMERIC(10,2) DEFAULT 0,
  penalty TEXT DEFAULT 'None'
);

-- coaching_session
CREATE TABLE IF NOT EXISTS coaching_session (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE,
  member_id INTEGER REFERENCES member(id),
  coach_id INTEGER REFERENCES coach(id),
  booking_date DATE,
  skill_focus TEXT,
  subtotal NUMERIC(10,2) DEFAULT 0,
  discount NUMERIC(10,2) DEFAULT 0,
  net_amount NUMERIC(10,2) DEFAULT 0,
  deposit NUMERIC(10,2) DEFAULT 0,
  change NUMERIC(10,2) DEFAULT 0,
  points_earned INTEGER DEFAULT 0
);

CREATE OR REPLACE FUNCTION trg_session_code() RETURNS TRIGGER AS $$
BEGIN NEW.code := 'CS-' || LPAD(NEW.id::TEXT,5,'0'); RETURN NEW; END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS set_session_code ON coaching_session;
CREATE TRIGGER set_session_code BEFORE INSERT ON coaching_session FOR EACH ROW WHEN (NEW.code IS NULL) EXECUTE FUNCTION trg_session_code();

CREATE TABLE IF NOT EXISTS coaching_slot (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES coaching_session(id) ON DELETE CASCADE,
  training_date DATE,
  start_time TIME,
  end_time TIME,
  hours NUMERIC(4,2),
  skill_focus TEXT,
  rate NUMERIC(10,2) DEFAULT 0,
  extended_fee NUMERIC(10,2) DEFAULT 0
);

-- pos_receipt
CREATE TABLE IF NOT EXISTS pos_receipt (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE,
  member_id INTEGER REFERENCES member(id),
  date TIMESTAMPTZ DEFAULT NOW(),
  method TEXT DEFAULT 'Cash',
  subtotal NUMERIC(10,2) DEFAULT 0,
  discount NUMERIC(10,2) DEFAULT 0,
  points_redeemed INTEGER DEFAULT 0,
  net_amount NUMERIC(10,2) DEFAULT 0,
  points_earned INTEGER DEFAULT 0,
  deposit NUMERIC(10,2) DEFAULT 0,
  change NUMERIC(10,2) DEFAULT 0
);

CREATE OR REPLACE FUNCTION trg_receipt_code() RETURNS TRIGGER AS $$
BEGIN NEW.code := 'RC-' || LPAD(NEW.id::TEXT,5,'0'); RETURN NEW; END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS set_receipt_code ON pos_receipt;
CREATE TRIGGER set_receipt_code BEFORE INSERT ON pos_receipt FOR EACH ROW WHEN (NEW.code IS NULL) EXECUTE FUNCTION trg_receipt_code();

CREATE TABLE IF NOT EXISTS pos_item (
  id SERIAL PRIMARY KEY,
  receipt_id INTEGER REFERENCES pos_receipt(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES product(id),
  unit_price NUMERIC(10,2) DEFAULT 0,
  qty INTEGER DEFAULT 1,
  ext_price NUMERIC(10,2) DEFAULT 0
);

-- work_order_item (if missing)
CREATE TABLE IF NOT EXISTS work_order_item (
  id SERIAL PRIMARY KEY,
  work_order_id INTEGER REFERENCES work_order(id) ON DELETE CASCADE,
  asset TEXT,
  product_code TEXT,
  service TEXT,
  tension TEXT,
  material_cost NUMERIC(10,2) DEFAULT 0,
  labor_fee NUMERIC(10,2) DEFAULT 0
);

-- Add new columns to work_order if using new schema
ALTER TABLE work_order ADD COLUMN IF NOT EXISTS tech_id TEXT;
ALTER TABLE work_order ADD COLUMN IF NOT EXISTS est_finish_date DATE;
ALTER TABLE work_order ADD COLUMN IF NOT EXISTS subtotal NUMERIC(10,2) DEFAULT 0;
ALTER TABLE work_order ADD COLUMN IF NOT EXISTS total_labor NUMERIC(10,2) DEFAULT 0;
ALTER TABLE work_order ADD COLUMN IF NOT EXISTS net_amount NUMERIC(10,2) DEFAULT 0;

-- Backfill new columns from old columns in work_order
UPDATE work_order SET tech_id = CAST(technician_id AS TEXT) WHERE tech_id IS NULL AND technician_id IS NOT NULL;
UPDATE work_order SET est_finish_date = expected_finish_date WHERE est_finish_date IS NULL AND expected_finish_date IS NOT NULL;
UPDATE work_order SET subtotal = total_material_cost WHERE (subtotal IS NULL OR subtotal = 0) AND total_material_cost IS NOT NULL;
UPDATE work_order SET total_labor = total_labor_cost WHERE (total_labor IS NULL OR total_labor = 0) AND total_labor_cost IS NOT NULL;
UPDATE work_order SET net_amount = grand_total WHERE (net_amount IS NULL OR net_amount = 0) AND grand_total IS NOT NULL;

-- Add new columns to member if using new schema
ALTER TABLE member ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE member ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;
ALTER TABLE member ADD COLUMN IF NOT EXISTS lifetime_points INTEGER DEFAULT 0;

-- Backfill new columns from old columns in member
UPDATE member SET email = mail WHERE email IS NULL AND mail IS NOT NULL;
UPDATE member SET points = current_reward_point WHERE (points IS NULL OR points = 0) AND current_reward_point IS NOT NULL;
