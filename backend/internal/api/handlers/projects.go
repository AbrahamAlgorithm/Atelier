package handlers

import (
	"net/http"

	mw "atelier/backend/internal/api/middleware"
	"atelier/backend/internal/db"
	"atelier/backend/internal/models"

	"github.com/jackc/pgx/v5"
	"github.com/labstack/echo/v4"
)

type ProjectsHandler struct {
	db *db.DB
}

func NewProjectsHandler(database *db.DB) *ProjectsHandler {
	return &ProjectsHandler{db: database}
}

func (h *ProjectsHandler) Create(c echo.Context) error {
	var body struct {
		JobID        string  `json:"job_id"`
		Name         string  `json:"name"`
		ThumbnailURL *string `json:"thumbnail_url,omitempty"`
	}
	if err := c.Bind(&body); err != nil || body.JobID == "" || body.Name == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "job_id and name are required")
	}

	userID := mw.UserID(c)
	project, err := h.db.CreateProject(c.Request().Context(), userID, body.JobID, body.Name, body.ThumbnailURL)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to save project")
	}
	return c.JSON(http.StatusCreated, project)
}

func (h *ProjectsHandler) List(c echo.Context) error {
	userID := mw.UserID(c)
	projects, err := h.db.ListProjects(c.Request().Context(), userID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to fetch projects")
	}
	if projects == nil {
		projects = []*models.Project{}
	}
	return c.JSON(http.StatusOK, projects)
}

func (h *ProjectsHandler) Get(c echo.Context) error {
	projectID := c.Param("id")
	userID := mw.UserID(c)
	project, err := h.db.GetProject(c.Request().Context(), projectID, userID)
	if err == pgx.ErrNoRows {
		return echo.NewHTTPError(http.StatusNotFound, "project not found")
	}
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to fetch project")
	}
	return c.JSON(http.StatusOK, project)
}

func (h *ProjectsHandler) Delete(c echo.Context) error {
	projectID := c.Param("id")
	userID := mw.UserID(c)
	if err := h.db.DeleteProject(c.Request().Context(), projectID, userID); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to delete project")
	}
	return c.NoContent(http.StatusNoContent)
}
