-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.asset (
  id bigint NOT NULL,
  code text NOT NULL UNIQUE,
  type text NOT NULL,
  brand text,
  purchase_date date,
  price bigint,
  CONSTRAINT asset_pkey PRIMARY KEY (id)
);
CREATE TABLE public.asset_rent_line_item (
  id bigint NOT NULL,
  created_at timestamp with time zone NOT NULL,
  rent_id bigint NOT NULL,
  date text NOT NULL,
  asset_id bigint NOT NULL,
  unit_price bigint NOT NULL,
  amount bigint NOT NULL,
  condition_out text NOT NULL,
  returned bigint NOT NULL,
  condition_in text NOT NULL,
  damage_fee double precision,
  extended_price bigint NOT NULL,
  CONSTRAINT asset_rent_line_item_pkey PRIMARY KEY (id),
  CONSTRAINT asset_rent_line_item_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.asset(id),
  CONSTRAINT asset_rent_line_item_rent_id_fkey FOREIGN KEY (rent_id) REFERENCES public.assets_rent(id)
);
CREATE TABLE public.assets_rent (
  id bigint NOT NULL,
  rent_code text NOT NULL,
  created_at timestamp with time zone NOT NULL,
  member_id bigint NOT NULL,
  hours bigint NOT NULL,
  date date NOT NULL,
  total_price bigint NOT NULL,
  discounted_price double precision,
  deposit double precision NOT NULL,
  due text,
  CONSTRAINT assets_rent_pkey PRIMARY KEY (id),
  CONSTRAINT assets_rent_new_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.member(id)
);
CREATE TABLE public.coach (
  coach_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name text,
  phone_no text,
  speciality text,
  hourly_rate numeric,
  CONSTRAINT coach_pkey PRIMARY KEY (coach_id)
);
CREATE TABLE public.coaching_header (
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  session_no bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  date date,
  member_id bigint,
  coach_id bigint,
  total_coaching_fee numeric,
  member_discount_amount numeric,
  net_coaching_fee numeric,
  points_earned numeric,
  coaching_code text DEFAULT 'CO2026'::text,
  CONSTRAINT coaching_header_pkey PRIMARY KEY (session_no),
  CONSTRAINT coaching_header_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.member(id),
  CONSTRAINT coaching_header_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES public.coach(coach_id)
);
CREATE TABLE public.coaching_line_item (
  line_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  session_no bigint,
  training_date date,
  start_time time without time zone,
  end_time time without time zone,
  skill_focus text,
  hours numeric,
  hourly_rate numeric,
  extended_fee numeric,
  CONSTRAINT coaching_line_item_pkey PRIMARY KEY (line_id),
  CONSTRAINT coaching_line_item_session_no_fkey FOREIGN KEY (session_no) REFERENCES public.coaching_header(session_no)
);
CREATE TABLE public.court (
  court_number bigint NOT NULL UNIQUE,
  price numeric NOT NULL DEFAULT '200'::numeric,
  price_weekend numeric DEFAULT '240'::numeric,
  court_code text NOT NULL DEFAULT 'C000'::text,
  CONSTRAINT court_pkey PRIMARY KEY (court_number)
);
CREATE TABLE public.court_reservation (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  reservation_date date NOT NULL,
  member_id bigint,
  total_hour numeric,
  amount_sum numeric,
  discount numeric,
  net_amount numeric,
  points_earned numeric,
  reservation_code text NOT NULL UNIQUE,
  status text,
  CONSTRAINT court_reservation_pkey PRIMARY KEY (id),
  CONSTRAINT court_reservation_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.member(id)
);
CREATE TABLE public.court_reservation_line_item (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  court_reservation_id bigint NOT NULL,
  date date,
  start_time time without time zone,
  end_time time without time zone,
  total_time numeric,
  court_number bigint,
  extended_price numeric,
  CONSTRAINT court_reservation_line_item_pkey PRIMARY KEY (id),
  CONSTRAINT court_reservation_line_item_court_reservation_id_fkey FOREIGN KEY (court_reservation_id) REFERENCES public.court_reservation(id),
  CONSTRAINT court_reservation_line_item_court_number_fkey FOREIGN KEY (court_number) REFERENCES public.court(court_number)
);
CREATE TABLE public.member (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name text,
  phone text,
  mail text,
  detail text,
  gender text,
  tier_id bigint,
  current_reward_point bigint,
  lifetime_point bigint,
  CONSTRAINT member_pkey PRIMARY KEY (id),
  CONSTRAINT member_tier_id_fkey FOREIGN KEY (tier_id) REFERENCES public.tier(id)
);
CREATE TABLE public.product (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  code text NOT NULL DEFAULT 'P000'::text UNIQUE,
  name text,
  category text,
  unit_id bigint,
  unit_price numeric,
  stock numeric,
  CONSTRAINT product_pkey PRIMARY KEY (id),
  CONSTRAINT product_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES public.unit(id)
);
CREATE TABLE public.sale (
  id bigint NOT NULL,
  receipt_code text NOT NULL UNIQUE,
  sale_date date NOT NULL,
  member_id bigint NOT NULL,
  purchase_method text NOT NULL,
  total_price numeric NOT NULL,
  discount numeric,
  net_total numeric NOT NULL,
  points_earned numeric,
  points_redeemed numeric DEFAULT '0'::numeric,
  CONSTRAINT sale_pkey PRIMARY KEY (id),
  CONSTRAINT sale_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.member(id)
);
CREATE TABLE public.sale_line_item (
  id bigint NOT NULL,
  created_at timestamp with time zone NOT NULL,
  sale_id bigint NOT NULL,
  product_id bigint NOT NULL,
  unit_price bigint NOT NULL,
  quantity bigint NOT NULL,
  extended_price bigint NOT NULL,
  CONSTRAINT sale_line_item_pkey PRIMARY KEY (id),
  CONSTRAINT sale_line_item_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.product(id),
  CONSTRAINT sale_line_item_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES public.sale(id)
);
CREATE TABLE public.service_type (
  name text NOT NULL UNIQUE,
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  CONSTRAINT service_type_pkey PRIMARY KEY (id)
);
CREATE TABLE public.technician (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name text,
  phone text,
  code text,
  CONSTRAINT technician_pkey PRIMARY KEY (id)
);
CREATE TABLE public.tier (
  id bigint NOT NULL UNIQUE,
  name text,
  point_required text NOT NULL,
  discount_percentage bigint,
  point_multiplier double precision,
  CONSTRAINT tier_pkey PRIMARY KEY (id)
);
CREATE TABLE public.unit (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  code text,
  name text,
  CONSTRAINT unit_pkey PRIMARY KEY (id)
);
CREATE TABLE public.work_order (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  member_id bigint,
  date date,
  total_material_cost real,
  total_labor_cost real,
  member_discount real,
  grand_total real,
  points_earned bigint,
  technician_id bigint,
  code text,
  expected_finish_date date,
  status text,
  total real,
  discount numeric,
  CONSTRAINT work_order_pkey PRIMARY KEY (id),
  CONSTRAINT workorder_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.member(id),
  CONSTRAINT workorder_technician_id_fkey FOREIGN KEY (technician_id) REFERENCES public.technician(id)
);
CREATE TABLE public.work_order_line_item (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  work_order_id bigint,
  racket_model_product_id bigint,
  product_id bigint,
  tension_required bigint,
  labor_fee double precision,
  material_cost double precision,
  line_total text,
  service_id bigint,
  CONSTRAINT work_order_line_item_pkey PRIMARY KEY (id),
  CONSTRAINT work_order_line_item_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_order(id),
  CONSTRAINT work_order_line_item_racket_model_product_id_fkey FOREIGN KEY (racket_model_product_id) REFERENCES public.product(id),
  CONSTRAINT work_order_line_item_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.product(id),
  CONSTRAINT work_order_line_item_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.service_type(id)
);