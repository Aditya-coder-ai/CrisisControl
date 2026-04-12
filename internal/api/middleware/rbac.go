package middleware

import (
	"context"
	"net/http"

	"emergency-response/internal/models"
)

type contextKey string

const UserContextKey contextKey = "user"

// RequireRole is a middleware that enforces RBAC.
func RequireRole(allowedRoles ...models.Role) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// In a real application, we would extract the JWT token or session,
			// validate it, and fetch the user's role here.
			// For this blueprint, we simulate retrieving user from context.
			
			user, ok := r.Context().Value(UserContextKey).(*models.User)
			if !ok || user == nil {
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}

			// Check if the user's role is in the allowed list
			isAllowed := false
			for _, role := range allowedRoles {
				if user.Role == role {
					isAllowed = true
					break
				}
			}

			// Admin overrides
			if user.Role == models.RoleAdmin {
				isAllowed = true
			}

			if !isAllowed {
				http.Error(w, "Forbidden", http.StatusForbidden)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

// MockAuthMiddleware populates context with a mock user for testing.
// In production, this verifies a token payload.
func MockAuthMiddleware(mockUser *models.User) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ctx := context.WithValue(r.Context(), UserContextKey, mockUser)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
