package handlers

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"time"

	"github.com/fernandoamerico/dimy/db"
	"github.com/google/uuid"
)

type ApiKey struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Key       string    `json:"key,omitempty"` // Retornado apenas na criação
	Role      string    `json:"role"`
	Active    bool      `json:"active"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// GetApiKeysHandler lista todas as chaves de API (sem revelar a chave secreta completa por segurança)
func GetApiKeysHandler(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Instance.Query("SELECT id, name, role, active, created_at, updated_at FROM api_keys ORDER BY created_at DESC")
	if err != nil {
		http.Error(w, "Erro ao buscar chaves de API", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var keys []ApiKey
	for rows.Next() {
		var k ApiKey
		var createdAt, updatedAt string
		if err := rows.Scan(&k.ID, &k.Name, &k.Role, &k.Active, &createdAt, &updatedAt); err != nil {
			continue
		}
		
		t, _ := time.Parse("2006-01-02 15:04:05", createdAt)
		k.CreatedAt = t
		t2, _ := time.Parse("2006-01-02 15:04:05", updatedAt)
		k.UpdatedAt = t2
		
		keys = append(keys, k)
	}

	if keys == nil {
		keys = []ApiKey{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(keys)
}

type CreateApiKeyPayload struct {
	Name string `json:"name"`
}

func generateSecureToken() string {
	bytes := make([]byte, 24) // 48 hex chars
	if _, err := rand.Read(bytes); err != nil {
		panic(err)
	}
	return "dimy_sk_" + hex.EncodeToString(bytes)
}

// CreateApiKeyHandler cria uma nova chave de API
func CreateApiKeyHandler(w http.ResponseWriter, r *http.Request) {
	var payload CreateApiKeyPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil || payload.Name == "" {
		http.Error(w, "Nome é obrigatório", http.StatusBadRequest)
		return
	}

	id := uuid.NewString()
	secretKey := generateSecureToken()

	_, err := db.Instance.Exec(
		"INSERT INTO api_keys (id, name, key, role, active, created_at, updated_at) VALUES ($1, $2, $3, 'read', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
		id, payload.Name, secretKey,
	)
	if err != nil {
		http.Error(w, "Erro ao criar chave de API", http.StatusInternalServerError)
		return
	}

	// Na criação, devolvemos o objeto contendo o 'Key' para o usuário copiar.
	resp := ApiKey{
		ID:     id,
		Name:   payload.Name,
		Key:    secretKey,
		Role:   "read",
		Active: true,
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}

// DeleteApiKeyHandler remove uma chave de API (revogação)
func DeleteApiKeyHandler(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		http.Error(w, "ID é obrigatório", http.StatusBadRequest)
		return
	}

	_, err := db.Instance.Exec("DELETE FROM api_keys WHERE id = $1", id)
	if err != nil {
		http.Error(w, "Erro ao revogar chave", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"success": true})
}
