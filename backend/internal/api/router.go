package api

import (
	"net/http"
	"strings"

	"atelier/backend/internal/api/handlers"
	mw "atelier/backend/internal/api/middleware"
	"atelier/backend/internal/db"
	"atelier/backend/internal/services/ai"
	"atelier/backend/internal/services/auth"
	"atelier/backend/internal/services/email"
	"atelier/backend/internal/services/storage"
	"atelier/backend/internal/services/worker"
	"atelier/backend/pkg/config"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func NewRouter(cfg *config.Config, database *db.DB, authSvc *auth.Service, emailSvc *email.Service, s3Svc storage.StorageService, geminiSvc *ai.GeminiService, replicateSvc *ai.ReplicateService, dispatcher *worker.Dispatcher) *echo.Echo {
	e := echo.New()
	e.HideBanner = true

	e.Use(middleware.Recover())
	e.Use(middleware.Logger())
	origins := strings.Split(cfg.FrontendURL, ",")
	for i, o := range origins {
		origins[i] = strings.TrimSpace(o)
	}
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:     origins,
		AllowMethods:     []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete, http.MethodOptions},
		AllowHeaders:     []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, echo.HeaderAuthorization},
		AllowCredentials: true,
	}))

	authH := handlers.NewAuthHandler(database, authSvc, emailSvc, cfg.FrontendURL)
	uploadH := handlers.NewUploadHandler(s3Svc)
	jobsH := handlers.NewJobsHandler(database, dispatcher, s3Svc, geminiSvc)
	projectsH := handlers.NewProjectsHandler(database)

	v1 := e.Group("/api/v1")

	// Auth (public)
	v1.POST("/auth/register", authH.Register)
	v1.POST("/auth/login", authH.Login)
	v1.POST("/auth/refresh", authH.Refresh)
	v1.DELETE("/auth/logout", authH.Logout)
	v1.POST("/auth/forgot-password", authH.ForgotPassword)
	v1.POST("/auth/reset-password", authH.ResetPassword)

	// Protected
	protected := v1.Group("", mw.JWT(authSvc))

	protected.GET("/auth/me", authH.Me)

	protected.POST("/upload/presign", uploadH.Presign)

	protected.POST("/ghost-mannequin/sync", jobsH.GhostMannequinSync)
	protected.POST("/pattern-generator/sync", jobsH.PatternGeneratorSync)
	protected.POST("/virtual-tryon/sync", jobsH.VirtualTryOnSync)

	protected.POST("/jobs/ghost-mannequin", jobsH.CreateGhostMannequin)
	protected.POST("/jobs/pattern-generator", jobsH.CreatePatternGenerator)
	protected.POST("/jobs/virtual-tryon", jobsH.CreateVirtualTryOn)
	protected.GET("/jobs/:id", jobsH.GetJob)
	protected.GET("/jobs/:id/download", jobsH.GetDownloadURL)
	protected.DELETE("/jobs/:id", jobsH.DeleteJob)
	protected.GET("/jobs", jobsH.ListJobs)

	protected.POST("/projects", projectsH.Create)
	protected.GET("/projects", projectsH.List)
	protected.GET("/projects/:id", projectsH.Get)
	protected.DELETE("/projects/:id", projectsH.Delete)

	e.GET("/health", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{"status": "ok"})
	})

	return e
}
