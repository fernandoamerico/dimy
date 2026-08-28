package main

import (
	"database/sql"
	"fmt"
	"log"

	_ "modernc.org/sqlite"
)

func main() {
	db, err := sql.Open("sqlite", "file:./dev.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	rows, err := db.Query("SELECT name FROM sqlite_master WHERE type='table'")
	if err != nil {
		log.Fatal("Error querying tables:", err)
	}
	defer rows.Close()

	fmt.Println("TABLES in dev.db:")
	for rows.Next() {
		var name string
		rows.Scan(&name)
		fmt.Printf("- %s\n", name)
	}
}
