package models

import "time"

type Project struct {
	ID           string    `json:"id"`
	UserID       string    `json:"user_id"`
	JobID        string    `json:"job_id"`
	Name         string    `json:"name"`
	ThumbnailURL *string   `json:"thumbnail_url,omitempty"`
	CreatedAt    time.Time `json:"created_at"`
	Job          *Job      `json:"job,omitempty"`
}
