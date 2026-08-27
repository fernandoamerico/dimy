package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
)

const repoName = "fernandoamerico/dimy"

type GitHubRelease struct {
	TagName     string `json:"tag_name"`
	Body        string `json:"body"`
	HTMLURL     string `json:"html_url"`
	PublishedAt string `json:"published_at"`
}

// CheckUpdateHandler fetches the latest release info from GitHub
func CheckUpdateHandler(w http.ResponseWriter, r *http.Request) {
	url := fmt.Sprintf("https://api.github.com/repos/%s/releases/latest", repoName)
	resp, err := http.Get(url)
	if err != nil {
		http.Error(w, "Failed to check for updates", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		http.Error(w, "GitHub API returned non-200 status", http.StatusBadGateway)
		return
	}

	var release GitHubRelease
	if err := json.NewDecoder(resp.Body).Decode(&release); err != nil {
		http.Error(w, "Failed to decode GitHub response", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"latest_version": release.TagName,
		"changelog":      release.Body,
		"release_url":    release.HTMLURL,
		"published_at":   release.PublishedAt,
	})
}
