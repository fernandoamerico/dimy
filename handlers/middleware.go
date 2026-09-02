package handlers

import (
	"context"
	"net/http"
	"strings"

	"github.com/fernandoamerico/dimy/db"
	"github.com/golang-jwt/jwt/v5"
)

// RequireAuth checks for valid dimy_session cookie or Bearer Token (API Key)
func RequireAuth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// 1. Check for Bearer Token (API Key)
		authHeader := r.Header.Get("Authorization")
		if strings.HasPrefix(authHeader, "Bearer ") {
			tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
			var active bool
			var role string
			err := db.Instance.QueryRow("SELECT active, role FROM api_keys WHERE key = $1", tokenStr).Scan(&active, &role)
			if err == nil && active {
				// Inject api-key identifier into context
				ctx := context.WithValue(r.Context(), "user_id", "api_key")
				ctx = context.WithValue(ctx, "user_role", role)
				next.ServeHTTP(w, r.WithContext(ctx))
				return
			}
		}

		// 2. Check for Session Cookie
		cookie, err := r.Cookie("dimy_session")
		if err != nil || cookie.Value == "" {
			http.Error(w, "Não autorizado", http.StatusUnauthorized)
			return
		}

		tokenString := cookie.Value
		claims := &Claims{}

		// Parse and validate the JWT signature and expiration
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			// Ensure HSM-256 signing method is used
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return jwtSecretKey, nil
		})

		if err != nil || !token.Valid {
			http.Error(w, "Sessão inválida ou expirada", http.StatusUnauthorized)
			return
		}

		// Fetch user role from DB to ensure it's up to date and valid
		var role string
		err = db.Instance.QueryRow("SELECT role FROM users WHERE id = $1", claims.UserID).Scan(&role)
		if err != nil {
			http.Error(w, "Sessão inválida ou usuário removido", http.StatusUnauthorized)
			return
		}

		// Inject userID and role into context
		ctx := context.WithValue(r.Context(), "user_id", claims.UserID)
		ctx = context.WithValue(ctx, "user_role", role)
		next.ServeHTTP(w, r.WithContext(ctx))
	}
}

// IsAuthenticated is a helper function to verify if the request has a valid token or cookie
func IsAuthenticated(r *http.Request) bool {
	// 1. Check for Bearer Token
	authHeader := r.Header.Get("Authorization")
	if strings.HasPrefix(authHeader, "Bearer ") {
		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
		var active bool
		err := db.Instance.QueryRow("SELECT active FROM api_keys WHERE key = $1", tokenStr).Scan(&active)
		if err == nil && active {
			return true
		}
	}

	// 2. Check for Session Cookie
	cookie, err := r.Cookie("dimy_session")
	if err != nil || cookie.Value == "" {
		return false
	}

	tokenString := cookie.Value
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, jwt.ErrSignatureInvalid
		}
		return jwtSecretKey, nil
	})

	if err != nil || !token.Valid {
		return false
	}

	return true
}

// RequireRole enforces that the user has one of the specified roles.
// It expects RequireAuth to have already populated "user_role" in the context.
// The 'admin' role is always granted access.
func RequireRole(allowedRoles ...string) func(http.HandlerFunc) http.HandlerFunc {
	return func(next http.HandlerFunc) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			userRole, ok := r.Context().Value("user_role").(string)
			if !ok || userRole == "" {
				http.Error(w, "Não autorizado: Cargo não encontrado", http.StatusUnauthorized)
				return
			}

			// Admin has access to everything
			if userRole == "admin" {
				next.ServeHTTP(w, r)
				return
			}

			for _, role := range allowedRoles {
				if userRole == role {
					next.ServeHTTP(w, r)
					return
				}
			}

			http.Error(w, "Acesso negado: Cargo insuficiente", http.StatusForbidden)
		}
	}
}

