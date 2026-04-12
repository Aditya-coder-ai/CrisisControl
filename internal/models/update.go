package models

import "time"

// StatusUpdate represents an audit log entry for an incident's lifecycle.
type StatusUpdate struct {
	ID         string         `json:"id"`
	IncidentID string         `json:"incident_id"`
	AuthorID   string         `json:"author_id"` // ID of the User who made the change
	Status     IncidentStatus `json:"status"`
	Note       string         `json:"note,omitempty"` // Additional context for the change
	IsInternal bool           `json:"is_internal"` // If true, only visible to Responders/Staff
	CreatedAt  time.Time      `json:"created_at"`
}
