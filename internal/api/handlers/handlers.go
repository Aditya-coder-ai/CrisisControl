package handlers

import (
	"encoding/json"
	"net/http"

	"emergency-response/internal/models"
	"emergency-response/internal/service"
	"emergency-response/internal/store"
)

type UIHandler struct {
	store       store.Store
	syncService *service.SyncService
	hub         *service.Hub
}

func NewUIHandler(s store.Store, syncSvc *service.SyncService, hub *service.Hub) *UIHandler {
	return &UIHandler{
		store:       s,
		syncService: syncSvc,
		hub:         hub,
	}
}

// RegisterRoutes utilizes Go 1.22's standardized HTTP routing
func (h *UIHandler) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("POST /api/v1/incidents", h.CreateIncident)
	mux.HandleFunc("GET /api/v1/incidents", h.ListIncidents)
	mux.HandleFunc("GET /api/v1/incidents/{id}", h.GetIncident)
	mux.HandleFunc("PATCH /api/v1/incidents/{id}/status", h.UpdateIncidentStatus)
	mux.HandleFunc("POST /api/v1/sync", h.SyncOfflineData)
	
	mux.HandleFunc("GET /api/v1/incidents/{id}/updates", h.ListStatusUpdates)
	mux.HandleFunc("POST /api/v1/incidents/{id}/updates", h.CreateStatusUpdate)

	mux.HandleFunc("GET /ws", func(w http.ResponseWriter, r *http.Request) {
		service.ServeWs(h.hub, w, r)
	})
}

func (h *UIHandler) CreateIncident(w http.ResponseWriter, r *http.Request) {
	var incident models.Incident
	if err := json.NewDecoder(r.Body).Decode(&incident); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// For synchronous creation from web form, use SyncService for its routing/broadcasting logic
	err := h.syncService.ProcessOfflinePayload(r.Context(), []models.Incident{incident})
	if err != nil {
		http.Error(w, "Failed to create incident: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte(`{"status": "incident_created"}`))
}

func (h *UIHandler) ListIncidents(w http.ResponseWriter, r *http.Request) {
	incidents, err := h.store.ListIncidents(r.Context(), nil)
	if err != nil {
		http.Error(w, "Failed to fetch incidents", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(incidents)
}

func (h *UIHandler) GetIncident(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	incident, err := h.store.GetIncidentByID(r.Context(), id)
	if err != nil {
		http.Error(w, "Incident not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(incident)
}

func (h *UIHandler) UpdateIncidentStatus(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	
	var payload struct {
		Status models.IncidentStatus `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Invalid payload", http.StatusBadRequest)
		return
	}

	err := h.syncService.ProcessStatusUpdate(r.Context(), id, &models.StatusUpdate{
		Status: payload.Status,
		Note: "Status updated directly",
		IsInternal: true,
	})
	if err != nil {
		http.Error(w, "Failed to update incident", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *UIHandler) ListStatusUpdates(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	updates, err := h.store.ListStatusUpdates(r.Context(), id)
	if err != nil {
		http.Error(w, "Failed to get updates", http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(updates)
}

func (h *UIHandler) CreateStatusUpdate(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	
	var update models.StatusUpdate
	if err := json.NewDecoder(r.Body).Decode(&update); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	err := h.syncService.ProcessStatusUpdate(r.Context(), id, &update)
	if err != nil {
		http.Error(w, "Failed to process update", http.StatusInternalServerError)
		return
	}
	
	w.WriteHeader(http.StatusCreated)
}

func (h *UIHandler) SyncOfflineData(w http.ResponseWriter, r *http.Request) {
	var payload []models.Incident
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Invalid sync payload", http.StatusBadRequest)
		return
	}

	err := h.syncService.ProcessOfflinePayload(r.Context(), payload)
	if err != nil {
		http.Error(w, "Sync failed: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status": "sync_successful"}`))
}
