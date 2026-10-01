package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"atelier/backend/internal/api"
	"atelier/backend/internal/db"
	"atelier/backend/internal/services/ai"
	"atelier/backend/internal/services/auth"
	"atelier/backend/internal/services/email"
	"atelier/backend/internal/services/storage"
	"atelier/backend/internal/services/worker"
	"atelier/backend/pkg/config"

	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {
	cfg := config.Load()

	// Database
	pool, err := pgxpool.New(context.Background(), cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("connect to database: %v", err)
	}
	defer pool.Close()

	if err := pool.Ping(context.Background()); err != nil {
		log.Fatalf("ping database: %v", err)
	}
	log.Println("database connected")

	// Auto-migrate
	if err := db.RunMigrations(context.Background(), pool); err != nil {
		log.Fatalf("run migrations: %v", err)
	}
	log.Println("migrations applied")

	database := db.New(pool)

	// Services
	authSvc := auth.New(cfg.JWTSecret, cfg.JWTRefreshSecret)

	gcsCredentials := cfg.GCSCredentials
	if cfg.GCSCredentialsFile != "" {
		gcsCredentials = cfg.GCSCredentialsFile
	}
	s3Svc, err := storage.NewGCS(context.Background(), cfg.GCSBucket, gcsCredentials)
	if err != nil {
		log.Fatalf("init gcs: %v", err)
	}

	emailSvc := email.New(cfg.SMTPHost, cfg.SMTPPort, cfg.SMTPUser, cfg.SMTPPass, cfg.SMTPFrom)

	geminiSvc := ai.NewGemini(cfg.GeminiAPIKey)
	replicateSvc := ai.NewReplicate(cfg.ReplicateAPIToken)

	// Worker dispatcher
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	dispatcher := worker.NewDispatcher(database, geminiSvc, replicateSvc, s3Svc)
	dispatcher.Start(ctx, 4)

	// HTTP server
	e := api.NewRouter(cfg, database, authSvc, emailSvc, s3Svc, geminiSvc, replicateSvc, dispatcher)

	go func() {
		if err := e.Start(":" + cfg.Port); err != nil {
			log.Printf("server stopped: %v", err)
		}
	}()
	log.Printf("Atelier API running on :%s", cfg.Port)

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer shutdownCancel()
	if err := e.Shutdown(shutdownCtx); err != nil {
		log.Printf("shutdown error: %v", err)
	}
}
