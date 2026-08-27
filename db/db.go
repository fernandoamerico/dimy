package db

import (
	"database/sql"
	"fmt"
	"os"
	"strings"
	"sync"

	"github.com/joho/godotenv"
	_ "github.com/jackc/pgx/v5/stdlib"
	_ "modernc.org/sqlite"
)

var (
	Instance *sql.DB
	once     sync.Once
)

// Connect initializes the database connection.
func Connect() error {
	var err error
	once.Do(func() {
		err = connectInternal()
	})
	return err
}

func connectInternal() error {
	godotenv.Load() // Load .env file if it exists
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "file:./dev.db?_journal=WAL&_busy_timeout=5000"
	}

	var driverName string
	// Basic heuristic: if it starts with postgres, use pgx
	if strings.HasPrefix(dbURL, "postgres://") || strings.HasPrefix(dbURL, "postgresql://") {
		driverName = "pgx"
	} else {
		driverName = "sqlite"
		// Ensure WAL mode and busy timeout are set for SQLite by default
		if !strings.Contains(dbURL, "?") && strings.HasPrefix(dbURL, "file:") {
			dbURL += "?_journal=WAL&_busy_timeout=5000"
		}
	}

	var err error
	Instance, err = sql.Open(driverName, dbURL)
	if err != nil {
		return fmt.Errorf("failed to open database: %w", err)
	}

	if driverName == "sqlite" {
		_, err = Instance.Exec("PRAGMA foreign_keys = ON;")
		if err != nil {
			return fmt.Errorf("failed to enable foreign keys: %w", err)
		}
	}

	if errPing := Instance.Ping(); errPing != nil {
		return fmt.Errorf("failed to ping database: %w", errPing)
	}

	// Run auto migrations
	err = RunMigrations(Instance, driverName)
	return err
}

// Reconnect closes the current connection, reloads environment variables, and reconnects.
// This is useful during setup when the DATABASE_URL changes.
func Reconnect() error {
	if Instance != nil {
		Instance.Close()
	}
	// We don't use once.Do here because we explicitly want to reconnect
	return connectInternal()
}
