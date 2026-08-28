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

	rows, err := db.Query("SELECT id, name, email FROM users LIMIT 5")
	if err != nil {
		log.Println("Error querying users:", err)
	} else {
		fmt.Println("USERS in dev.db:")
		for rows.Next() {
			var id string
			var name sql.NullString
			var email string
			rows.Scan(&id, &name, &email)
			fmt.Printf("- %s | %v | %s\n", id, name.String, email)
		}
		rows.Close()
	}

	var total int
	db.QueryRow("SELECT COUNT(*) FROM users").Scan(&total)
	fmt.Printf("Total users: %d\n", total)
}
