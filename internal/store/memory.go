package store

import (
	"context"
	"errors"
	"sync"

	"emergency-response/internal/models"
)

// MemoryStore provides an in-memory implementation of the Store interface.
type MemoryStore struct {
	incidents     map[string]*models.Incident
	statusUpdates map[string][]*models.StatusUpdate
	users         map[string]*models.User
	mu            sync.RWMutex
}

func NewMemoryStore() *MemoryStore {
	store := &MemoryStore{
		incidents:     make(map[string]*models.Incident),
		statusUpdates: make(map[string][]*models.StatusUpdate),
		users:         make(map[string]*models.User),
	}
	
	// Seed mock users
	store.users["mock-admin-id"] = &models.User{ID: "mock-admin-id", Username: "Admin", Role: models.RoleAdmin}
	store.users["mock-staff-id"] = &models.User{ID: "mock-staff-id", Username: "Dispatch", Role: models.RoleStaff}
	store.users["mock-responder-id"] = &models.User{ID: "mock-responder-id", Username: "Unit-04", Role: models.RoleResponder}

	return store
}

func (m *MemoryStore) CreateIncident(ctx context.Context, incident *models.Incident) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.incidents[incident.ID] = incident
	return nil
}

func (m *MemoryStore) GetIncidentByID(ctx context.Context, id string) (*models.Incident, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	if inc, ok := m.incidents[id]; ok {
		return inc, nil
	}
	return nil, errors.New("incident not found")
}

func (m *MemoryStore) ListIncidents(ctx context.Context, filter map[string]interface{}) ([]*models.Incident, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	
	var list []*models.Incident
	for _, inc := range m.incidents {
		list = append(list, inc)
	}
	return list, nil
}

func (m *MemoryStore) UpdateIncidentStatus(ctx context.Context, id string, newStatus models.IncidentStatus) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	if inc, ok := m.incidents[id]; ok {
		inc.Status = newStatus
		return nil
	}
	return errors.New("incident not found")
}

func (m *MemoryStore) CreateStatusUpdate(ctx context.Context, update *models.StatusUpdate) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.statusUpdates[update.IncidentID] = append(m.statusUpdates[update.IncidentID], update)
	return nil
}

func (m *MemoryStore) ListStatusUpdates(ctx context.Context, incidentID string) ([]*models.StatusUpdate, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	if updates, ok := m.statusUpdates[incidentID]; ok {
		return updates, nil
	}
	return []*models.StatusUpdate{}, nil
}

func (m *MemoryStore) GetUserByID(ctx context.Context, id string) (*models.User, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	if user, ok := m.users[id]; ok {
		return user, nil
	}
	return nil, errors.New("user not found")
}
