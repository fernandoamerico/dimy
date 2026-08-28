package handlers

import (
	"encoding/json"
	"net/http"

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

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"projectName": projectName,
		"isSetup":     isSetup,
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
