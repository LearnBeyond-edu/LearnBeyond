-- LearnBeyond Core Schema
-- Run this in your Neon SQL Editor to create the tables!

CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO roles (role_name) VALUES 
('Platform Admin'), ('Institution Admin'), ('Teacher'), ('Student'), ('Parent'), ('Therapist')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    subscription_plan VARCHAR(50) DEFAULT 'Starter'
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INTEGER REFERENCES roles(id),
    institution_id UUID REFERENCES institutions(id),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    app_state JSONB DEFAULT '{}'::jsonb,
    laura_state JSONB DEFAULT '{}'::jsonb,
    bio TEXT,
    phone VARCHAR(20),
    address TEXT,
    cover_image TEXT,
    profile_photo TEXT
);

CREATE TABLE IF NOT EXISTS student_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    grade_level VARCHAR(50),
    learning_style VARCHAR(50),
    points INTEGER DEFAULT 0,
    institution_id UUID REFERENCES institutions(id)
);

CREATE TABLE IF NOT EXISTS teacher_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    department VARCHAR(100),
    institution_id UUID REFERENCES institutions(id)
);
