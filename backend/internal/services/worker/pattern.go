package worker

import (
	"context"
	"fmt"
	"strings"
	"time"

	"atelier/backend/internal/models"
	"atelier/backend/internal/services/ai"
	"atelier/backend/internal/services/storage"
)

func processPatternGenerator(ctx context.Context, job *models.Job, geminiSvc *ai.GeminiService, s3 storage.StorageService) (*models.JobOutputFiles, *models.JobMetadata, error) {
	if job.InputFiles.DressURL == "" {
		return nil, nil, fmt.Errorf("dress_url is required")
	}

	dressKey := s3.KeyFromURL(job.InputFiles.DressURL)
	dressPresigned, err := s3.PresignDownload(ctx, dressKey)
	if err != nil {
		return nil, nil, fmt.Errorf("presign dress image: %w", err)
	}

	resultBytes, resultMime, err := geminiSvc.GeneratePatternImage(ctx, dressPresigned)
	if err != nil {
		return nil, nil, fmt.Errorf("generate pattern image: %w", err)
	}

	ext := "png"
	if resultMime == "image/jpeg" {
		ext = "jpg"
	} else if resultMime == "image/webp" {
		ext = "webp"
	}
	key := fmt.Sprintf("processed/patterns/%s_%d.%s", job.ID, time.Now().UnixMilli(), ext)
	resultURL, err := s3.PutObject(ctx, key, resultMime, resultBytes)
	if err != nil {
		return nil, nil, fmt.Errorf("upload pattern image: %w", err)
	}

	return &models.JobOutputFiles{ResultURL: resultURL},
		&models.JobMetadata{GarmentDescription: "Sewing pattern sheet generated"},
		nil
}

// GeneratePatternSVG creates a simplified sewing pattern SVG for a piece.
func GeneratePatternSVG(piece ai.PatternPieceAnalysis) string {
	const baseWidth = 400
	const baseHeight = 500
	const margin = 30
	const seamAllowance = 20

	w := int(float64(baseWidth) * piece.WidthRatio * 2.5)
	if w < 120 {
		w = 120
	}
	if w > 380 {
		w = 380
	}

	h := int(float64(baseHeight) * piece.HeightRatio * 2.0)
	if h < 100 {
		h = 100
	}
	if h > 460 {
		h = 460
	}

	svgW := w + 2*margin + seamAllowance*2
	svgH := h + 2*margin + seamAllowance*2

	x0 := margin + seamAllowance
	y0 := margin + seamAllowance

	var shape string
	switch piece.ShapeType {
	case "trapezoid":
		offset := w / 6
		shape = fmt.Sprintf(`<polygon points="%d,%d %d,%d %d,%d %d,%d" fill="none" stroke="#0f1012" stroke-width="1.5"/>`,
			x0+offset, y0,
			x0+w-offset, y0,
			x0+w, y0+h,
			x0, y0+h)
	default:
		shape = fmt.Sprintf(`<rect x="%d" y="%d" width="%d" height="%d" fill="none" stroke="#0f1012" stroke-width="1.5"/>`,
			x0, y0, w, h)
	}

	// Seam allowance outline (dashed)
	seamRect := fmt.Sprintf(`<rect x="%d" y="%d" width="%d" height="%d" fill="none" stroke="#8f8f8f" stroke-width="1" stroke-dasharray="4,3"/>`,
		margin, margin, w+seamAllowance*2, h+seamAllowance*2)

	// Grain line (vertical center)
	cx := x0 + w/2
	grainLine := fmt.Sprintf(`<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="#0071e3" stroke-width="1.5"/>
<polygon points="%d,%d %d,%d %d,%d" fill="#0071e3"/>
<polygon points="%d,%d %d,%d %d,%d" fill="#0071e3"/>`,
		cx, y0+10, cx, y0+h-10,
		cx-5, y0+20, cx+5, y0+20, cx, y0+10,
		cx-5, y0+h-20, cx+5, y0+h-20, cx, y0+h-10)

	// Labels
	title := fmt.Sprintf(`<text x="%d" y="%d" font-family="Inter, sans-serif" font-size="13" font-weight="400" fill="#0f1012" text-anchor="middle" letter-spacing="-0.3">%s</text>`,
		svgW/2, svgH-8, piece.Name)

	notes := ""
	if piece.Notes != "" {
		notes = fmt.Sprintf(`<text x="%d" y="%d" font-family="Inter, sans-serif" font-size="10" fill="#8f8f8f" text-anchor="middle" letter-spacing="-0.2">%s</text>`,
			svgW/2, svgH-22, piece.Notes)
	}

	seam := fmt.Sprintf(`<text x="%d" y="%d" font-family="Inter, sans-serif" font-size="9" fill="#8f8f8f" text-anchor="start" letter-spacing="-0.2">SA: %.1fcm</text>`,
		margin, margin-5, piece.SeamAllowanceCm)

	return fmt.Sprintf(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 %d %d">
  <rect width="%d" height="%d" fill="#faf9f5"/>
  %s
  %s
  %s
  %s
  %s
  %s
</svg>`, svgW, svgH, svgW, svgH, svgW, svgH, seamRect, shape, grainLine, title, notes, seam)
}

func SanitizeFilename(s string) string {
	r := strings.NewReplacer(" ", "_", "/", "_", "\\", "_", ":", "_")
	return strings.ToLower(r.Replace(s))
}
