package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"sync"
	"time"

	"emergency-response/internal/models"
)

const targetURL = "http://localhost:8085/api/v1/incidents"
const numRequests = 200 // Load test with 200 incidents

func main() {
	log.Println("Starting Output & Integration Load Test...")
	log.Printf("Target: %s", targetURL)
	log.Printf("Simulating %d concurrent incident reports...", numRequests)

	var wg sync.WaitGroup
	startTime := time.Now()

	for i := 0; i < numRequests; i++ {
		wg.Add(1)
		go func(id int) {
			defer wg.Done()
			sendRandomIncident(id)
		}(i)
	}

	wg.Wait()
	duration := time.Since(startTime)

	log.Println("-----------------------------------------------------")
	log.Printf("Load test completed in %v", duration)
	log.Printf("Throughput: %.2f req/sec", float64(numRequests)/duration.Seconds())
	log.Println("Please check the API server logs to verify Critical Priority incidents were handled before Low Priority incidents.")
}

func sendRandomIncident(id int) {
	types := []string{"Medical", "Fire", "Security", "Hazmat"}
	severities := []models.IncidentSeverity{models.SeverityLow, models.SeverityModerate, models.SeverityHigh, models.SeverityCritical}

	// Make it more likely to have Critical Medical emergencies
	severityIdx := rand.Intn(len(severities))
	typeIdx := rand.Intn(len(types))
	
	if id%5 == 0 {
		typeIdx = 0 // Medical
		severityIdx = 3 // Critical
	}

	incType := types[typeIdx]
	sev := severities[severityIdx]

	incident := models.Incident{
		Type:        incType,
		Title:       fmt.Sprintf("LoadTest-Incident-%d", id),
		Description: "Auto-generated incident for load testing",
		Severity:    sev,
		Status:      models.StatusReported,
		Location: models.LocationData{
			Latitude:  40.0 + rand.Float64(),
			Longitude: -74.0 - rand.Float64(),
		},
		ReporterID: "system-test",
		CreatedAt:  time.Now(),
	}

	body, _ := json.Marshal(incident)
	_, err := http.Post(targetURL, "application/json", bytes.NewBuffer(body))
	if err != nil {
		log.Printf("[Worker %d] Failed to send incident: %v", id, err)
	}
}
