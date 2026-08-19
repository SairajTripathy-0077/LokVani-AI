-- ================================================================================
-- LOKVANI AI / SETU AI - DATABASE SCHEMA (SUPABASE / POSTGRESQL)
-- ================================================================================

-- 1. Create enum for Query Status and Risk Categories
CREATE TYPE query_status AS ENUM (
  'AUTO_VERIFIED',
  'PENDING_TRUST_REVIEW',
  'VERIFIED_BY_TRUST_NODE'
);

CREATE TYPE risk_category AS ENUM (
  'FINANCIAL_ELIGIBILITY',
  'PESTICIDE_SAFETY',
  'FINANCIAL_LOAN',
  'AGRICULTURAL_DOSAGE',
  'NONE'
);

-- 2. Table: Interactions (User Voice Queries & AI Answers)
CREATE TABLE IF NOT EXISTS interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name VARCHAR(100) DEFAULT 'Ramesh Kumar (Small Farmer)',
  user_location VARCHAR(100) DEFAULT 'Azamgarh, UP',
  query_text TEXT NOT NULL,
  intent VARCHAR(50) NOT NULL,
  domain VARCHAR(50) NOT NULL,
  is_high_stakes BOOLEAN DEFAULT FALSE,
  status query_status DEFAULT 'AUTO_VERIFIED',
  risk_category risk_category DEFAULT 'NONE',
  trust_note TEXT,
  short_answer_hi TEXT NOT NULL,
  short_answer_en TEXT NOT NULL,
  actionable_steps JSONB DEFAULT '[]'::jsonb,
  operator_notes TEXT,
  verified_by VARCHAR(100),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast query lookup
CREATE INDEX idx_interactions_status ON interactions(status);
CREATE INDEX idx_interactions_created ON interactions(created_at DESC);

-- 3. Table: Community Intelligence Network (Crowdsourced Mandi Rates & Weather)
CREATE TABLE IF NOT EXISTS community_intelligence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item VARCHAR(100) NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  unit VARCHAR(20) DEFAULT 'kg',
  location VARCHAR(100) NOT NULL,
  area_tag VARCHAR(50) DEFAULT 'East UP',
  reporter_name VARCHAR(100) DEFAULT 'Community Member',
  is_verified BOOLEAN DEFAULT TRUE,
  trend VARCHAR(10) DEFAULT 'up',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_intel_item ON community_intelligence(item);
CREATE INDEX idx_intel_created ON community_intelligence(created_at DESC);

-- Initial Mock Seed Data
INSERT INTO community_intelligence (item, price, unit, location, area_tag, reporter_name) VALUES
('Tamatar (Tomato)', 28.00, 'kg', 'Azamgarh Mandi', 'East UP', 'Ramesh (Farmer)'),
('Pyaaz (Onion)', 34.00, 'kg', 'Gorakhpur Market', 'East UP', 'Sunil (Vendor)'),
('Aloo (Potato)', 18.00, 'kg', 'Varanasi Mandi', 'East UP', 'Vijay (Vendor)'),
('Gehun (Wheat)', 24.00, 'kg', 'Jaunpur Mandi', 'East UP', 'Amit (Farmer)');
