package models

import "time"

// User represents an administrator in the system
type User struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Password  string    `json:"password"` // should not be returned in API usually, but needed for DB
	Role      string    `json:"role"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// SystemConfig represents global configurations (e.g., projectName)
type SystemConfig struct {
	Key       string    `json:"key"`
	Value     string    `json:"value"`
	UpdatedAt time.Time `json:"updated_at"`
}

// ApiKey represents a token to access the REST API
type ApiKey struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Key       string    `json:"key"`
	Role      string    `json:"role"`
	Active    bool      `json:"active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// SchemaCollection represents a dynamic content type (like a table)
type SchemaCollection struct {
	ID        string         `json:"id"`
	Name      string         `json:"name"`
	Slug      string         `json:"slug"`
	Icon      *string        `json:"icon"` // pointer since it can be null
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	Fields    []*SchemaField `json:"fields,omitempty"` // For API responses
}

// SchemaField represents a custom field belonging to a SchemaCollection
type SchemaField struct {
	ID           string    `json:"id"`
	Name         string    `json:"name"`
	Label        string    `json:"label"`
	Type         string    `json:"type"`
	Required     bool      `json:"required"`
	CollectionID string    `json:"collection_id"`
	Order        int       `json:"order"`
	RelationTo   *string   `json:"relation_to"` // pointer since it can be null
}

// Document represents a row of dynamic content belonging to a SchemaCollection
type Document struct {
	ID           string    `json:"id"`
	CollectionID string    `json:"collection_id"`
	Data         string    `json:"data"` // Stored as JSON string or JSONB
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// Extension represents an installed plugin
type Extension struct {
	ID          string    `json:"id"`
	Enabled     bool      `json:"enabled"`
	InstalledAt time.Time `json:"installed_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
