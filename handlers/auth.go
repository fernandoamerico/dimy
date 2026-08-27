package handlers

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"

	"github.com/fernandoamerico/dimy/db"
	"github.com/fernandoamerico/dimy/models"
)

var jwtSecretKey = []byte(getJWTSecret())

func getJWTSecret() string {
	secret := os.Getenv("SESSION_SECRET")
	if secret == "" {
		return "dimy-super-secret-key-change-me"
	}
	return secret
}

// Claims defines the JWT claims structure
type Claims struct {
	UserID string `json:"userId"`
	jwt.RegisteredClaims
}

// GenerateJWT creates a signed token for the user
func GenerateJWT(userID string) (string, error) {
	expirationTime := time.Now().Add(7 * 24 * time.Hour)
	claims := &Claims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecretKey)
}

// SetupHandler handles the initial admin creation
func SetupHandler(w http.ResponseWriter, r *http.Request) {
	var payload struct {
		Name            string `json:"name"`
		Email           string `json:"email"`
		Password        string `json:"password"`
		ConfirmPassword string `json:"confirmPassword"`
		ProjectName     string `json:"projectName"`
		DatabaseType    string `json:"databaseType"`
		DatabaseUrl     string `json:"databaseUrl"`
	}

	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}

	if payload.Name == "" || payload.Email == "" || payload.Password == "" || payload.ProjectName == "" {
		http.Error(w, "Preencha todos os campos obrigatórios", http.StatusBadRequest)
		return
	}

	if payload.Password != payload.ConfirmPassword {
		http.Error(w, "As senhas não coincidem", http.StatusBadRequest)
		return
	}

	if len(payload.Password) < 8 {
		http.Error(w, "A senha deve ter pelo menos 8 caracteres", http.StatusBadRequest)
		return
	}

	// 0. Handle Database Configuration
	if payload.DatabaseType == "postgres" && payload.DatabaseUrl != "" {
		// Write to .env file
		envContent := fmt.Sprintf("DATABASE_URL=%s\n", payload.DatabaseUrl)
		if err := os.WriteFile(".env", []byte(envContent), 0600); err != nil {
			http.Error(w, "Erro ao salvar configuração do banco de dados", http.StatusInternalServerError)
			return
		}

		// Reconnect to the new database
		if err := db.Reconnect(); err != nil {
			// If it fails, we should probably delete the .env or rollback, but let's keep it simple for now
			http.Error(w, "Erro ao conectar ao banco de dados: "+err.Error(), http.StatusInternalServerError)
			return
		}
	}

	// 1. Verify if system is already set up (user count > 0)
	var count int
	err := db.Instance.QueryRow("SELECT COUNT(*) FROM users").Scan(&count)
	if err != nil {
		http.Error(w, "Erro ao consultar banco de dados", http.StatusInternalServerError)
		return
	}
	if count > 0 {
		http.Error(w, "O sistema já foi configurado", http.StatusForbidden)
		return
	}

	// 2. Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(payload.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Erro ao criptografar senha", http.StatusInternalServerError)
		return
	}

	// 3. Save admin user
	userID := "usr_" + time.Now().UTC().Format("20060102150405")
	_, err = db.Instance.Exec(
		"INSERT INTO users (id, name, email, password, role, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
		userID, payload.Name, payload.Email, string(hashedPassword), "admin",
	)
	if err != nil {
		http.Error(w, "Erro ao salvar usuário", http.StatusInternalServerError)
		return
	}

	// 4. Save project name
	_, err = db.Instance.Exec(
		"INSERT INTO system_configs (key, value, updated_at) VALUES ('projectName', $1, CURRENT_TIMESTAMP)",
		payload.ProjectName,
	)
	if err != nil {
		http.Error(w, "Erro ao salvar nome do projeto", http.StatusInternalServerError)
		return
	}

	// 5. Generate JWT and set Session Cookie
	token, err := GenerateJWT(userID)
	if err != nil {
		http.Error(w, "Erro ao gerar sessão", http.StatusInternalServerError)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "dimy_session",
		Value:    token,
		Expires:  time.Now().Add(7 * 24 * time.Hour),
		HttpOnly: true,
		Secure:   os.Getenv("NODE_ENV") == "production",
		SameSite: http.SameSiteLaxMode,
		Path:     "/",
	})

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "Setup concluído com sucesso"})
}

// LoginHandler handles user login
func LoginHandler(w http.ResponseWriter, r *http.Request) {
	var payload struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}

	var user models.User
	err := db.Instance.QueryRow("SELECT id, name, email, password, role FROM users WHERE email = $1", payload.Email).
		Scan(&user.ID, &user.Name, &user.Email, &user.Password, &user.Role)
		
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			http.Error(w, "Credenciais inválidas", http.StatusUnauthorized)
		} else {
			http.Error(w, "Erro no servidor", http.StatusInternalServerError)
		}
		return
	}

	// Verify Bcrypt password hash
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(payload.Password))
	if err != nil {
		http.Error(w, "Credenciais inválidas", http.StatusUnauthorized)
		return
	}

	// Generate Session JWT
	token, err := GenerateJWT(user.ID)
	if err != nil {
		http.Error(w, "Erro ao gerar sessão", http.StatusInternalServerError)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "dimy_session",
		Value:    token,
		Expires:  time.Now().Add(7 * 24 * time.Hour),
		HttpOnly: true,
		Secure:   os.Getenv("NODE_ENV") == "production",
		SameSite: http.SameSiteLaxMode,
		Path:     "/",
	})

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Login bem-sucedido"})
}

// LogoutHandler clears the session cookie
func LogoutHandler(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name:     "dimy_session",
		Value:    "",
		Expires:  time.Unix(0, 0),
		HttpOnly: true,
		Secure:   os.Getenv("NODE_ENV") == "production",
		SameSite: http.SameSiteLaxMode,
		Path:     "/",
	})
	
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Sessão encerrada"})
}

// MeHandler returns the current authenticated user
func MeHandler(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("user_id").(string)
	if !ok || userID == "" {
		http.Error(w, "Não autorizado", http.StatusUnauthorized)
		return
	}
	
	var user models.User
	err := db.Instance.QueryRow("SELECT id, name, email, role FROM users WHERE id = $1", userID).
		Scan(&user.ID, &user.Name, &user.Email, &user.Role)
		
	if err != nil {
		http.Error(w, "Usuário não encontrado", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(user)
}

// UpdateMeHandler updates the current user's profile
func UpdateMeHandler(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("user_id").(string)
	if !ok || userID == "" {
		http.Error(w, "Não autorizado", http.StatusUnauthorized)
		return
	}

	var payload struct {
		Name        string `json:"name"`
		Email       string `json:"email"`
		OldPassword string `json:"oldPassword,omitempty"`
		NewPassword string `json:"newPassword,omitempty"`
	}

	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}

	if payload.Name == "" || payload.Email == "" {
		http.Error(w, "Nome e Email são obrigatórios", http.StatusBadRequest)
		return
	}

	// Fetch current user
	var currentPassword string
	err := db.Instance.QueryRow("SELECT password FROM users WHERE id = $1", userID).Scan(&currentPassword)
	if err != nil {
		http.Error(w, "Erro ao buscar usuário", http.StatusInternalServerError)
		return
	}

	// Update password if requested
	updatePassword := false
	var finalPassword string
	if payload.NewPassword != "" {
		if payload.OldPassword == "" {
			http.Error(w, "Senha atual é obrigatória para alterar a senha", http.StatusBadRequest)
			return
		}
		if len(payload.NewPassword) < 8 {
			http.Error(w, "A nova senha deve ter pelo menos 8 caracteres", http.StatusBadRequest)
			return
		}

		err = bcrypt.CompareHashAndPassword([]byte(currentPassword), []byte(payload.OldPassword))
		if err != nil {
			http.Error(w, "Senha atual incorreta", http.StatusUnauthorized)
			return
		}

		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(payload.NewPassword), bcrypt.DefaultCost)
		if err != nil {
			http.Error(w, "Erro ao criptografar nova senha", http.StatusInternalServerError)
			return
		}
		finalPassword = string(hashedPassword)
		updatePassword = true
	}

	if updatePassword {
		_, err = db.Instance.Exec(
			"UPDATE users SET name = $1, email = $2, password = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4",
			payload.Name, payload.Email, finalPassword, userID,
		)
	} else {
		_, err = db.Instance.Exec(
			"UPDATE users SET name = $1, email = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3",
			payload.Name, payload.Email, userID,
		)
	}

	if err != nil {
		http.Error(w, "Erro ao atualizar perfil", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Perfil atualizado com sucesso"})
}
