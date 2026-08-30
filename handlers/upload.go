package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"image"
	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/google/uuid"
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
	mimeType := header.Header.Get("Content-Type")
	fileSize := header.Size

	var dimensions string
	if strings.HasPrefix(mimeType, "image/") {
		if img, _, err := image.Decode(file); err == nil {
			bounds := img.Bounds()
			dimensions = fmt.Sprintf("%dx%d", bounds.Dx(), bounds.Dy())
		}
		file.Seek(0, io.SeekStart) // reset seek
	}

	// 3. Check if extensions are enabled
	var r2Enabled bool
	db.Instance.QueryRow("SELECT enabled FROM extensions WHERE id = 'cloudflare_r2'").Scan(&r2Enabled)

	var supabaseEnabled bool
	db.Instance.QueryRow("SELECT enabled FROM extensions WHERE id = 'supabase_storage'").Scan(&supabaseEnabled)

	var fileURL string
	var errUpload error

	if r2Enabled {
		// 4a. Upload to Cloudflare R2
		fileURL, errUpload = uploadToR2(r.Context(), file, filename, header.Header.Get("Content-Type"))
		if errUpload != nil {
			http.Error(w, "Failed to upload to R2: "+errUpload.Error(), http.StatusInternalServerError)
			return
		}
	} else if supabaseEnabled {
		// 4b. Upload to Supabase Storage
		fileURL, errUpload = uploadToSupabase(file, filename, header.Header.Get("Content-Type"))
		if errUpload != nil {
			http.Error(w, "Failed to upload to Supabase: "+errUpload.Error(), http.StatusInternalServerError)
			return
		}
	} else {
		// 4c. Upload to Local Storage
		fileURL, errUpload = uploadToLocal(file, filename)
		if errUpload != nil {
			http.Error(w, "Failed to save locally: "+errUpload.Error(), http.StatusInternalServerError)
			return
		}
	}

	// 5. Save to media_files table
	mediaID := uuid.New().String()
	_, errDb := db.Instance.Exec(`INSERT INTO media_files 
		(id, name, filename, url, size, mime_type, dimensions, alt, comment) 
		VALUES ($1, $2, $3, $4, $5, $6, $7, '', '')`,
		mediaID, header.Filename, filename, fileURL, fileSize, mimeType, dimensions)
	if errDb != nil {
		fmt.Println("Warning: Failed to save media_files record:", errDb)
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

func uploadToSupabase(file io.Reader, filename string, contentType string) (string, error) {
	var supabaseUrl, supabaseKey, bucketName string

	rows, err := db.Instance.Query(`
		SELECT key, value FROM system_configs 
		WHERE key IN ('supabase_storage_url', 'supabase_storage_key', 'supabase_storage_bucket')
	`)
	if err != nil {
		return "", err
	}
	defer rows.Close()

	for rows.Next() {
		var k, v string
		rows.Scan(&k, &v)
		switch k {
		case "supabase_storage_url":
			supabaseUrl = v
		case "supabase_storage_key":
			supabaseKey = v
		case "supabase_storage_bucket":
			bucketName = v
		}
	}

	if supabaseUrl == "" || supabaseKey == "" || bucketName == "" {
		return "", fmt.Errorf("Supabase Storage não configurado corretamente")
	}

	// Remove trailing slash from URL if present
	supabaseUrl = strings.TrimRight(supabaseUrl, "/")

	uploadUrl := fmt.Sprintf("%s/storage/v1/object/%s/%s", supabaseUrl, bucketName, filename)

	req, err := http.NewRequest("POST", uploadUrl, file)
	if err != nil {
		return "", err
	}

	if contentType == "" {
		contentType = "application/octet-stream"
	}

	req.Header.Set("Authorization", "Bearer "+supabaseKey)
	req.Header.Set("Content-Type", contentType)

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("Erro no Supabase: %s - %s", resp.Status, string(body))
	}

	// Supabase public URL format: {supabaseUrl}/storage/v1/object/public/{bucketName}/{filename}
	publicUrl := fmt.Sprintf("%s/storage/v1/object/public/%s/%s", supabaseUrl, bucketName, filename)
	
	return publicUrl, nil
}

func TestSupabaseConnectionHandler(w http.ResponseWriter, r *http.Request) {
	var supabaseUrl, supabaseKey, bucketName string

	rows, err := db.Instance.Query(`
		SELECT key, value FROM system_configs 
		WHERE key IN ('supabase_storage_url', 'supabase_storage_key', 'supabase_storage_bucket')
	`)
	if err != nil {
		http.Error(w, "Erro ao buscar credenciais no banco", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var k, v string
		rows.Scan(&k, &v)
		switch k {
		case "supabase_storage_url":
			supabaseUrl = v
		case "supabase_storage_key":
			supabaseKey = v
		case "supabase_storage_bucket":
			bucketName = v
		}
	}

	if supabaseUrl == "" || supabaseKey == "" || bucketName == "" {
		http.Error(w, "Credenciais incompletas. Preencha todos os campos e salve antes de testar.", http.StatusBadRequest)
		return
	}

	supabaseUrl = strings.TrimRight(supabaseUrl, "/")
	
	// Test by getting bucket details
	testUrl := fmt.Sprintf("%s/storage/v1/bucket/%s", supabaseUrl, bucketName)

	req, err := http.NewRequest("GET", testUrl, nil)
	if err != nil {
		http.Error(w, "Erro ao criar requisição HTTP", http.StatusInternalServerError)
		return
	}

	req.Header.Set("Authorization", "Bearer "+supabaseKey)

	client := &http.Client{Timeout: 15 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		http.Error(w, "Erro de rede ao conectar com o Supabase: "+err.Error(), http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		body, _ := io.ReadAll(resp.Body)
		http.Error(w, fmt.Sprintf("Supabase retornou erro %s: %s", resp.Status, string(body)), http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Conexão bem-sucedida!"))
}
