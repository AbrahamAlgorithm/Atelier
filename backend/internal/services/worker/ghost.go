package worker

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"path/filepath"
	"time"

	"atelier/backend/internal/models"
	"atelier/backend/internal/services/ai"
	"atelier/backend/internal/services/storage"
)

func processGhostMannequin(ctx context.Context, job *models.Job, geminiSvc *ai.GeminiService, s3 storage.StorageService) (*models.JobOutputFiles, *models.JobMetadata, error) {
	if job.InputFiles.DressURL == "" {
		return nil, nil, fmt.Errorf("dress_url is required")
	}

	// Presign the S3 URL so Gemini's fetch can read the private object
	dressKey := s3.KeyFromURL(job.InputFiles.DressURL)
	dressPresigned, err := s3.PresignDownload(ctx, dressKey)
	if err != nil {
		return nil, nil, fmt.Errorf("presign dress image: %w", err)
	}

	// Generate ghost mannequin image via Gemini image editing
	imgBytes, mimeType, err := geminiSvc.GhostMannequin(ctx, dressPresigned)
	if err != nil {
		return nil, nil, fmt.Errorf("ghost mannequin generation: %w", err)
	}

	ext := "png"
	if mimeType == "image/jpeg" || mimeType == "image/jpg" {
		ext = "jpg"
	} else if mimeType == "image/webp" {
		ext = "webp"
	}

	key := fmt.Sprintf("processed/ghost/%s_%d.%s", job.ID, time.Now().UnixMilli(), ext)
	resultURL, err := s3.PutObject(ctx, key, mimeType, imgBytes)
	if err != nil {
		return nil, nil, fmt.Errorf("upload ghost mannequin: %w", err)
	}

	outputFiles := &models.JobOutputFiles{
		ResultURL: resultURL,
	}
	metadata := &models.JobMetadata{
		GarmentDescription: "Ghost mannequin effect applied — model removed, garment floating",
	}
	return outputFiles, metadata, nil
}

func downloadURL(ctx context.Context, url string) ([]byte, error) {
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("download failed: status %d", resp.StatusCode)
	}
	return io.ReadAll(resp.Body)
}

func fileExt(url string) string {
	return filepath.Ext(url)
}
