package main

import (
	"database/sql"
	"fmt"
	_ "modernc.org/sqlite"
)

func main() {
	db, err := sql.Open("sqlite", "./dev.db")
	if err != nil {
		panic(err)
	}
	defer db.Close()

	var id string
	err = db.QueryRow("SELECT id FROM schema_collections WHERE slug = 'banners'").Scan(&id)
	if err != nil {
		fmt.Println("Already deleted or not found.")
		return
	}

	_, err = db.Exec("DELETE FROM schema_fields WHERE collection_id = ?", id)
	if err != nil {
		panic(err)
	}

	_, err = db.Exec("DELETE FROM schema_collections WHERE id = ?", id)
	if err != nil {
		panic(err)
	}

	fmt.Println("Banners collection deleted successfully.")
}
