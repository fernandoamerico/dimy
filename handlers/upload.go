package handlers

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/fernandoamerico/dimy/db"
)

// UploadResponse is returned to the client after a successful upload
type UploadResponse struct {
	URL string `json:"url"`
}

// UploadHandler handles file uploads and routes them to local storage or Cloudflare R2
func UploadHandler(w http.ResponseWriter, r *http.Request) {
	// 1. Parse multipart form
	err := r.ParseMultipartForm(10 << 20) // 10 MB limit
	if err != nil {
		http.Error(w, "Unable to parse form", http.StatusBadRequest)
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "File is required", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// 2. Generate a unique filename
	filename := fmt.Sprintf("%d_%s", time.Now().UnixNano(), strings.ReplaceAll(header.Filename, " ", "_"))

	// 3. Check if Cloudflare R2 extension is enabled
	var r2Enabled bool
	err = db.Instance.QueryRow("SELECT enabled FROM extensions WHERE id = 'cloudflare_r2'").Scan(&r2Enabled)
	if err != nil && err != sql.ErrNoRows {
		http.Error(w, "Database error checking extension", http.StatusInternalServerError)
		return
	}

	var fileURL string

	if r2Enabled {
		// 4a. Upload to Cloudflare R2
		fileURL, err = uploadToR2(r.Context(), file, filename, header.Header.Get("Content-Type"))
		if err != nil {
			http.Error(w, "Failed to upload to R2: "+err.Error(), http.StatusInternalServerError)
			return
		}
	} else {
		// 4b. Upload to Local Storage
		fileURL, err = uploadToLocal(file, filename)
		if err != nil {
			http.Error(w, "Failed to save locally: "+err.Error(), http.StatusInternalServerError)
			return
		}
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(UploadResponse{URL: fileURL})
}

func uploadToLocal(file io.Reader, filename string) (string, error) {
	uploadDir := "./frontend/public/uploads"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		return "", err
	}

	dst, err := os.Create(filepath.Join(uploadDir, filename))
	if err != nil {
		return "", err
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		return "", err
	}

	return "/uploads/" + filename, nil
}

func uploadToR2(ctx context.Context, file io.Reader, filename string, contentType string) (string, error) {
	// Fetch credentials from database
	var accountId, accessKey, secretKey, bucketName, publicDomain string

	rows, err := db.Instance.Query(`
		SELECT key, value FROM system_configs 
		WHERE key IN ('r2_account_id', 'r2_access_key', 'r2_secret_key', 'r2_bucket', 'r2_public_domain')
	`)
	if err != nil {
		return "", err
	}
	defer rows.Close()

	for rows.Next() {
		var k, v string
		rows.Scan(&k, &v)
		switch k {
		case "r2_account_id":
			accountId = v
		case "r2_access_key":
			accessKey = v
		case "r2_secret_key":
			secretKey = v
		case "r2_bucket":
			bucketName = v
		case "r2_public_domain":
			publicDomain = v
		}
	}

	if accountId == "" || accessKey == "" || secretKey == "" || bucketName == "" {
		return "", fmt.Errorf("R2 credentials not fully configured in settings")
	}

	if publicDomain == "" {
		// fallback to standard R2 dev domain format if possible, or just fail
		return "", fmt.Errorf("R2 public domain must be configured")
	}

	r2Resolver := aws.EndpointResolverWithOptionsFunc(func(service, region string, options ...interface{}) (aws.Endpoint, error) {
		return aws.Endpoint{
			URL: fmt.Sprintf("https://%s.r2.cloudflarestorage.com", accountId),
		}, nil
	})

	cfg, err := config.LoadDefaultConfig(ctx,
		config.WithEndpointResolverWithOptions(r2Resolver),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(accessKey, secretKey, "")),
		config.WithRegion("auto"),
	)
	if err != nil {
		return "", err
	}

	client := s3.NewFromConfig(cfg)

	if contentType == "" {
		contentType = "application/octet-stream"
	}

	_, err = client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(bucketName),
		Key:         aws.String(filename),
		Body:        file,
		ContentType: aws.String(contentType),
	})
	if err != nil {
		return "", err
	}

	// Ensure the public domain doesn't have a trailing slash
	publicDomain = strings.TrimRight(publicDomain, "/")
	if !strings.HasPrefix(publicDomain, "http") {
		publicDomain = "https://" + publicDomain
	}

	return fmt.Sprintf("%s/%s", publicDomain, filename), nil
}
