package db

import (
	"database/sql"
	"fmt"
)

// RunMigrations executes initial table creation statements.
func RunMigrations(db *sql.DB, driver string) error {
	// For simplicity, we use SQLite syntax by default.
	// In a real application, you'd want to branch depending on whether it's SQLite or Postgres.
	// For now, we will write standard SQL that works reasonably well on both.
	// Note: Postgres uses UUID or VARCHAR instead of TEXT for IDs in typical setups,
	// but TEXT works perfectly fine in Postgres as well.
	
	var dataColumnType = "TEXT" // fallback for SQLite
	if driver == "pgx" {
		dataColumnType = "JSONB"
	}

	queries := []string{
		`CREATE TABLE IF NOT EXISTS users (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			email TEXT UNIQUE NOT NULL,
			password TEXT NOT NULL,
			role TEXT DEFAULT 'admin',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);`,
		`CREATE TABLE IF NOT EXISTS system_configs (
			key TEXT PRIMARY KEY,
			value TEXT NOT NULL,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);`,
		`CREATE TABLE IF NOT EXISTS api_keys (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			key TEXT UNIQUE NOT NULL,
			role TEXT DEFAULT 'read',
			active BOOLEAN DEFAULT true,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);`,
		`CREATE TABLE IF NOT EXISTS schema_collections (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			slug TEXT UNIQUE NOT NULL,
			icon TEXT,
			metadata TEXT,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);`,
		`CREATE TABLE IF NOT EXISTS schema_fields (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			label TEXT NOT NULL,
			type TEXT NOT NULL,
			required BOOLEAN DEFAULT false,
			collection_id TEXT NOT NULL,
			order_int INTEGER DEFAULT 0,
			relation_to TEXT,
			FOREIGN KEY(collection_id) REFERENCES schema_collections(id) ON DELETE CASCADE
		);`,
		fmt.Sprintf(`CREATE TABLE IF NOT EXISTS documents (
			id TEXT PRIMARY KEY,
			collection_id TEXT NOT NULL,
			data %s NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY(collection_id) REFERENCES schema_collections(id) ON DELETE CASCADE
		);`, dataColumnType),
		`CREATE TABLE IF NOT EXISTS extensions (
			id TEXT PRIMARY KEY,
			enabled BOOLEAN DEFAULT true,
			installed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);`,
		`CREATE TABLE IF NOT EXISTS media_files (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			filename TEXT UNIQUE NOT NULL,
			url TEXT NOT NULL,
			size INTEGER NOT NULL,
			mime_type TEXT NOT NULL,
			dimensions TEXT,
			alt TEXT DEFAULT '',
			comment TEXT DEFAULT '',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);`,
	}

	for _, q := range queries {
		if _, err := db.Exec(q); err != nil {
			return fmt.Errorf("migration failed for query: %s | error: %w", q, err)
		}
	}
	
	// Add column metadata for existing tables (ignore error if column already exists)
	db.Exec(`ALTER TABLE schema_collections ADD COLUMN metadata TEXT;`)

	// Pre-install default modules
	preInstalledModules := []string{
		"business_info",
		"supabase_config",
		"schema_sliders",
		"core_publications",
		"core_pages",
	}

	for _, moduleID := range preInstalledModules {
		// Use ON CONFLICT DO NOTHING to support both PostgreSQL and SQLite 3.24+
		query := fmt.Sprintf(`INSERT INTO extensions (id, enabled) VALUES ('%s', true) ON CONFLICT(id) DO NOTHING;`, moduleID)
		db.Exec(query)
	}

	return nil
}
