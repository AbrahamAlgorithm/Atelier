package handlers

import (
	"fmt"
	"net/http"
	"path/filepath"
	"strings"
	"time"

	mw "atelier/backend/internal/api/middleware"
	"atelier/backend/internal/services/storage"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

type UploadHandler struct {
	s3 storage.StorageService
}

func NewUploadHandler(s3 storage.StorageService) *UploadHandler {
	return &UploadHandler{s3: s3}
}

func (h *UploadHandler) Presign(c echo.Context) error {
	var body struct {
		Filename    string `json:"filename"`
		ContentType string `json:"content_type"`
	}
	if err := c.Bind(&body); err != nil || body.Filename == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "filename is required")
	}

	userID := mw.UserID(c)
	ext := filepath.Ext(body.Filename)
	key := fmt.Sprintf("uploads/%s/%d_%s%s", userID, time.Now().UnixMilli(), uuid.New().String()[:8], ext)

	contentType := body.ContentType
	if contentType == "" {
		contentType = contentTypeFromExt(ext)
	}

	result, err := h.s3.PresignUpload(c.Request().Context(), key, contentType)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to generate upload URL")
	}

	return c.JSON(http.StatusOK, result)
}

func contentTypeFromExt(ext string) string {
	switch strings.ToLower(ext) {
	case ".jpg", ".jpeg":
		return "image/jpeg"
	case ".png":
		return "image/png"
	case ".webp":
		return "image/webp"
	case ".gif":
		return "image/gif"
	default:
		return "application/octet-stream"
	}
}
