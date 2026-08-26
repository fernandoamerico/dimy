package main

import (
	"log"
	"os"
	
	"github.com/fernandoamerico/dimy/api"
	"github.com/fernandoamerico/dimy/db"
)

func main() {
	log.Println("Starting Dimy CMS...")

	// 1. Initialize Database
	err := db.Connect()
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer db.Instance.Close()
	log.Println("Database connected and migrations applied.")

	// 2. Start HTTP Server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	
	err = api.StartServer(port)
	if err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
