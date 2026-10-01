package storage

import "context"

type PresignResult struct {
	UploadURL string `json:"upload_url"`
	FileURL   string `json:"file_url"`
	Key       string `json:"key"`
}

type StorageService interface {
	PutObject(ctx context.Context, key, contentType string, body []byte) (string, error)
	PresignUpload(ctx context.Context, key, contentType string) (*PresignResult, error)
	PresignDownload(ctx context.Context, key string) (string, error)
	PresignAttachmentURL(ctx context.Context, key, filename string) (string, error)
	PublicURL(key string) string
	KeyFromURL(rawURL string) string
	FreshenURL(ctx context.Context, rawURL string) string
}
