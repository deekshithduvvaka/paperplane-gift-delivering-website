-- SQLite Schema for Paper Plane Gift Delivery Tracker

CREATE TABLE IF NOT EXISTS delivery_agents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    phone TEXT,
    role TEXT DEFAULT 'agent', -- 'admin' or 'agent'
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dispatches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT UNIQUE NOT NULL,
    recipient_name TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    agent_id INTEGER REFERENCES delivery_agents(id) ON DELETE SET NULL,
    scheduled_date TEXT NOT NULL,
    status TEXT DEFAULT 'Created', -- 'Created', 'Picked Up', 'Out For Delivery', 'Delivered', 'Failed'
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS status_updates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dispatch_id INTEGER REFERENCES dispatches(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    notes TEXT,
    updated_by INTEGER REFERENCES delivery_agents(id) ON DELETE SET NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS proof_of_delivery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dispatch_id INTEGER REFERENCES dispatches(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS failed_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dispatch_id INTEGER REFERENCES dispatches(id) ON DELETE CASCADE,
    reason TEXT NOT NULL, -- 'Address Not Found', 'Recipient Unavailable', 'Rejected', 'Other'
    notes TEXT,
    retry_date TEXT,
    logged_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
