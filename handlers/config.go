package handlers

import (
	"encoding/json"
	"net/http"
	"os"
	"strings"

	"github.com/fernandoamerico/dimy/db"
)

// GetConfigHandler returns public system configuration (like projectName)
func GetConfigHandler(w http.ResponseWriter, r *http.Request) {
	var projectName string
	err := db.Instance.QueryRow("SELECT value FROM system_configs WHERE key = 'projectName'").Scan(&projectName)
	
	if err != nil {
		// If not found, probably not setup yet
		projectName = "Dimy"
	}

	// Check if system is set up (at least 1 user exists)
	var count int
	err = db.Instance.QueryRow("SELECT COUNT(*) FROM users").Scan(&count)
	isSetup := err == nil && count > 0

	// Check if DATABASE_URL starts with postgres (Supabase connection)
	isSupabase := strings.HasPrefix(os.Getenv("DATABASE_URL"), "postgres")

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"projectName": projectName,
		"isSetup":     isSetup,
		"isSupabase":  isSupabase,
	})
}

// GetSystemConfigHandler returns a specific config by key
func GetSystemConfigHandler(w http.ResponseWriter, r *http.Request) {
	key := r.URL.Query().Get("key")
	if key == "" {
		http.Error(w, "Key query param is required", http.StatusBadRequest)
		return
	}

	var value string
	err := db.Instance.QueryRow("SELECT value FROM system_configs WHERE key = $1", key).Scan(&value)
	if err != nil {
		http.Error(w, "Config not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"value": value})
}

type SetConfigPayload struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}

// SetSystemConfigHandler sets or updates a config
func SetSystemConfigHandler(w http.ResponseWriter, r *http.Request) {
	var payload SetConfigPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	if payload.Key == "" {
		http.Error(w, "Key is required", http.StatusBadRequest)
		return
	}

	_, err := db.Instance.Exec(
		"INSERT INTO system_configs (key, value, updated_at) VALUES ($1, $2, CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP",
		payload.Key, payload.Value,
	)

	if err != nil {
		http.Error(w, "Failed to save config", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{"success": true})
}

// GetBusinessInfoHandler returns all system configs that start with 'business_'
func GetBusinessInfoHandler(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Instance.Query("SELECT key, value FROM system_configs WHERE key LIKE 'business_%'")
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	businessInfo := make(map[string]string)
	for rows.Next() {
		var key, value string
		if err := rows.Scan(&key, &value); err == nil {
			businessInfo[key] = value
		}
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(businessInfo)
}

// TestDatabaseConnectionHandler tests the current database connection
func TestDatabaseConnectionHandler(w http.ResponseWriter, r *http.Request) {
	// Check if running on Supabase (PostgreSQL)
	isSupabase := strings.HasPrefix(os.Getenv("DATABASE_URL"), "postgres")

	if !isSupabase {
		http.Error(w, "O sistema ainda está rodando com SQLite local. Configure a variável DATABASE_URL primeiro.", http.StatusBadRequest)
		return
	}

	// Ping the database to ensure it's alive
	err := db.Instance.Ping()
	if err != nil {
		http.Error(w, "Erro ao conectar com o banco de dados: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Conexão com Supabase bem-sucedida!"))
}
