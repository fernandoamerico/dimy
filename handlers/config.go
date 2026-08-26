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

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"projectName": projectName,
	})
}
