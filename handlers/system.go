package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/fernandoamerico/dimy/version"
)

// GetSystemVersionHandler returns the current CMS version
func GetSystemVersionHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"version": version.Version,
	})
}
