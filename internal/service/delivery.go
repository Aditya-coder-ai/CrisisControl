package service

import (
	"context"
	"log"
	"time"

	"emergency-response/internal/models"
)

// DeliveryTask represents a single notification to be sent.
type DeliveryTask struct {
	IncidentID string
	Severity   models.IncidentSeverity
	Type       string
	Message    string
	Agency     models.AgencyNotification
	CreatedAt  time.Time
}

// DeliveryService manages the robust prioritized delivery of alerts.
type DeliveryService struct {
	// Channels for priority queuing
	criticalQueue chan DeliveryTask
	highQueue     chan DeliveryTask
	moderateQueue chan DeliveryTask
	lowQueue      chan DeliveryTask

	externalAPI *ExternalAPIService
}

func NewDeliveryService(extAPI *ExternalAPIService) *DeliveryService {
	ds := &DeliveryService{
		criticalQueue: make(chan DeliveryTask, 1000),
		highQueue:     make(chan DeliveryTask, 1000),
		moderateQueue: make(chan DeliveryTask, 1000),
		lowQueue:      make(chan DeliveryTask, 1000),
		externalAPI:   extAPI,
	}
	return ds
}

// Start begins processing the priority queues.
func (s *DeliveryService) Start(ctx context.Context, workers int) {
	for i := 0; i < workers; i++ {
		go s.worker(ctx, i)
	}
	log.Printf("Delivery Service started with %d workers", workers)
}

// Enqueue adds a delivery task to the appropriate queue based on severity.
func (s *DeliveryService) Enqueue(incident *models.Incident, decision *models.RoutingDecision) {
	task := DeliveryTask{
		IncidentID: incident.ID,
		Severity:   incident.Severity,
		Message:    "Automated Alert: " + incident.Title,
		Agency:     decision.Agency,
		CreatedAt:  time.Now(),
	}

	// Medical emergencies get bumped to critical priority routing if high
	if incident.Type == "Medical" && incident.Severity == models.SeverityHigh {
		task.Severity = models.SeverityCritical
	}

	switch task.Severity {
	case models.SeverityCritical:
		s.criticalQueue <- task
	case models.SeverityHigh:
		s.highQueue <- task
	case models.SeverityModerate:
		s.moderateQueue <- task
	default:
		s.lowQueue <- task
	}
	log.Printf("DELIVERY ENGINE: Enqueued %s Priority Task for Incident %s", task.Severity, task.IncidentID)
}

// worker constantly polls the priority channels, strictly favoring higher priority.
func (s *DeliveryService) worker(ctx context.Context, id int) {
	for {
		select {
		case <-ctx.Done():
			return
		default:
			// Strict priority dequeue: Check critical first, then high, etc.
			select {
			case task := <-s.criticalQueue:
				s.processTask(task, id)
				continue
			default:
			}

			select {
			case task := <-s.highQueue:
				s.processTask(task, id)
				continue
			default:
			}

			select {
			case task := <-s.moderateQueue:
				s.processTask(task, id)
				continue
			default:
			}

			select {
			case task := <-s.lowQueue:
				s.processTask(task, id)
				continue
			case <-time.After(50 * time.Millisecond):
				// Prevent tight loop when all queues are empty
			}
		}
	}
}

// processTask handles the multi-channel notification and external API calls.
func (s *DeliveryService) processTask(task DeliveryTask, workerID int) {
	log.Printf("[Worker %d] Processing %s Priority Task: %s", workerID, task.Severity, task.IncidentID)

	// 1. External API Integration
	if task.Agency.APIEndpoint != "" {
		err := s.externalAPI.NotifyAgency(task.Agency)
		if err != nil {
			log.Printf("[Worker %d] WARNING: API Integration failed for %s, falling back to Voice", workerID, task.Agency.AgencyName)
			s.sendVoiceFallback(task)
		}
	}

	// 2. Alert Delivery System: Dispatch Push / SMS
	s.sendPushNotification(task)
	if task.Severity == models.SeverityCritical || task.Severity == models.SeverityHigh {
		s.sendSMS(task)
	}
}

func (s *DeliveryService) sendPushNotification(task DeliveryTask) {
	// Simulate Push logic
	time.Sleep(10 * time.Millisecond) // Simulate latency
	// log.Printf("   -> PUSH sent for %s", task.IncidentID)
}

func (s *DeliveryService) sendSMS(task DeliveryTask) {
	// Simulate SMS logic
	time.Sleep(15 * time.Millisecond)
	// log.Printf("   -> SMS sent for %s", task.IncidentID)
}

func (s *DeliveryService) sendVoiceFallback(task DeliveryTask) {
	// Simulate secure voice fallback
	time.Sleep(20 * time.Millisecond)
	log.Printf("   -> VOICE FALLBACK sent for %s", task.IncidentID)
}
