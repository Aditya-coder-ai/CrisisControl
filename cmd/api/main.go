package main

import (
	"context"
	"log"

	"emergency-response/internal/api"
	"emergency-response/internal/service"
	"emergency-response/internal/store"
)

func main() {
	log.Println("Emergency Response System Backend initializing...")
	
	// Create the dependencies
	memoryStore := store.NewMemoryStore()
	hub := service.NewHub()
	router := service.NewRouter()
	
	// Create Package 4 Delivery Dependencies
	externalAPI := service.NewExternalAPIService()
	deliveryService := service.NewDeliveryService(externalAPI)
	
	// Start Delivery Workers
	deliveryService.Start(context.Background(), 3) // 3 concurrent priority workers
	
	syncService := service.NewSyncService(memoryStore, hub, router, deliveryService)
	
	server := api.NewServer(memoryStore, syncService, hub)
	
	addr := ":8085"
	log.Printf("Modules wired successfully. Starting server on %s", addr)
	
	if err := server.Start(addr); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
