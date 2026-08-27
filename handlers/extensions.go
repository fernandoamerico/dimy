package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"time"

	"github.com/fernandoamerico/dimy/db"
	"github.com/fernandoamerico/dimy/models"
	"golang.org/x/crypto/bcrypt"
)

// GetExtensionsHandler returns all installed extensions
func GetExtensionsHandler(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Instance.Query("SELECT id, enabled, installed_at, updated_at FROM extensions")
	if err != nil {
		http.Error(w, "Erro ao buscar extensões: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var extensions []models.Extension
	if extensions == nil {
		extensions = []models.Extension{}
	}
	for rows.Next() {
		var ext models.Extension
		var installedAt, updatedAt string
		if err := rows.Scan(&ext.ID, &ext.Enabled, &installedAt, &updatedAt); err != nil {
			continue
		}

		t, _ := time.Parse("2006-01-02 15:04:05", installedAt)
		ext.InstalledAt = t
		t2, _ := time.Parse("2006-01-02 15:04:05", updatedAt)
		ext.UpdatedAt = t2

		extensions = append(extensions, ext)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(extensions)
}

type InstallExtensionPayload struct {
	ID string `json:"id"`
	// We might receive schema payload for dynamic creation in the future
}

// InstallExtensionHandler handles the installation of an extension
func InstallExtensionHandler(w http.ResponseWriter, r *http.Request) {
	var payload InstallExtensionPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}

	if payload.ID == "" {
		http.Error(w, "ID da extensão é obrigatório", http.StatusBadRequest)
		return
	}

	// Inserir a extensão
	_, err := db.Instance.Exec(
		"INSERT INTO extensions (id, enabled, installed_at, updated_at) VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
		payload.ID, false,
	)

	if err != nil {
		// Verify if it's unique constraint violation
		if err.Error() == "UNIQUE constraint failed: extensions.id" {
			http.Error(w, "Extensão já está instalada", http.StatusConflict)
			return
		}
		http.Error(w, "Erro ao instalar extensão: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{"success": true})
}

type ToggleExtensionPayload struct {
	Enabled bool `json:"enabled"`
}

// ToggleExtensionHandler enables or disables an extension
func ToggleExtensionHandler(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		http.Error(w, "ID é obrigatório", http.StatusBadRequest)
		return
	}

	var payload ToggleExtensionPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}

	res, err := db.Instance.Exec(
		"UPDATE extensions SET enabled = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
		payload.Enabled, id,
	)
	if err != nil {
		http.Error(w, "Erro ao atualizar extensão", http.StatusInternalServerError)
		return
	}

	affected, _ := res.RowsAffected()
	if affected == 0 {
		http.Error(w, "Extensão não encontrada", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{"success": true})
}

// UninstallExtensionHandler removes an extension from the DB
func UninstallExtensionHandler(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		http.Error(w, "ID é obrigatório", http.StatusBadRequest)
		return
	}

	var payload struct {
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}

	// Verify Admin Password
	var adminPassword string
	err := db.Instance.QueryRow("SELECT password FROM users WHERE role = 'admin' LIMIT 1").Scan(&adminPassword)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Administrador não encontrado", http.StatusInternalServerError)
		} else {
			http.Error(w, "Erro ao buscar administrador", http.StatusInternalServerError)
		}
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(adminPassword), []byte(payload.Password))
	if err != nil {
		http.Error(w, "Senha incorreta", http.StatusUnauthorized)
		return
	}

	// Delete extension
	_, err = db.Instance.Exec("DELETE FROM extensions WHERE id = $1", id)
	if err != nil {
		http.Error(w, "Erro ao remover extensão", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{"success": true})
}
