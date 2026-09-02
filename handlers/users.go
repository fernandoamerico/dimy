package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"time"

	"golang.org/x/crypto/bcrypt"

	"github.com/fernandoamerico/dimy/db"
	"github.com/fernandoamerico/dimy/models"
)

// ListUsersHandler returns all users in the system
func ListUsersHandler(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Instance.Query("SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC")
	if err != nil {
		http.Error(w, "Erro ao buscar usuários", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	users := []models.User{}
	for rows.Next() {
		var u models.User
		if err := rows.Scan(&u.ID, &u.Name, &u.Email, &u.Role, &u.CreatedAt); err != nil {
			http.Error(w, "Erro ao ler usuário", http.StatusInternalServerError)
			return
		}
		users = append(users, u)
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(users)
}

// CreateUserHandler creates a new user
func CreateUserHandler(w http.ResponseWriter, r *http.Request) {
	var payload struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Password string `json:"password"`
		Role     string `json:"role"`
	}

	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}

	if payload.Name == "" || payload.Email == "" || payload.Password == "" || payload.Role == "" {
		http.Error(w, "Preencha todos os campos", http.StatusBadRequest)
		return
	}

	// Verify if email already exists
	var count int
	err := db.Instance.QueryRow("SELECT COUNT(*) FROM users WHERE email = $1", payload.Email).Scan(&count)
	if err != nil {
		http.Error(w, "Erro ao verificar email", http.StatusInternalServerError)
		return
	}
	if count > 0 {
		http.Error(w, "Este email já está em uso", http.StatusConflict)
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(payload.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Erro ao criptografar senha", http.StatusInternalServerError)
		return
	}

	userID := "usr_" + time.Now().UTC().Format("20060102150405")
	_, err = db.Instance.Exec(
		"INSERT INTO users (id, name, email, password, role, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
		userID, payload.Name, payload.Email, string(hashedPassword), payload.Role,
	)
	if err != nil {
		http.Error(w, "Erro ao criar usuário", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "Usuário criado com sucesso", "id": userID})
}

// UpdateUserHandler updates an existing user
func UpdateUserHandler(w http.ResponseWriter, r *http.Request) {
	userID := r.PathValue("id")
	if userID == "" {
		http.Error(w, "ID do usuário não fornecido", http.StatusBadRequest)
		return
	}

	var payload struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Password string `json:"password,omitempty"`
		Role     string `json:"role"`
	}

	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}

	if payload.Name == "" || payload.Email == "" || payload.Role == "" {
		http.Error(w, "Nome, email e cargo são obrigatórios", http.StatusBadRequest)
		return
	}

	// Check if user exists
	var currentRole string
	err := db.Instance.QueryRow("SELECT role FROM users WHERE id = $1", userID).Scan(&currentRole)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Usuário não encontrado", http.StatusNotFound)
		} else {
			http.Error(w, "Erro ao buscar usuário", http.StatusInternalServerError)
		}
		return
	}

	// Protect admin from being demoted or modified by non-admins (optional but good practice)
	loggedInUserRole := r.Context().Value("user_role").(string)
	if currentRole == "admin" && loggedInUserRole != "admin" {
		http.Error(w, "Você não tem permissão para editar um administrador", http.StatusForbidden)
		return
	}

	if payload.Password != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(payload.Password), bcrypt.DefaultCost)
		if err != nil {
			http.Error(w, "Erro ao criptografar senha", http.StatusInternalServerError)
			return
		}
		_, err = db.Instance.Exec(
			"UPDATE users SET name = $1, email = $2, password = $3, role = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5",
			payload.Name, payload.Email, string(hashedPassword), payload.Role, userID,
		)
	} else {
		_, err = db.Instance.Exec(
			"UPDATE users SET name = $1, email = $2, role = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4",
			payload.Name, payload.Email, payload.Role, userID,
		)
	}

	if err != nil {
		http.Error(w, "Erro ao atualizar usuário", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Usuário atualizado com sucesso"})
}

// DeleteUserHandler removes a user
func DeleteUserHandler(w http.ResponseWriter, r *http.Request) {
	userID := r.PathValue("id")
	if userID == "" {
		http.Error(w, "ID do usuário não fornecido", http.StatusBadRequest)
		return
	}

	// Prevent user from deleting themselves
	loggedInUserID, _ := r.Context().Value("user_id").(string)
	if userID == loggedInUserID {
		http.Error(w, "Você não pode excluir sua própria conta", http.StatusBadRequest)
		return
	}

	// Check if user exists and prevent deleting admin if not admin
	var currentRole string
	err := db.Instance.QueryRow("SELECT role FROM users WHERE id = $1", userID).Scan(&currentRole)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Usuário não encontrado", http.StatusNotFound)
		} else {
			http.Error(w, "Erro ao buscar usuário", http.StatusInternalServerError)
		}
		return
	}
	
	loggedInUserRole := r.Context().Value("user_role").(string)
	if currentRole == "admin" && loggedInUserRole != "admin" {
		http.Error(w, "Você não tem permissão para excluir um administrador", http.StatusForbidden)
		return
	}

	_, err = db.Instance.Exec("DELETE FROM users WHERE id = $1", userID)
	if err != nil {
		http.Error(w, "Erro ao excluir usuário", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Usuário excluído com sucesso"})
}
