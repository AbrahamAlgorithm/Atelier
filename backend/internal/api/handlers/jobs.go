package handlers

import (
	"context"
	"encoding/base64"
	"fmt"
	"net/http"
	"time"

	mw "atelier/backend/internal/api/middleware"
	"atelier/backend/internal/db"
	"atelier/backend/internal/models"
	"atelier/backend/internal/services/ai"
	"atelier/backend/internal/services/storage"
	"atelier/backend/internal/services/worker"

	"github.com/jackc/pgx/v5"
	"github.com/labstack/echo/v4"
)

type JobsHandler struct {
	db         *db.DB
	dispatcher *worker.Dispatcher
	s3         storage.StorageService
	gemini     *ai.GeminiService
}

func NewJobsHandler(database *db.DB, dispatcher *worker.Dispatcher, s3Svc storage.StorageService, geminiSvc *ai.GeminiService) *JobsHandler {
	return &JobsHandler{db: database, dispatcher: dispatcher, s3: s3Svc, gemini: geminiSvc}
}

// freshenOutputURLs replaces stored S3 URLs in output_files with fresh presigned
// GET URLs so any client (browser, Three.js) can load them without auth.
func (h *JobsHandler) freshenOutputURLs(ctx context.Context, out *models.JobOutputFiles) {
	out.ResultURL = h.s3.FreshenURL(ctx, out.ResultURL)
	out.PDFURL = h.s3.FreshenURL(ctx, out.PDFURL)
	for i := range out.PatternPieces {
		out.PatternPieces[i].SVGURL = h.s3.FreshenURL(ctx, out.PatternPieces[i].SVGURL)
	}
}

func (h *JobsHandler) GhostMannequinSync(c echo.Context) error {
	var body struct {
		ImageB64 string `json:"image_b64"`
		MimeType string `json:"mime_type"`
	}
	if err := c.Bind(&body); err != nil || body.ImageB64 == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "image_b64 is required")
	}

	imgBytes, err := base64.StdEncoding.DecodeString(body.ImageB64)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid base64 image")
	}

	mimeType := body.MimeType
	if mimeType == "" {
		mimeType = "image/jpeg"
	}

	ctx := c.Request().Context()
	userID := mw.UserID(c)

	job, err := h.db.CreateJob(ctx, userID, models.JobTypeGhostMannequin, models.JobInputFiles{})
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to create job")
	}

	resultBytes, resultMime, err := h.gemini.GhostMannequinFromBytes(ctx, imgBytes, mimeType)
	if err != nil {
		errMsg := err.Error()
		_ = h.db.UpdateJobStatus(ctx, job.ID, models.JobStatusFailed, nil, nil, &errMsg)
		return echo.NewHTTPError(http.StatusInternalServerError, "Our servers are temporarily busy. Please try again in a moment.")
	}

	ext := "png"
	if resultMime == "image/jpeg" {
		ext = "jpg"
	} else if resultMime == "image/webp" {
		ext = "webp"
	}
	key := fmt.Sprintf("processed/ghost/%s_%d.%s", job.ID, time.Now().UnixMilli(), ext)
	resultURL, err := h.s3.PutObject(ctx, key, resultMime, resultBytes)
	if err != nil {
		errMsg := err.Error()
		_ = h.db.UpdateJobStatus(ctx, job.ID, models.JobStatusFailed, nil, nil, &errMsg)
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to upload result")
	}

	outputFiles := &models.JobOutputFiles{ResultURL: resultURL}
	metadata := &models.JobMetadata{GarmentDescription: "Ghost mannequin effect applied"}
	_ = h.db.UpdateJobStatus(ctx, job.ID, models.JobStatusCompleted, outputFiles, metadata, nil)

	return c.JSON(http.StatusOK, map[string]string{
		"job_id":     job.ID,
		"result_url": resultURL,
	})
}

func (h *JobsHandler) PatternGeneratorSync(c echo.Context) error {
	var body struct {
		ImageB64 string `json:"image_b64"`
		MimeType string `json:"mime_type"`
	}
	if err := c.Bind(&body); err != nil || body.ImageB64 == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "image_b64 is required")
	}

	imgBytes, err := base64.StdEncoding.DecodeString(body.ImageB64)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid base64 image")
	}

	mimeType := body.MimeType
	if mimeType == "" {
		mimeType = "image/jpeg"
	}

	ctx := c.Request().Context()
	userID := mw.UserID(c)

	job, err := h.db.CreateJob(ctx, userID, models.JobTypePatternGenerator, models.JobInputFiles{})
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to create job")
	}

	resultBytes, resultMime, err := h.gemini.GeneratePatternImageFromBytes(ctx, imgBytes, mimeType)
	if err != nil {
		errMsg := err.Error()
		_ = h.db.UpdateJobStatus(ctx, job.ID, models.JobStatusFailed, nil, nil, &errMsg)
		return echo.NewHTTPError(http.StatusInternalServerError, "Our servers are temporarily busy. Please try again in a moment.")
	}

	ext := "png"
	if resultMime == "image/jpeg" {
		ext = "jpg"
	} else if resultMime == "image/webp" {
		ext = "webp"
	}
	key := fmt.Sprintf("processed/patterns/%s_%d.%s", job.ID, time.Now().UnixMilli(), ext)
	resultURL, err := h.s3.PutObject(ctx, key, resultMime, resultBytes)
	if err != nil {
		errMsg := err.Error()
		_ = h.db.UpdateJobStatus(ctx, job.ID, models.JobStatusFailed, nil, nil, &errMsg)
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to upload result")
	}

	outputFiles := &models.JobOutputFiles{ResultURL: resultURL}
	metadata := &models.JobMetadata{GarmentDescription: "Sewing pattern sheet generated"}
	_ = h.db.UpdateJobStatus(ctx, job.ID, models.JobStatusCompleted, outputFiles, metadata, nil)

	h.freshenOutputURLs(ctx, outputFiles)
	return c.JSON(http.StatusOK, map[string]string{
		"job_id":     job.ID,
		"result_url": outputFiles.ResultURL,
	})
}

func (h *JobsHandler) VirtualTryOnSync(c echo.Context) error {
	var body struct {
		DressB64   string `json:"dress_b64"`
		DressMime  string `json:"dress_mime"`
		PersonB64  string `json:"person_b64"`
		PersonMime string `json:"person_mime"`
	}
	if err := c.Bind(&body); err != nil || body.DressB64 == "" || body.PersonB64 == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "dress_b64 and person_b64 are required")
	}

	dressBytes, err := base64.StdEncoding.DecodeString(body.DressB64)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid base64 dress image")
	}
	personBytes, err := base64.StdEncoding.DecodeString(body.PersonB64)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid base64 person image")
	}

	dressMime := body.DressMime
	if dressMime == "" {
		dressMime = "image/jpeg"
	}
	personMime := body.PersonMime
	if personMime == "" {
		personMime = "image/jpeg"
	}

	ctx := c.Request().Context()
	userID := mw.UserID(c)

	job, err := h.db.CreateJob(ctx, userID, models.JobTypeVirtualTryOn, models.JobInputFiles{})
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to create job")
	}

	resultBytes, resultMime, err := h.gemini.VirtualTryOnFromBytes(ctx, dressBytes, dressMime, personBytes, personMime)
	if err != nil {
		errMsg := err.Error()
		_ = h.db.UpdateJobStatus(ctx, job.ID, models.JobStatusFailed, nil, nil, &errMsg)
		return echo.NewHTTPError(http.StatusInternalServerError, "Our servers are temporarily busy. Please try again in a moment.")
	}

	ext := "png"
	if resultMime == "image/jpeg" {
		ext = "jpg"
	} else if resultMime == "image/webp" {
		ext = "webp"
	}
	key := fmt.Sprintf("processed/tryon/%s_%d.%s", job.ID, time.Now().UnixMilli(), ext)
	resultURL, err := h.s3.PutObject(ctx, key, resultMime, resultBytes)
	if err != nil {
		errMsg := err.Error()
		_ = h.db.UpdateJobStatus(ctx, job.ID, models.JobStatusFailed, nil, nil, &errMsg)
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to upload result")
	}

	outputFiles := &models.JobOutputFiles{ResultURL: resultURL}
	metadata := &models.JobMetadata{GarmentDescription: "Virtual try-on composite generated"}
	_ = h.db.UpdateJobStatus(ctx, job.ID, models.JobStatusCompleted, outputFiles, metadata, nil)

	h.freshenOutputURLs(ctx, outputFiles)
	return c.JSON(http.StatusOK, map[string]string{
		"job_id":     job.ID,
		"result_url": outputFiles.ResultURL,
	})
}

func (h *JobsHandler) CreateGhostMannequin(c echo.Context) error {
	var body struct {
		DressURL string `json:"dress_url"`
	}
	if err := c.Bind(&body); err != nil || body.DressURL == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "dress_url is required")
	}

	userID := mw.UserID(c)
	job, err := h.db.CreateJob(c.Request().Context(), userID, models.JobTypeGhostMannequin, models.JobInputFiles{
		DressURL: body.DressURL,
	})
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to create job")
	}

	h.dispatcher.Enqueue(job)
	return c.JSON(http.StatusCreated, job)
}

func (h *JobsHandler) CreatePatternGenerator(c echo.Context) error {
	var body struct {
		DressURL string `json:"dress_url"`
	}
	if err := c.Bind(&body); err != nil || body.DressURL == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "dress_url is required")
	}

	userID := mw.UserID(c)
	job, err := h.db.CreateJob(c.Request().Context(), userID, models.JobTypePatternGenerator, models.JobInputFiles{
		DressURL: body.DressURL,
	})
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to create job")
	}

	h.dispatcher.Enqueue(job)
	return c.JSON(http.StatusCreated, job)
}

func (h *JobsHandler) CreateVirtualTryOn(c echo.Context) error {
	var body struct {
		DressURL  string `json:"dress_url"`
		PersonURL string `json:"person_url"`
	}
	if err := c.Bind(&body); err != nil || body.DressURL == "" || body.PersonURL == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "dress_url and person_url are required")
	}

	userID := mw.UserID(c)
	job, err := h.db.CreateJob(c.Request().Context(), userID, models.JobTypeVirtualTryOn, models.JobInputFiles{
		DressURL:  body.DressURL,
		PersonURL: body.PersonURL,
	})
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to create job")
	}

	h.dispatcher.Enqueue(job)
	return c.JSON(http.StatusCreated, job)
}

func (h *JobsHandler) GetDownloadURL(c echo.Context) error {
	jobID := c.Param("id")
	userID := mw.UserID(c)

	job, err := h.db.GetJob(c.Request().Context(), jobID, userID)
	if err == pgx.ErrNoRows {
		return echo.NewHTTPError(http.StatusNotFound, "job not found")
	}
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to fetch job")
	}

	var rawURL, filename string
	switch {
	case job.OutputFiles.ResultURL != "":
		rawURL = job.OutputFiles.ResultURL
		ext := "png"
		if job.Type == models.JobTypeVirtualTryOn {
			ext = "jpg"
		}
		filename = fmt.Sprintf("%s-%s.%s", string(job.Type), job.ID[:8], ext)
	case len(job.OutputFiles.PatternPieces) > 0:
		rawURL = job.OutputFiles.PatternPieces[0].SVGURL
		filename = fmt.Sprintf("patterns-%s.svg", job.ID[:8])
	default:
		return echo.NewHTTPError(http.StatusNotFound, "no output file available")
	}

	key := h.s3.KeyFromURL(rawURL)
	downloadURL, err := h.s3.PresignAttachmentURL(c.Request().Context(), key, filename)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to generate download URL")
	}
	return c.JSON(http.StatusOK, map[string]string{"download_url": downloadURL})
}

func (h *JobsHandler) DeleteJob(c echo.Context) error {
	jobID := c.Param("id")
	userID := mw.UserID(c)
	err := h.db.DeleteJob(c.Request().Context(), jobID, userID)
	if err == pgx.ErrNoRows {
		return echo.NewHTTPError(http.StatusNotFound, "job not found")
	}
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to delete job")
	}
	return c.NoContent(http.StatusNoContent)
}

func (h *JobsHandler) GetJob(c echo.Context) error {
	jobID := c.Param("id")
	userID := mw.UserID(c)

	job, err := h.db.GetJob(c.Request().Context(), jobID, userID)
	if err == pgx.ErrNoRows {
		return echo.NewHTTPError(http.StatusNotFound, "job not found")
	}
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to fetch job")
	}
	h.freshenOutputURLs(c.Request().Context(), &job.OutputFiles)
	return c.JSON(http.StatusOK, job)
}

func (h *JobsHandler) ListJobs(c echo.Context) error {
	userID := mw.UserID(c)
	jobs, err := h.db.ListUserJobs(c.Request().Context(), userID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to fetch jobs")
	}
	if jobs == nil {
		jobs = []*models.Job{}
	}
	for _, job := range jobs {
		h.freshenOutputURLs(c.Request().Context(), &job.OutputFiles)
	}
	return c.JSON(http.StatusOK, jobs)
}
