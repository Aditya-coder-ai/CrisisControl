package api

import (
	"log"
	"net/http"

	"emergency-response/internal/api/handlers"
	"emergency-response/internal/api/middleware"
	"emergency-response/internal/models"
	"emergency-response/internal/service"
	"emergency-response/internal/store"
)

// Server holds the configuration and routing setup.
type Server struct {
	mux         *http.ServeMux
	store       store.Store
	syncService *service.SyncService
	hub         *service.Hub
}

func NewServer(s store.Store, syncSvc *service.SyncService, hub *service.Hub) *Server {
	return &Server{
		mux:         http.NewServeMux(),
		store:       s,
		syncService: syncSvc,
		hub:         hub,
	}
}

// corsMiddleware handles CORS for dev server
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// SetupRoutes registers routes and attaches global middleware.
func (s *Server) SetupRoutes() http.Handler {
	uiHandler := handlers.NewUIHandler(s.store, s.syncService, s.hub)
	uiHandler.RegisterRoutes(s.mux)

	// Register auth endpoints (signup, login, me)
	authHandler := handlers.NewAuthHandler(s.store)
	authHandler.RegisterRoutes(s.mux)

	// Default: apply mock authentication for testing purposes
	mockUser := &models.User{
		ID:       "mock-admin-id",
		Username: "TestAdmin",
		Role:     models.RoleAdmin,
	}

	return corsMiddleware(middleware.MockAuthMiddleware(mockUser)(s.mux))
}

// Start listens and serves requests.
func (s *Server) Start(addr string) error {
	handler := s.SetupRoutes()
	go s.hub.Run()
	log.Printf("Starting server on %s", addr)
	return http.ListenAndServe(addr, handler)
}

