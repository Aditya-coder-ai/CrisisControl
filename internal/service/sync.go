package service

import (
	"context"
	"errors"
	"sync"
	"time"

	"emergency-response/internal/models"
	"emergency-response/internal/store"
	"github.com/google/uuid"
)

// SyncService handles the Tier 2 synchronization logic.
type SyncService struct {
	store  store.Store
	hub    *Hub
	router *Router
	delivery *DeliveryService
	// Map to track processed UUIDs for idempotency (e.g. Redis in production).
	processedEvents map[string]bool
	mu              sync.RWMutex
}

func NewSyncService(db store.Store, hub *Hub, router *Router, delivery *DeliveryService) *SyncService {
	return &SyncService{
		store:           db,
		hub:             hub,
		router:          router,
		delivery:        delivery,
		processedEvents: make(map[string]bool),
	}
}

// ProcessOfflinePayload accepts batched events from an offline client and syncs them.
func (s *SyncService) ProcessOfflinePayload(ctx context.Context, payload []models.Incident) error {
	for _, incident := range payload {
		s.mu.RLock()
		isProcessed := s.processedEvents[incident.ID]
		s.mu.RUnlock()

		if isProcessed {
			continue
		}

		if incident.ID == "" {
			incident.ID = "INC-" + uuid.New().String()[:8]
		}
		
		// Run routing engine
		decision := s.router.RouteIncident(&incident)

		// Enqueue for prioritized delivery
		s.delivery.Enqueue(&incident, decision)

		// Proceed with saving the incident
		err := s.store.CreateIncident(ctx, &incident)
		if err != nil {
			return errors.New("failed to sync incident: " + incident.ID)
		}

		// Broadcast new incident to all connected clients
		s.hub.BroadcastEvent("incident_created", &incident)

		// Mark as processed
		s.mu.Lock()
		s.processedEvents[incident.ID] = true
		s.mu.Unlock()
	}

	return nil
}

// ProcessStatusUpdate handles feedback loop status changes.
func (s *SyncService) ProcessStatusUpdate(ctx context.Context, incidentID string, update *models.StatusUpdate) error {
	if update.ID == "" {
		update.ID = "UPD-" + uuid.New().String()[:8]
	}
	update.IncidentID = incidentID
	update.CreatedAt = time.Now()

	err := s.store.CreateStatusUpdate(ctx, update)
	if err != nil {
		return err
	}

	// Also update the incident's master status
	err = s.store.UpdateIncidentStatus(ctx, incidentID, update.Status)
	if err != nil {
		return err
	}

	// Broadcast status update
	s.hub.BroadcastEvent("status_update", update)
	
	// Broadcast full incident refresh signal
	updatedIncident, _ := s.store.GetIncidentByID(ctx, incidentID)
	if updatedIncident != nil {
		s.hub.BroadcastEvent("incident_updated", updatedIncident)
	}

	return nil
}
