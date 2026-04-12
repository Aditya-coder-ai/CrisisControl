package store

import (
	"context"
	"emergency-response/internal/models"
)

// Store defines the interfaces for data access (Tier 3).
// Following the Repository pattern to ensure we can swap implementations (e.g., mock vs posgres).
type Store interface {
	CreateIncident(ctx context.Context, incident *models.Incident) error
	GetIncidentByID(ctx context.Context, id string) (*models.Incident, error)
	ListIncidents(ctx context.Context, filter map[string]interface{}) ([]*models.Incident, error)
	UpdateIncidentStatus(ctx context.Context, id string, newStatus models.IncidentStatus) error
	
	CreateStatusUpdate(ctx context.Context, update *models.StatusUpdate) error
	ListStatusUpdates(ctx context.Context, incidentID string) ([]*models.StatusUpdate, error)
	
	GetUserByID(ctx context.Context, id string) (*models.User, error)
}
