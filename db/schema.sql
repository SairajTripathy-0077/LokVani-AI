-- ================================================================================
-- LOKVANI AI - SUPABASE / POSTGRESQL DATABASE SCHEMA
-- Execute this SQL script in your Supabase SQL Editor to set up tables & RLS policies
-- ================================================================================

-- 1. Interactions Table (Voice Queries & AI Answers)
CREATE TABLE IF NOT EXISTS public.interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_name VARCHAR(100) DEFAULT 'Ramesh (Farmer)',
    user_location VARCHAR(100) DEFAULT 'Azamgarh, UP',
    query_text TEXT NOT NULL,
    intent VARCHAR(50) CHECK (intent IN ('scheme_query', 'price_query', 'general_advice', 'weather_advisory')),
    short_answer_hi TEXT NOT NULL,
    short_answer_en TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING_TRUST_REVIEW' CHECK (status IN ('PENDING_TRUST_REVIEW', 'VERIFIED_BY_TRUST_NODE', 'AUTO_VERIFIED')),
    needs_trust_node_review BOOLEAN DEFAULT false,
    risk_category VARCHAR(50) DEFAULT 'NONE',
    trust_reason TEXT,
    operator_notes TEXT,
    verified_by VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Community Intelligence Table (Crowdsourced Prices & Weather)
CREATE TABLE IF NOT EXISTS public.community_intelligence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_name VARCHAR(100) NOT NULL,
    price NUMERIC(10, 2) DEFAULT 0.00,
    unit VARCHAR(20) DEFAULT 'kg',
    location VARCHAR(100) NOT NULL,
    area_tag VARCHAR(50) DEFAULT 'East UP',
    reporter_name VARCHAR(100) DEFAULT 'Farmer Community Member',
    verified BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Trust Nodes Table (Kirana / CSC Operator Nodes)
CREATE TABLE IF NOT EXISTS public.trust_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_name VARCHAR(100) NOT NULL,
    operator_name VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    trust_score NUMERIC(5, 2) DEFAULT 99.40,
    verified_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert Initial Seed Data for Demo
INSERT INTO public.community_intelligence (item_name, price, unit, location, area_tag, reporter_name) VALUES
('Tamatar (Tomato)', 28.00, 'kg', 'Azamgarh Mandi', 'East UP', 'Ramesh Farmer'),
('Pyaaz (Onion)', 34.00, 'kg', 'Gorakhpur Market', 'East UP', 'Sunil Vendor'),
('Aloo (Potato)', 18.00, 'kg', 'Varanasi Mandi', 'East UP', 'Vijay Vendor'),
('Gehun (Wheat)', 24.00, 'kg', 'Jaunpur Mandi', 'East UP', 'Amit Farmer');

INSERT INTO public.trust_nodes (node_name, operator_name, location, trust_score, verified_count) VALUES
('Gupta Kirana & CSC Node', 'Ramesh Gupta', 'Azamgarh Village Center #402', 99.40, 42);

-- Enable Row Level Security (RLS) & Grant Access
ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_nodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for interactions" ON public.interactions FOR SELECT USING (true);
CREATE POLICY "Public insert access for interactions" ON public.interactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access for interactions" ON public.interactions FOR UPDATE USING (true);

CREATE POLICY "Public read access for community_intelligence" ON public.community_intelligence FOR SELECT USING (true);
CREATE POLICY "Public insert access for community_intelligence" ON public.community_intelligence FOR INSERT WITH CHECK (true);
