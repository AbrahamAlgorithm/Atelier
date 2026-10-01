package worker

import (
	"context"
	"fmt"
	"time"

	"atelier/backend/internal/models"
	"atelier/backend/internal/services/ai"
	"atelier/backend/internal/services/storage"
)

func processVirtualTryOn(ctx context.Context, job *models.Job, geminiSvc *ai.GeminiService, replicate *ai.ReplicateService, s3 storage.StorageService) (*models.JobOutputFiles, *models.JobMetadata, error) {
	if job.InputFiles.DressURL == "" || job.InputFiles.PersonURL == "" {
		return nil, nil, fmt.Errorf("dress_url and person_url are required")
	}

	// Presign both S3 URLs so services can read the private objects
	dressKey := s3.KeyFromURL(job.InputFiles.DressURL)
	dressPresigned, err := s3.PresignDownload(ctx, dressKey)
	if err != nil {
		return nil, nil, fmt.Errorf("presign dress image: %w", err)
	}
	personKey := s3.KeyFromURL(job.InputFiles.PersonURL)
	personPresigned, err := s3.PresignDownload(ctx, personKey)
	if err != nil {
		return nil, nil, fmt.Errorf("presign person image: %w", err)
	}

	// Step 1: Generate garment description via Gemini Vision for better IDM-VTON results
	garmentDesc, err := geminiSvc.DescribeGarment(ctx, dressPresigned)
	if err != nil {
		garmentDesc = "a fashionable dress"
	}

	// Step 2: Run IDM-VTON with presigned URLs (Replicate fetches them server-side)
	resultURL, err := replicate.VirtualTryOn(ctx, dressPresigned, personPresigned, garmentDesc)
	if err != nil {
		return nil, nil, fmt.Errorf("virtual try-on: %w", err)
	}

	// Step 3: Download and re-upload to our S3
	imageBytes, err := downloadURL(ctx, resultURL)
	if err != nil {
		return nil, nil, fmt.Errorf("download try-on result: %w", err)
	}

	key := fmt.Sprintf("processed/tryon/%s_%d.jpg", job.ID, time.Now().UnixMilli())
	stableURL, err := s3.PutObject(ctx, key, "image/jpeg", imageBytes)
	if err != nil {
		return nil, nil, fmt.Errorf("upload try-on result: %w", err)
	}

	outputFiles := &models.JobOutputFiles{
		ResultURL: stableURL,
	}
	metadata := &models.JobMetadata{
		GarmentDescription: garmentDesc,
	}
	return outputFiles, metadata, nil
}
