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
	mux.HandleFunc("PUT /api/auth/me", handlers.RequireAuth(handlers.UpdateMeHandler))
	
	mux.HandleFunc("GET /api/config", handlers.GetConfigHandler)
	mux.HandleFunc("GET /api/system/config", handlers.RequireAuth(handlers.RequireRole("auditor")(handlers.GetSystemConfigHandler)))
	mux.HandleFunc("POST /api/system/config", handlers.RequireAuth(handlers.RequireRole()(handlers.SetSystemConfigHandler))) // Apenas admin
	mux.HandleFunc("POST /api/system/test-supabase", handlers.RequireAuth(handlers.RequireRole()(handlers.TestSupabaseConnectionHandler)))
	mux.HandleFunc("POST /api/system/test-r2", handlers.RequireAuth(handlers.RequireRole()(handlers.TestR2ConnectionHandler)))
	mux.HandleFunc("GET /api/system/test-database", handlers.RequireAuth(handlers.RequireRole()(handlers.TestDatabaseConnectionHandler)))
	mux.HandleFunc("GET /api/business", handlers.GetBusinessInfoHandler)
	mux.HandleFunc("GET /api/system/update", handlers.RequireAuth(handlers.CheckUpdateHandler))
	mux.HandleFunc("GET /api/system/version", handlers.RequireAuth(handlers.GetSystemVersionHandler))
	mux.HandleFunc("GET /api/system/status", handlers.RequireAuth(handlers.GetSystemStatusHandler))

	// API Keys
	mux.HandleFunc("GET /api/system/api-keys", handlers.RequireAuth(handlers.RequireRole("auditor")(handlers.GetApiKeysHandler)))
	mux.HandleFunc("POST /api/system/api-keys", handlers.RequireAuth(handlers.RequireRole()(handlers.CreateApiKeyHandler)))
	mux.HandleFunc("DELETE /api/system/api-keys/{id}", handlers.RequireAuth(handlers.RequireRole()(handlers.DeleteApiKeyHandler)))

	// Users API
	mux.HandleFunc("GET /api/users", handlers.RequireAuth(handlers.RequireRole("it_manager", "auditor")(handlers.ListUsersHandler)))
	mux.HandleFunc("POST /api/users", handlers.RequireAuth(handlers.RequireRole("it_manager")(handlers.CreateUserHandler)))
	mux.HandleFunc("PUT /api/users/{id}", handlers.RequireAuth(handlers.RequireRole("it_manager")(handlers.UpdateUserHandler)))
	mux.HandleFunc("DELETE /api/users/{id}", handlers.RequireAuth(handlers.RequireRole("it_manager")(handlers.DeleteUserHandler)))

	// Extensions API
	mux.HandleFunc("GET /api/extensions", handlers.RequireAuth(handlers.RequireRole("it_manager", "auditor")(handlers.GetExtensionsHandler)))
	mux.HandleFunc("POST /api/extensions/install", handlers.RequireAuth(handlers.RequireRole("it_manager")(handlers.InstallExtensionHandler)))
	mux.HandleFunc("POST /api/extensions/toggle/{id}", handlers.RequireAuth(handlers.RequireRole("it_manager")(handlers.ToggleExtensionHandler)))
	mux.HandleFunc("POST /api/extensions/uninstall/{id}", handlers.RequireAuth(handlers.RequireRole("it_manager")(handlers.UninstallExtensionHandler)))
	
	// Schema API
	mux.HandleFunc("GET /api/schema/collections", handlers.RequireAuth(handlers.RequireRole("manager", "auditor")(handlers.GetCollectionsHandler)))
	mux.HandleFunc("GET /api/schema/collections/{id}", handlers.RequireAuth(handlers.RequireRole("manager", "auditor")(handlers.GetCollectionByIdHandler)))
	mux.HandleFunc("POST /api/schema/collections", handlers.RequireAuth(handlers.RequireRole("manager")(handlers.CreateCollectionHandler)))
	mux.HandleFunc("PUT /api/schema/collections/{id}", handlers.RequireAuth(handlers.RequireRole("manager")(handlers.UpdateCollectionHandler)))
	mux.HandleFunc("DELETE /api/schema/collections/{id}", handlers.RequireAuth(handlers.RequireRole("manager")(handlers.DeleteCollectionHandler)))

	// Content API
	mux.HandleFunc("GET /api/content/collections/{slug}", handlers.GetCollectionBySlugHandler)
	mux.HandleFunc("GET /api/content/documents", handlers.GetDocumentsHandler)
	mux.HandleFunc("GET /api/content/documents/{id}", handlers.GetDocumentHandler)
	mux.HandleFunc("POST /api/content/documents", handlers.RequireAuth(handlers.RequireRole("manager")(handlers.CreateDocumentHandler)))
	mux.HandleFunc("PUT /api/content/documents/{id}", handlers.RequireAuth(handlers.RequireRole("manager")(handlers.UpdateDocumentHandler)))
	mux.HandleFunc("DELETE /api/content/documents/{id}", handlers.RequireAuth(handlers.RequireRole("manager")(handlers.DeleteDocumentHandler)))
	
	// Upload API
	mux.HandleFunc("POST /api/upload", handlers.RequireAuth(handlers.RequireRole("manager")(handlers.UploadHandler)))
	
	// Media API
	mux.HandleFunc("GET /api/media", handlers.RequireAuth(handlers.RequireRole("manager", "auditor")(handlers.ListMediaHandler)))
	mux.HandleFunc("GET /api/media/stats", handlers.RequireAuth(handlers.RequireRole("manager", "auditor")(handlers.GetMediaStatsHandler)))
	mux.HandleFunc("PUT /api/media/{id}", handlers.RequireAuth(handlers.RequireRole("manager")(handlers.UpdateMediaHandler)))
	mux.HandleFunc("DELETE /api/media/{id}", handlers.RequireAuth(handlers.RequireRole("manager")(handlers.DeleteMediaHandler)))

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
