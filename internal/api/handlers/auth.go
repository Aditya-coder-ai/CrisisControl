package handlers

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"

	"emergency-response/internal/models"
	"emergency-response/internal/store"
)

// AuthHandler manages signup/login endpoints.
type AuthHandler struct {
	store    store.Store
	// In-memory credentials store (email -> AuthUser)
	users    map[string]*AuthUser
	// token -> user mapping for session validation
	sessions map[string]*AuthUser
	mu       sync.RWMutex
}

// AuthUser holds credentials and profile for authentication.
type AuthUser struct {
	ID           string      `json:"id"`
	Name         string      `json:"name"`
	Email        string      `json:"email"`
	PasswordHash string      `json:"-"`
	Role         models.Role `json:"role"`
	CreatedAt    time.Time   `json:"created_at"`
}

type SignupRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Role     string `json:"role"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AuthResponse struct {
	Token string       `json:"token"`
	User  AuthUserResp `json:"user"`
}

type AuthUserResp struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	Role string `json:"role"`
}

func NewAuthHandler(s store.Store) *AuthHandler {
	h := &AuthHandler{
		store:    s,
		users:    make(map[string]*AuthUser),
		sessions: make(map[string]*AuthUser),
	}

	// Seed default demo accounts
	h.createUser("Admin Operator", "admin@emergency.gov", "admin123", models.RoleAdmin)
	h.createUser("Dispatch Control", "staff@emergency.gov", "staff123", models.RoleStaff)
	h.createUser("Unit-04", "responder@emergency.gov", "resp123", models.RoleResponder)

	return h
}

func (h *AuthHandler) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("POST /api/v1/auth/signup", h.Signup)
	mux.HandleFunc("POST /api/v1/auth/login", h.Login)
	mux.HandleFunc("GET /api/v1/auth/me", h.Me)
}

func hashPassword(password string) string {
	hash := sha256.Sum256([]byte(password + "emergency-salt-v1"))
	return hex.EncodeToString(hash[:])
}

func generateToken(email string) string {
	raw := fmt.Sprintf("%s:%d:emergency-secret", email, time.Now().UnixNano())
	hash := sha256.Sum256([]byte(raw))
	return hex.EncodeToString(hash[:])
}

func (h *AuthHandler) createUser(name, email, password string, role models.Role) *AuthUser {
	user := &AuthUser{
		ID:           fmt.Sprintf("user-%s", strings.ReplaceAll(email, "@", "-")),
		Name:         name,
		Email:        strings.ToLower(email),
		PasswordHash: hashPassword(password),
		Role:         role,
		CreatedAt:    time.Now(),
	}
	h.users[user.Email] = user
	return user
}

func (h *AuthHandler) Signup(w http.ResponseWriter, r *http.Request) {
	var req SignupRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid request payload"})
		return
	}

	// Validate
	if req.Name == "" || req.Email == "" || req.Password == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Name, email, and password are required"})
		return
	}
	if len(req.Password) < 6 {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Password must be at least 6 characters"})
		return
	}

	email := strings.ToLower(strings.TrimSpace(req.Email))

	h.mu.Lock()
	defer h.mu.Unlock()

	// Check if email already exists
	if _, exists := h.users[email]; exists {
		writeJSON(w, http.StatusConflict, map[string]string{"error": "An account with this email already exists"})
		return
	}

	// Determine role (default to staff if invalid)
	role := models.RoleStaff
	switch models.Role(req.Role) {
	case models.RoleStaff:
		role = models.RoleStaff
	case models.RoleResponder:
		role = models.RoleResponder
	}

	user := h.createUser(req.Name, email, req.Password, role)

	// Generate session token
	token := generateToken(email)
	h.sessions[token] = user

	writeJSON(w, http.StatusCreated, AuthResponse{
		Token: token,
		User: AuthUserResp{
			ID:   user.ID,
			Name: user.Name,
			Role: string(user.Role),
		},
	})
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid request payload"})
		return
	}

	email := strings.ToLower(strings.TrimSpace(req.Email))

	h.mu.RLock()
	user, exists := h.users[email]
	h.mu.RUnlock()

	if !exists || user.PasswordHash != hashPassword(req.Password) {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "Invalid email or password"})
		return
	}

	// Generate session token
	token := generateToken(email)

	h.mu.Lock()
	h.sessions[token] = user
	h.mu.Unlock()

	writeJSON(w, http.StatusOK, AuthResponse{
		Token: token,
		User: AuthUserResp{
			ID:   user.ID,
			Name: user.Name,
			Role: string(user.Role),
		},
	})
}

func (h *AuthHandler) Me(w http.ResponseWriter, r *http.Request) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "Missing authorization token"})
		return
	}

	token := strings.TrimPrefix(authHeader, "Bearer ")

	h.mu.RLock()
	user, exists := h.sessions[token]
	h.mu.RUnlock()

	if !exists {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "Invalid or expired token"})
		return
	}

	writeJSON(w, http.StatusOK, AuthUserResp{
		ID:   user.ID,
		Name: user.Name,
		Role: string(user.Role),
	})
}

func writeJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}
