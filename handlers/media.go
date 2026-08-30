package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/fernandoamerico/dimy/db"
)

type MediaFile struct {
	ID         string `json:"id"`
	Name       string `json:"name"`
	Filename   string `json:"filename"`
	URL        string `json:"url"`
	Size       int64  `json:"size"`
	MimeType   string `json:"mime_type"`
	Dimensions string `json:"dimensions"`
	Alt        string `json:"alt"`
	Comment    string `json:"comment"`
	CreatedAt  string `json:"created_at"`
	UpdatedAt  string `json:"updated_at"`
}

func ListMediaHandler(w http.ResponseWriter, r *http.Request) {
	search := r.URL.Query().Get("search")
	mimeType := r.URL.Query().Get("mime_type")
	
	pageStr := r.URL.Query().Get("page")
	limitStr := r.URL.Query().Get("limit")

	page := 1
	limit := 50

	if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
		page = p
	}
	if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 100 {
		limit = l
	}

	offset := (page - 1) * limit

	query := "SELECT id, name, filename, url, size, mime_type, dimensions, alt, comment, created_at, updated_at FROM media_files WHERE 1=1"
	var args []interface{}
	paramIndex := 1

	if search != "" {
		query += fmt.Sprintf(" AND (LOWER(name) LIKE LOWER($%d) OR LOWER(filename) LIKE LOWER($%d))", paramIndex, paramIndex+1)
		likeStr := "%" + search + "%"
		args = append(args, likeStr, likeStr)
		paramIndex += 2
	}

	if mimeType != "" && mimeType != "all" {
		if mimeType == "image" {
			query += " AND mime_type LIKE 'image/%'"
		} else if mimeType == "document" {
			query += " AND (mime_type LIKE 'application/pdf' OR mime_type LIKE 'application/msword' OR mime_type LIKE 'application/vnd.%')"
		} else {
			query += fmt.Sprintf(" AND mime_type = $%d", paramIndex)
			args = append(args, mimeType)
			paramIndex++
		}
	}

	query += fmt.Sprintf(" ORDER BY created_at DESC LIMIT $%d OFFSET $%d", paramIndex, paramIndex+1)
	args = append(args, limit, offset)

	rows, err := db.Instance.Query(query, args...)
	if err != nil {
		http.Error(w, "Failed to query media", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var medias []MediaFile
	for rows.Next() {
		var m MediaFile
		if err := rows.Scan(&m.ID, &m.Name, &m.Filename, &m.URL, &m.Size, &m.MimeType, &m.Dimensions, &m.Alt, &m.Comment, &m.CreatedAt, &m.UpdatedAt); err == nil {
			medias = append(medias, m)
		}
	}

	if medias == nil {
		medias = []MediaFile{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(medias)
}

func GetMediaStatsHandler(w http.ResponseWriter, r *http.Request) {
	var totalCount int
	var totalSize int64

	err := db.Instance.QueryRow("SELECT COUNT(id), COALESCE(SUM(size), 0) FROM media_files").Scan(&totalCount, &totalSize)
	if err != nil {
		http.Error(w, "Failed to get stats", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"count": totalCount,
		"size":  totalSize,
	})
}

func UpdateMediaHandler(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		http.Error(w, "ID required", http.StatusBadRequest)
		return
	}

	var req struct {
		Alt     string `json:"alt"`
		Comment string `json:"comment"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	_, err := db.Instance.Exec("UPDATE media_files SET alt = $1, comment = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3", req.Alt, req.Comment, id)
	if err != nil {
		http.Error(w, "Failed to update media", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"success": true})
}

func DeleteMediaHandler(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		http.Error(w, "ID required", http.StatusBadRequest)
		return
	}

	var url string
	err := db.Instance.QueryRow("SELECT url FROM media_files WHERE id = $1", id).Scan(&url)
	if err == nil {
		if strings.HasPrefix(url, "/uploads/") {
			filename := strings.TrimPrefix(url, "/uploads/")
			os.Remove(filepath.Join("./frontend/public/uploads", filename))
		}
		// Notice: R2 and Supabase object physical deletion omitted for simplicity 
	}

	_, err = db.Instance.Exec("DELETE FROM media_files WHERE id = $1", id)
	if err != nil {
		http.Error(w, "Failed to delete media", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"success": true})
}
