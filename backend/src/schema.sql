CREATE TABLE IF NOT EXISTS member (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  gender TEXT DEFAULT 'Male',
  tier_id TEXT DEFAULT 'Bronze',
  points INTEGER DEFAULT 0,
  lifetime_points INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS court (
  id SERIAL PRIMARY KEY,
  court_no TEXT,
  court_code TEXT,
  weekday_price NUMERIC(10,2) DEFAULT 0,
  weekend_price NUMERIC(10,2) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS coach (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  speciality TEXT,
  hourly_rate NUMERIC(10,2) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS asset (
  id SERIAL PRIMARY KEY,
  code TEXT,
  brand TEXT,
  type TEXT,
  base_rate NUMERIC(10,2) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS product (
  id SERIAL PRIMARY KEY,
  code TEXT,
  name TEXT NOT NULL,
  category TEXT,
  unit_price NUMERIC(10,2) DEFAULT 0,
  stock INTEGER DEFAULT 0
);

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

CREATE TABLE IF NOT EXISTS work_order (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE,
  member_id INTEGER REFERENCES member(id),
  tech_id TEXT,
  date DATE,
  est_finish_date DATE,
  status TEXT DEFAULT 'Pending',
  subtotal NUMERIC(10,2) DEFAULT 0,
  total_labor NUMERIC(10,2) DEFAULT 0,
  net_amount NUMERIC(10,2) DEFAULT 0,
  discount NUMERIC(10,2) DEFAULT 0,
  deposit NUMERIC(10,2) DEFAULT 0,
  change NUMERIC(10,2) DEFAULT 0,
  points_earned INTEGER DEFAULT 0
);

CREATE OR REPLACE FUNCTION trg_workorder_code() RETURNS TRIGGER AS $$
BEGIN NEW.code := 'WO-' || LPAD(NEW.id::TEXT,5,'0'); RETURN NEW; END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER set_workorder_code BEFORE INSERT ON work_order FOR EACH ROW WHEN (NEW.code IS NULL) EXECUTE FUNCTION trg_workorder_code();

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
CREATE TRIGGER set_receipt_code BEFORE INSERT ON pos_receipt FOR EACH ROW WHEN (NEW.code IS NULL) EXECUTE FUNCTION trg_receipt_code();

CREATE TABLE IF NOT EXISTS pos_item (
  id SERIAL PRIMARY KEY,
  receipt_id INTEGER REFERENCES pos_receipt(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES product(id),
  unit_price NUMERIC(10,2) DEFAULT 0,
  qty INTEGER DEFAULT 1,
  ext_price NUMERIC(10,2) DEFAULT 0
);

INSERT INTO court (court_no, court_code, weekday_price, weekend_price) VALUES
  ('1','C001',200,250),('2','C002',200,250),('3','C003',220,270),('4','C004',220,270);
