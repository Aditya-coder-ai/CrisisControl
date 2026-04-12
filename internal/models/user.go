package models

import "time"

// Role defines the authorization level of a user.
type Role string

const (
	RoleGuest     Role = "guest"
	RoleStaff     Role = "staff"
	RoleResponder Role = "responder"
	RoleAdmin     Role = "admin"
)

// User represents an entity interacting with the system.
type User struct {
	ID        string    `json:"id"` // UUID
	Username  string    `json:"username"`
	Email     string    `json:"email,omitempty"`
	Role      Role      `json:"role"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
