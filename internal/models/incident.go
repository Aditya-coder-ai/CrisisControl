package models

import "time"

// IncidentSeverity defines the criticality of an incident.
type IncidentSeverity string

const (
	SeverityLow      IncidentSeverity = "low"
	SeverityModerate IncidentSeverity = "moderate"
	SeverityHigh     IncidentSeverity = "high"
	SeverityCritical IncidentSeverity = "critical"
)

// IncidentStatus maps the lifecycle of an incident.
type IncidentStatus string

const (
	StatusReported    IncidentStatus = "reported"
	StatusAssessing   IncidentStatus = "assessing"
	StatusDispatched  IncidentStatus = "dispatched"
	StatusInProgress  IncidentStatus = "in_progress"
	StatusResolved    IncidentStatus = "resolved"
	StatusClosed      IncidentStatus = "closed"
)

// LocationData captures the geographic position of an incident.
type LocationData struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
	Address   string  `json:"address,omitempty"`
}

// Incident represents an event requiring tracking and response.
type Incident struct {
	ID             string           `json:"id"`
	Type           string           `json:"type"`            // e.g., Fire, Medical, Security
	Title          string           `json:"title"`
	Description    string           `json:"description"`
	Severity       IncidentSeverity `json:"severity"`
	Status         IncidentStatus   `json:"status"`
	Location       LocationData     `json:"location"`
	ReporterID     string           `json:"reporter_id"`               // ID of User who reported
	ResponderID    *string          `json:"responder_id,omitempty"`    // ID of Assigned Responder
	AssignedTeam   string           `json:"assigned_team,omitempty"`   // Internal team assignment
	ExternalAgency string           `json:"external_agency,omitempty"` // External agency API notified
	Tags           []string         `json:"tags,omitempty"`            // Metadata tags
	CreatedAt      time.Time        `json:"created_at"`
	UpdatedAt      time.Time        `json:"updated_at"`
}
