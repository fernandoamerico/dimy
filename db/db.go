package db

import (
	"database/sql"
	"fmt"
	"os"
	"strings"
	"sync"
)

var (
	Instance *sql.DB
	once     sync.Once
)

// Connect initializes the database connection.
func Connect() error {
	var err error
	once.Do(func() {
		dbURL := os.Getenv("DATABASE_URL")
		if dbURL == "" {
			dbURL = "file:./dev.db?_journal=WAL&_busy_timeout=5000"
		}

		var driverName string
		// Basic heuristic: if it starts with postgres, use pgx
		if strings.HasPrefix(dbURL, "postgres://") || strings.HasPrefix(dbURL, "postgresql://") {
			driverName = "pgx"
		} else {
			driverName = "sqlite3"
			// Ensure WAL mode and busy timeout are set for SQLite by default
			if !strings.Contains(dbURL, "?") && strings.HasPrefix(dbURL, "file:") {
				dbURL += "?_journal=WAL&_busy_timeout=5000"
			}
		}

		Instance, err = sql.Open(driverName, dbURL)
		if err != nil {
			err = fmt.Errorf("failed to open database: %w", err)
			return
		}

		if errPing := Instance.Ping(); errPing != nil {
			err = fmt.Errorf("failed to ping database: %w", errPing)
			return
		}

		// Run auto migrations
		err = RunMigrations(Instance, driverName)
	})

	return err
}
