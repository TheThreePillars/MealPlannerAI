CREATE TABLE meals (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    ingredients TEXT,
    family_preference TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
