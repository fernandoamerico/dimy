package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/fernandoamerico/dimy/db"
	"github.com/fernandoamerico/dimy/version"
)

// GetSystemVersionHandler returns the current CMS version
func GetSystemVersionHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"version": version.Version,
	})
}

type SystemStatus struct {
	Update struct {
		HasUpdate      bool   `json:"hasUpdate"`
		CurrentVersion string `json:"currentVersion"`
		LatestVersion  string `json:"latestVersion"`
		ReleaseUrl     string `json:"releaseUrl"`
	} `json:"update"`
	Database struct {
		Type      string `json:"type"`
		Connected bool   `json:"connected"`
		Label     string `json:"label"`
	} `json:"database"`
	Storage struct {
		Type       string `json:"type"`
		Configured bool   `json:"configured"`
		Label      string `json:"label"`
	} `json:"storage"`
}

// GetSystemStatusHandler returns the overall status of the system for the dashboard
func GetSystemStatusHandler(w http.ResponseWriter, r *http.Request) {
	var status SystemStatus

	// 1. Check Database
	isSupabase := strings.HasPrefix(os.Getenv("DATABASE_URL"), "postgres")
	if isSupabase {
		status.Database.Type = "postgres"
		status.Database.Label = "Supabase (PostgreSQL)"
	} else {
		status.Database.Type = "sqlite"
		status.Database.Label = "SQLite Local"
	}
	// Ping database
	err := db.Instance.Ping()
	status.Database.Connected = err == nil

	// 2. Check Storage
	var r2Enabled, supabaseEnabled bool
	db.Instance.QueryRow("SELECT enabled FROM extensions WHERE id = 'cloudflare_r2'").Scan(&r2Enabled)
	db.Instance.QueryRow("SELECT enabled FROM extensions WHERE id = 'supabase_storage'").Scan(&supabaseEnabled)

	if r2Enabled {
		status.Storage.Type = "cloudflare_r2"
		status.Storage.Label = "Cloudflare R2"
		status.Storage.Configured = true
	} else if supabaseEnabled {
		status.Storage.Type = "supabase_storage"
		status.Storage.Label = "Supabase Storage"
		status.Storage.Configured = true
	} else {
		status.Storage.Type = "local"
		status.Storage.Label = "Local"
		status.Storage.Configured = false
	}

	// 3. Check Updates (GitHub)
	status.Update.CurrentVersion = version.Version
	url := fmt.Sprintf("https://api.github.com/repos/fernandoamerico/dimy/releases/latest")
	resp, err := http.Get(url)
	if err == nil && resp.StatusCode == http.StatusOK {
		var release GitHubRelease
		if err := json.NewDecoder(resp.Body).Decode(&release); err == nil {
			status.Update.LatestVersion = release.TagName
			status.Update.ReleaseUrl = release.HTMLURL
			// Basic comparison, assumes format vX.Y.Z
			if release.TagName != "" && release.TagName != status.Update.CurrentVersion {
				status.Update.HasUpdate = true
			}
		}
		resp.Body.Close()
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(status)
}
