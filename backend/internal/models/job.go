package models

import (
	"encoding/json"
	"time"
)

type JobType string
type JobStatus string

const (
	JobTypeGhostMannequin   JobType = "ghost_mannequin"
	JobTypePatternGenerator JobType = "pattern_generator"
	JobTypeVirtualTryOn     JobType = "virtual_tryon"
)

const (
	JobStatusPending    JobStatus = "pending"
	JobStatusProcessing JobStatus = "processing"
	JobStatusCompleted  JobStatus = "completed"
	JobStatusFailed     JobStatus = "failed"
)

type JobInputFiles struct {
	DressURL  string `json:"dress_url,omitempty"`
	PersonURL string `json:"person_url,omitempty"`
}

type PatternPiece struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	SVGURL      string `json:"svg_url"`
	Notes       string `json:"notes,omitempty"`
}

type JobOutputFiles struct {
	ResultURL     string         `json:"result_url,omitempty"`
	PatternPieces []PatternPiece `json:"pattern_pieces,omitempty"`
	PDFURL        string         `json:"pdf_url,omitempty"`
}

type JobMetadata struct {
	GarmentDescription string          `json:"garment_description,omitempty"`
	PatternAnalysis    json.RawMessage `json:"pattern_analysis,omitempty"`
}

type Job struct {
	ID          string          `json:"id"`
	UserID      string          `json:"user_id"`
	Type        JobType         `json:"type"`
	Status      JobStatus       `json:"status"`
	InputFiles  JobInputFiles   `json:"input_files"`
	OutputFiles JobOutputFiles  `json:"output_files"`
	Metadata    JobMetadata     `json:"metadata"`
	ErrorMsg    *string         `json:"error_msg,omitempty"`
	CreatedAt   time.Time       `json:"created_at"`
	UpdatedAt   time.Time       `json:"updated_at"`
	CompletedAt *time.Time      `json:"completed_at,omitempty"`
}
