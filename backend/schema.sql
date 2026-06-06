-- PostgreSQL Schema for Paper Plane Gift Delivery Tracker

CREATE TABLE IF NOT EXISTS delivery_agents (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(50) DEFAULT 'agent', -- 'admin' or 'agent'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dispatches (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(100) UNIQUE NOT NULL,
    recipient_name VARCHAR(255) NOT NULL,
    delivery_address TEXT NOT NULL,
    agent_id INTEGER REFERENCES delivery_agents(id) ON DELETE SET NULL,
    scheduled_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Created', -- 'Created', 'Picked Up', 'Out For Delivery', 'Delivered', 'Failed'
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS status_updates (
    id SERIAL PRIMARY KEY,
    dispatch_id INTEGER REFERENCES dispatches(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    notes TEXT,
    updated_by INTEGER REFERENCES delivery_agents(id) ON DELETE SET NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS proof_of_delivery (
    id SERIAL PRIMARY KEY,
    dispatch_id INTEGER REFERENCES dispatches(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS failed_attempts (
    id SERIAL PRIMARY KEY,
    dispatch_id INTEGER REFERENCES dispatches(id) ON DELETE CASCADE,
    reason VARCHAR(100) NOT NULL, -- 'Address Not Found', 'Recipient Unavailable', 'Rejected', 'Other'
    notes TEXT,
    retry_date DATE,
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
