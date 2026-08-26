package api

import (
	"io/fs"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/fernandoamerico/dimy/handlers"
)

// StartServer initializes the HTTP router and starts listening.
func StartServer(port string, frontendFS fs.FS) error {
	mux := http.NewServeMux()

	// API Routes (using Go 1.22 enhanced routing)
	mux.HandleFunc("POST /api/auth/login", handlers.LoginHandler)
	mux.HandleFunc("POST /api/auth/logout", handlers.LogoutHandler)
	mux.HandleFunc("POST /api/auth/setup", handlers.SetupHandler)
	mux.HandleFunc("GET /api/auth/me", handlers.RequireAuth(handlers.MeHandler))
	
	mux.HandleFunc("GET /api/system/config", handlers.GetConfigHandler)

	// Embed Static Frontend SPA
	staticDir, err := fs.Sub(frontendFS, "frontend/out")
	if err != nil {
		return err
	}
	
	fileServer := http.FileServer(http.FS(staticDir))
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if strings.HasPrefix(r.URL.Path, "/api/") {
			http.NotFound(w, r)
			return
		}
		fileServer.ServeHTTP(w, r)
	})

	// Wrap with Secure CORS and Logging middleware
	handler := loggingMiddleware(corsMiddleware(mux))

	log.Printf("Starting Dimy Server on port %s...", port)
	return http.ListenAndServe(":"+port, handler)
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		
		// Secure CORS handling
		if origin != "" {
			// In production, we restrict origins. In development, we can be more flexible
			isProd := os.Getenv("NODE_ENV") == "production"
			
			if !isProd || isAllowedOrigin(origin) {
				w.Header().Set("Access-Control-Allow-Origin", origin)
				w.Header().Set("Access-Control-Allow-Credentials", "true")
			} else {
				// If not allowed and in production, we do not echo the origin
				w.Header().Set("Access-Control-Allow-Origin", "null")
			}
		}

		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// In a real application, check against a whitelist stored in configs or environment
func isAllowedOrigin(origin string) bool {
	allowedOrigins := os.Getenv("ALLOWED_ORIGINS")
	if allowedOrigins == "" {
		return false
	}
	
	for _, o := range strings.Split(allowedOrigins, ",") {
		if strings.TrimSpace(o) == origin {
			return true
		}
	}
	return false
}

func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("%s %s", r.Method, r.URL.Path)
		next.ServeHTTP(w, r)
	})
}
