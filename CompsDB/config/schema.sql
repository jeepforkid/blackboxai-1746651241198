-- إنشاء جدول المشرفات
CREATE TABLE IF NOT EXISTS supervisors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    region VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- إنشاء جدول المتسابقات
CREATE TABLE IF NOT EXISTS contestants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    age INTEGER,
    birth_date DATE,
    address TEXT,
    supervisor_id INTEGER REFERENCES supervisors(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- إنشاء جدول المسابقات
CREATE TABLE IF NOT EXISTS competitions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    competition_date DATE NOT NULL,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- إنشاء جدول الدرجات
CREATE TABLE IF NOT EXISTS scores (
    id SERIAL PRIMARY KEY,
    contestant_id INTEGER REFERENCES contestants(id) ON DELETE CASCADE,
    competition_id INTEGER REFERENCES competitions(id) ON DELETE CASCADE,
    supervisor_id INTEGER REFERENCES supervisors(id) ON DELETE SET NULL,
    score DECIMAL(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
    entry_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(contestant_id, competition_id)
);

-- إنشاء دالة لتحديث timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- إنشاء Triggers لتحديث updated_at
CREATE TRIGGER update_supervisors_updated_at
    BEFORE UPDATE ON supervisors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contestants_updated_at
    BEFORE UPDATE ON contestants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_competitions_updated_at
    BEFORE UPDATE ON competitions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scores_updated_at
    BEFORE UPDATE ON scores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- إنشاء Indexes لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_contestants_supervisor ON contestants(supervisor_id);
CREATE INDEX IF NOT EXISTS idx_scores_contestant ON scores(contestant_id);
CREATE INDEX IF NOT EXISTS idx_scores_competition ON scores(competition_id);
CREATE INDEX IF NOT EXISTS idx_scores_supervisor ON scores(supervisor_id);
CREATE INDEX IF NOT EXISTS idx_contestants_name ON contestants(name);
CREATE INDEX IF NOT EXISTS idx_competitions_date ON competitions(competition_date);
