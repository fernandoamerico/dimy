package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"time"

	"github.com/fernandoamerico/dimy/db"
	"github.com/fernandoamerico/dimy/models"
	"github.com/google/uuid"
)

// GetCollectionsHandler returns all schema collections
func GetCollectionsHandler(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Instance.Query("SELECT id, name, slug, icon, metadata, created_at, updated_at FROM schema_collections ORDER BY created_at DESC")
	if err != nil {
		http.Error(w, "Erro ao buscar coleções: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var collections []models.SchemaCollection
	if collections == nil {
		collections = []models.SchemaCollection{}
	}
	for rows.Next() {
		var col models.SchemaCollection
		var icon sql.NullString
		var metadata sql.NullString
		var createdAt, updatedAt string

		if err := rows.Scan(&col.ID, &col.Name, &col.Slug, &icon, &metadata, &createdAt, &updatedAt); err != nil {
			continue
		}
		if icon.Valid {
			col.Icon = &icon.String
		}
		if metadata.Valid {
			col.Metadata = &metadata.String
		}

		t, _ := time.Parse("2006-01-02 15:04:05", createdAt)
		col.CreatedAt = t
		t2, _ := time.Parse("2006-01-02 15:04:05", updatedAt)
		col.UpdatedAt = t2

		// Fetch fields
		col.Fields = fetchSchemaFields(col.ID)
		collections = append(collections, col)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(collections)
}

// GetCollectionByIdHandler returns a single schema collection
func GetCollectionByIdHandler(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		http.Error(w, "ID é obrigatório", http.StatusBadRequest)
		return
	}

	var col models.SchemaCollection
	var icon sql.NullString
	var metadata sql.NullString
	var createdAt, updatedAt string

	err := db.Instance.QueryRow("SELECT id, name, slug, icon, metadata, created_at, updated_at FROM schema_collections WHERE id = $1", id).
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
	t, _ := time.Parse("2006-01-02 15:04:05", createdAt)
	col.CreatedAt = t
	t2, _ := time.Parse("2006-01-02 15:04:05", updatedAt)
	col.UpdatedAt = t2

	col.Fields = fetchSchemaFields(col.ID)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(col)
}

func fetchSchemaFields(collectionID string) []*models.SchemaField {
	var fields []*models.SchemaField
	rows, err := db.Instance.Query("SELECT id, name, label, type, required, collection_id, order_int, relation_to FROM schema_fields WHERE collection_id = $1 ORDER BY order_int ASC", collectionID)
	if err != nil {
		return fields
	}
	defer rows.Close()

	for rows.Next() {
		var f models.SchemaField
		var relationTo sql.NullString
		if err := rows.Scan(&f.ID, &f.Name, &f.Label, &f.Type, &f.Required, &f.CollectionID, &f.Order, &relationTo); err == nil {
			if relationTo.Valid {
				f.RelationTo = &relationTo.String
			}
			fields = append(fields, &f)
		}
	}
	return fields
}

type CreateCollectionPayload struct {
	Name     string                `json:"name"`
	Slug     string                `json:"slug"`
	Icon     *string               `json:"icon"`
	Metadata *string               `json:"metadata"`
	Fields   []*models.SchemaField `json:"fields"`
}

// CreateCollectionHandler creates a new schema collection and its fields
func CreateCollectionHandler(w http.ResponseWriter, r *http.Request) {
	var payload CreateCollectionPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}

	tx, err := db.Instance.Begin()
	if err != nil {
		http.Error(w, "Erro ao iniciar transação", http.StatusInternalServerError)
		return
	}
	defer tx.Rollback()

	colID := uuid.NewString()
	_, err = tx.Exec(
		"INSERT INTO schema_collections (id, name, slug, icon, metadata, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
		colID, payload.Name, payload.Slug, payload.Icon, payload.Metadata,
	)
	if err != nil {
		http.Error(w, "Erro ao criar coleção", http.StatusInternalServerError)
		return
	}

	for _, f := range payload.Fields {
		fID := uuid.NewString()
		_, err = tx.Exec(
			"INSERT INTO schema_fields (id, name, label, type, required, collection_id, order_int, relation_to) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
			fID, f.Name, f.Label, f.Type, f.Required, colID, f.Order, f.RelationTo,
		)
		if err != nil {
			http.Error(w, "Erro ao criar campos da coleção", http.StatusInternalServerError)
			return
		}
	}

	if err := tx.Commit(); err != nil {
		http.Error(w, "Erro ao confirmar transação", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "id": colID})
}

// UpdateCollectionHandler updates a collection and its fields
func UpdateCollectionHandler(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		http.Error(w, "ID é obrigatório", http.StatusBadRequest)
		return
	}

	var payload CreateCollectionPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}

	tx, err := db.Instance.Begin()
	if err != nil {
		http.Error(w, "Erro ao iniciar transação", http.StatusInternalServerError)
		return
	}
	defer tx.Rollback()

	_, err = tx.Exec(
		"UPDATE schema_collections SET name = $1, slug = $2, icon = $3, metadata = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5",
		payload.Name, payload.Slug, payload.Icon, payload.Metadata, id,
	)
	if err != nil {
		http.Error(w, "Erro ao atualizar coleção", http.StatusInternalServerError)
		return
	}

	// Delete existing fields (cascade is for documents usually, we manually recreate fields)
	_, err = tx.Exec("DELETE FROM schema_fields WHERE collection_id = $1", id)
	if err != nil {
		http.Error(w, "Erro ao atualizar campos da coleção", http.StatusInternalServerError)
		return
	}

	for _, f := range payload.Fields {
		fID := uuid.NewString()
		_, err = tx.Exec(
			"INSERT INTO schema_fields (id, name, label, type, required, collection_id, order_int, relation_to) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
			fID, f.Name, f.Label, f.Type, f.Required, id, f.Order, f.RelationTo,
		)
		if err != nil {
			http.Error(w, "Erro ao inserir novos campos da coleção", http.StatusInternalServerError)
			return
		}
	}

	if err := tx.Commit(); err != nil {
		http.Error(w, "Erro ao confirmar transação", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{"success": true})
}

// DeleteCollectionHandler deletes a collection
func DeleteCollectionHandler(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		http.Error(w, "ID é obrigatório", http.StatusBadRequest)
		return
	}

	_, err := db.Instance.Exec("DELETE FROM schema_collections WHERE id = $1", id)
	if err != nil {
		http.Error(w, "Erro ao remover coleção", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{"success": true})
}
