package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port               string
	DatabaseURL        string
	JWTSecret          string
	JWTRefreshSecret   string
	GCSBucket          string
	GCSCredentials     string
	GCSCredentialsFile string
	GeminiAPIKey       string
	ReplicateAPIToken  string
	FrontendURL        string
	SMTPHost           string
	SMTPPort           string
	SMTPUser           string
	SMTPPass           string
	SMTPFrom           string
}

func Load() *Config {
	_ = godotenv.Load()

	return &Config{
		Port:              getEnv("PORT", "8080"),
		DatabaseURL:       getEnv("DATABASE_URL", ""),
		JWTSecret:         getEnv("JWT_SECRET", "change-me-in-production"),
		JWTRefreshSecret:  getEnv("JWT_REFRESH_SECRET", "change-me-refresh-in-production"),
		GCSBucket:          getEnv("GCS_BUCKET", "atelier-uploads-gcs"),
		GCSCredentials:     getEnv("GCS_CREDENTIALS_JSON", ""),
		GCSCredentialsFile: getEnv("GCS_CREDENTIALS_FILE", ""),
		GeminiAPIKey:      getEnv("GEMINI_API_KEY", ""),
		ReplicateAPIToken: getEnv("REPLICATE_API_TOKEN", ""),
		FrontendURL:        getEnv("FRONTEND_URL", "http://localhost:3000"),
		SMTPHost:           getEnv("SMTP_HOST", ""),
		SMTPPort:           getEnv("SMTP_PORT", "587"),
		SMTPUser:           getEnv("SMTP_USER", ""),
		SMTPPass:           getEnv("SMTP_PASS", ""),
		SMTPFrom:           getEnv("SMTP_FROM", "noreply@atelier.ai"),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
