package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/fernandoamerico/dimy/db"
	"github.com/fernandoamerico/dimy/models"
	"github.com/google/uuid"
)

// GetCollectionBySlugHandler returns a collection with fields by its slug
func GetCollectionBySlugHandler(w http.ResponseWriter, r *http.Request) {
	slug := r.PathValue("slug")
	if slug == "" {
		http.Error(w, "Slug é obrigatório", http.StatusBadRequest)
		return
	}

	var col models.SchemaCollection
	var icon sql.NullString
	var metadata sql.NullString
	var createdAt, updatedAt string

	err := db.Instance.QueryRow("SELECT id, name, slug, icon, metadata, created_at, updated_at FROM schema_collections WHERE slug = $1", slug).
		Scan(&col.ID, &col.Name, &col.Slug, &icon, &metadata, &createdAt, &updatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Coleção não encontrada", http.StatusNotFound)
		} else {
			http.Error(w, "Erro ao buscar coleção", http.StatusInternalServerError)
		}
		return
	}

	if icon.Valid {
		col.Icon = &icon.String
	}
	if metadata.Valid {
		col.Metadata = &metadata.String
	}
	
	status, msg := checkCollectionAccess(r, metadata)
	if status != 0 {
		http.Error(w, msg, status)
		return
	}
	t, _ := time.Parse("2006-01-02 15:04:05", createdAt)
	col.CreatedAt = t
	t2, _ := time.Parse("2006-01-02 15:04:05", updatedAt)
	col.UpdatedAt = t2

	col.Fields = fetchSchemaFields(col.ID)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(col)
}

// GetDocumentsHandler returns documents of a collection
func GetDocumentsHandler(w http.ResponseWriter, r *http.Request) {
	collectionID := r.URL.Query().Get("collectionId")
	if collectionID == "" {
		http.Error(w, "collectionId é obrigatório", http.StatusBadRequest)
		return
	}

	var metadata sql.NullString
	err := db.Instance.QueryRow("SELECT metadata FROM schema_collections WHERE id = $1", collectionID).Scan(&metadata)
	if err != nil {
		http.Error(w, "Coleção não encontrada", http.StatusNotFound)
		return
	}

	status, msg := checkCollectionAccess(r, metadata)
	if status != 0 {
		http.Error(w, msg, status)
		return
	}

	limitStr := r.URL.Query().Get("limit")
	pageStr := r.URL.Query().Get("page")

	query := "SELECT id, collection_id, data, created_at, updated_at FROM documents WHERE collection_id = $1 ORDER BY created_at DESC"
	args := []interface{}{collectionID}

	if limitStr != "" {
		limit, _ := strconv.Atoi(limitStr)
		if limit > 0 {
			if pageStr != "" {
				page, _ := strconv.Atoi(pageStr)
				if page > 0 {
					offset := (page - 1) * limit
					query += " LIMIT $2 OFFSET $3"
					args = append(args, limit, offset)
				} else {
					query += " LIMIT $2"
					args = append(args, limit)
				}
			} else {
				query += " LIMIT $2"
				args = append(args, limit)
			}
		}
	}

	rows, err := db.Instance.Query(query, args...)
	if err != nil {
		http.Error(w, "Erro ao buscar documentos", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var documents []map[string]interface{}
	for rows.Next() {
		var doc models.Document
		var createdAt, updatedAt string
		if err := rows.Scan(&doc.ID, &doc.CollectionID, &doc.Data, &createdAt, &updatedAt); err != nil {
			continue
		}

		var parsedData map[string]interface{}
		json.Unmarshal([]byte(doc.Data), &parsedData)

		docMap := map[string]interface{}{
			"id":           doc.ID,
			"collectionId": doc.CollectionID,
			"createdAt":    createdAt,
			"updatedAt":    updatedAt,
			"data":         parsedData,
		}
		documents = append(documents, docMap)
	}

	if documents == nil {
		documents = []map[string]interface{}{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(documents)
}

// GetDocumentHandler returns a single document by ID
func GetDocumentHandler(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		http.Error(w, "ID é obrigatório", http.StatusBadRequest)
		return
	}

	var doc models.Document
	var createdAt, updatedAt string
	var collectionMetadata sql.NullString

	err := db.Instance.QueryRow("SELECT d.id, d.collection_id, d.data, d.created_at, d.updated_at, c.metadata FROM documents d JOIN schema_collections c ON d.collection_id = c.id WHERE d.id = $1", id).
		Scan(&doc.ID, &doc.CollectionID, &doc.Data, &createdAt, &updatedAt, &collectionMetadata)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Documento não encontrado", http.StatusNotFound)
		} else {
			http.Error(w, "Erro ao buscar documento", http.StatusInternalServerError)
		}
		return
	}

	status, msg := checkCollectionAccess(r, collectionMetadata)
	if status != 0 {
		http.Error(w, msg, status)
		return
	}

	var parsedData map[string]interface{}
	json.Unmarshal([]byte(doc.Data), &parsedData)

	docMap := map[string]interface{}{
		"id":           doc.ID,
		"collectionId": doc.CollectionID,
		"createdAt":    createdAt,
		"updatedAt":    updatedAt,
		"data":         parsedData,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(docMap)
}

type SaveDocumentPayload struct {
	CollectionID string                 `json:"collectionId"`
	Data         map[string]interface{} `json:"data"`
}

// CreateDocumentHandler creates a new document
func CreateDocumentHandler(w http.ResponseWriter, r *http.Request) {
	var payload SaveDocumentPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}

	if payload.CollectionID == "" {
		http.Error(w, "collectionId é obrigatório", http.StatusBadRequest)
		return
	}

	dataBytes, _ := json.Marshal(payload.Data)
	docID := uuid.NewString()

	_, err := db.Instance.Exec(
		"INSERT INTO documents (id, collection_id, data, created_at, updated_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
		docID, payload.CollectionID, string(dataBytes),
	)
	if err != nil {
		http.Error(w, "Erro ao criar documento", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "id": docID})
}

// UpdateDocumentHandler updates a document
func UpdateDocumentHandler(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		http.Error(w, "ID é obrigatório", http.StatusBadRequest)
		return
	}

	var payload SaveDocumentPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}

	dataBytes, _ := json.Marshal(payload.Data)

	if payload.CollectionID != "" {
		_, err := db.Instance.Exec(
			"UPDATE documents SET collection_id = $1, data = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3",
			payload.CollectionID, string(dataBytes), id,
		)
		if err != nil {
			http.Error(w, "Erro ao atualizar documento com nova coleção", http.StatusInternalServerError)
			return
		}
	} else {
		_, err := db.Instance.Exec(
			"UPDATE documents SET data = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
			string(dataBytes), id,
		)
		if err != nil {
			http.Error(w, "Erro ao atualizar documento", http.StatusInternalServerError)
			return
		}
	}

	json.NewEncoder(w).Encode(map[string]interface{}{"success": true})
}

// DeleteDocumentHandler deletes a document
func DeleteDocumentHandler(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		http.Error(w, "ID é obrigatório", http.StatusBadRequest)
		return
	}

	_, err := db.Instance.Exec("DELETE FROM documents WHERE id = $1", id)
	if err != nil {
		http.Error(w, "Erro ao remover documento", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{"success": true})
}

func checkCollectionAccess(r *http.Request, metadata sql.NullString) (int, string) {
	if !metadata.Valid {
		if !IsAuthenticated(r) {
			return http.StatusUnauthorized, "Autenticação necessária"
		}
		return 0, ""
	}

	var meta struct {
		IsActive *bool `json:"is_active"`
		IsPublic *bool `json:"is_public"`
	}
	
	if err := json.Unmarshal([]byte(metadata.String), &meta); err == nil {
		if meta.IsActive != nil && !*meta.IsActive {
			return http.StatusNotFound, "Coleção desativada"
		}
		
		isPublic := false
		if meta.IsPublic != nil {
			isPublic = *meta.IsPublic
		}
		
		if !isPublic && !IsAuthenticated(r) {
			return http.StatusUnauthorized, "Autenticação necessária"
		}
	} else {
		// Falha no parse do metadata, assume privado por padrão
		if !IsAuthenticated(r) {
			return http.StatusUnauthorized, "Autenticação necessária"
		}
	}
	
	return 0, ""
}
