package ai

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

type GeminiService struct {
	apiKey string
	client *http.Client
}

func NewGemini(apiKey string) *GeminiService {
	return &GeminiService{
		apiKey: apiKey,
		client: &http.Client{Timeout: 3 * time.Minute},
	}
}

// ── Shared analysis types ─────────────────────────────────────────────────────

type PatternPieceAnalysis struct {
	Name            string  `json:"name"`
	Description     string  `json:"description"`
	WidthRatio      float64 `json:"width_ratio"`
	HeightRatio     float64 `json:"height_ratio"`
	SeamAllowanceCm float64 `json:"seam_allowance_cm"`
	Notes           string  `json:"notes"`
	ShapeType       string  `json:"shape_type"` // rectangle, trapezoid, curved
}

type GarmentAnalysis struct {
	GarmentType         string                 `json:"garment_type"`
	Description         string                 `json:"description"`
	Pieces              []PatternPieceAnalysis `json:"pieces"`
	EstimatedDifficulty string                 `json:"estimated_difficulty"`
}

// ── REST request/response types ───────────────────────────────────────────────

type geminiRequest struct {
	Contents          []geminiContent        `json:"contents"`
	GenerationConfig  geminiGenerationConfig `json:"generationConfig,omitempty"`
	SystemInstruction *geminiContent         `json:"systemInstruction,omitempty"`
}

type geminiContent struct {
	Parts []geminiPart `json:"parts"`
	Role  string       `json:"role,omitempty"`
}

type geminiPart struct {
	Text       string      `json:"text,omitempty"`
	InlineData *geminiBlob `json:"inlineData,omitempty"` // camelCase per Gemini REST spec
}

type geminiBlob struct {
	MIMEType string `json:"mimeType"`
	Data     string `json:"data"` // base64-encoded
}

type geminiGenerationConfig struct {
	ResponseMIMEType   string   `json:"responseMimeType,omitempty"`
	MaxOutputTokens    int      `json:"maxOutputTokens,omitempty"`
	ResponseModalities []string `json:"responseModalities,omitempty"`
}

// geminiResponsePart handles both text and image parts in the response.
type geminiResponsePart struct {
	Text       string      `json:"text,omitempty"`
	InlineData *geminiBlob `json:"inlineData,omitempty"`
}

type geminiResponse struct {
	Candidates []struct {
		Content struct {
			Parts []geminiResponsePart `json:"parts"`
		} `json:"content"`
	} `json:"candidates"`
	Error *struct {
		Code    int    `json:"code"`
		Message string `json:"message"`
	} `json:"error"`
}

// ── Helpers ───────────────────────────────────────────────────────────────────

func (g *GeminiService) fetchImage(ctx context.Context, url string) ([]byte, string, error) {
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, "", err
	}
	resp, err := g.client.Do(req)
	if err != nil {
		return nil, "", err
	}
	defer resp.Body.Close()
	data, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, "", err
	}
	if resp.StatusCode != http.StatusOK {
		return nil, "", fmt.Errorf("fetch image HTTP %d: %.200s", resp.StatusCode, string(data))
	}
	ct := resp.Header.Get("Content-Type")
	if idx := strings.IndexByte(ct, ';'); idx != -1 {
		ct = ct[:idx]
	}
	ct = strings.TrimSpace(ct)
	// Fall back to jpeg for missing or non-image content types (e.g. application/octet-stream)
	if ct == "" || !strings.HasPrefix(ct, "image/") {
		ct = "image/jpeg"
	}
	return data, ct, nil
}

func geminiSleep(ctx context.Context, d time.Duration) error {
	select {
	case <-ctx.Done():
		return ctx.Err()
	case <-time.After(d):
		return nil
	}
}

func (g *GeminiService) call(ctx context.Context, model string, req geminiRequest) (*geminiResponse, []byte, error) {
	body, err := json.Marshal(req)
	if err != nil {
		return nil, nil, err
	}

	apiURL := fmt.Sprintf(
		"https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
		model, g.apiKey,
	)

	retryDelays := []time.Duration{2 * time.Second, 5 * time.Second, 10 * time.Second}
	for attempt := 0; ; attempt++ {
		httpReq, err := http.NewRequestWithContext(ctx, "POST", apiURL, bytes.NewReader(body))
		if err != nil {
			return nil, nil, err
		}
		httpReq.Header.Set("Content-Type", "application/json")

		resp, err := g.client.Do(httpReq)
		if err != nil {
			if attempt < len(retryDelays) {
				if sleepErr := geminiSleep(ctx, retryDelays[attempt]); sleepErr != nil {
					return nil, nil, sleepErr
				}
				continue
			}
			return nil, nil, err
		}

		data, readErr := io.ReadAll(resp.Body)
		resp.Body.Close()
		if readErr != nil {
			return nil, nil, readErr
		}

		var gemResp geminiResponse
		if err := json.Unmarshal(data, &gemResp); err != nil {
			return nil, data, fmt.Errorf("parse gemini response: %w (body: %.300s)", err, string(data))
		}
		if gemResp.Error != nil {
			// Retry on transient overload / rate-limit responses
			if (gemResp.Error.Code == 503 || gemResp.Error.Code == 429) && attempt < len(retryDelays) {
				if sleepErr := geminiSleep(ctx, retryDelays[attempt]); sleepErr != nil {
					return nil, nil, sleepErr
				}
				continue
			}
			return nil, data, fmt.Errorf("gemini error %d: %s", gemResp.Error.Code, gemResp.Error.Message)
		}
		if len(gemResp.Candidates) == 0 || len(gemResp.Candidates[0].Content.Parts) == 0 {
			return nil, data, fmt.Errorf("empty gemini response (body: %.300s)", string(data))
		}
		return &gemResp, data, nil
	}
}

// generateText sends a text+vision request and returns the first text part.
func (g *GeminiService) generateText(ctx context.Context, req geminiRequest) (string, error) {
	gemResp, _, err := g.call(ctx, "gemini-2.0-flash", req)
	if err != nil {
		return "", err
	}
	for _, part := range gemResp.Candidates[0].Content.Parts {
		if part.Text != "" {
			return part.Text, nil
		}
	}
	return "", fmt.Errorf("no text part in gemini response")
}

// generateImage sends a request to the image-generation model and returns
// the raw image bytes plus MIME type from the first inlineData part.
func (g *GeminiService) generateImage(ctx context.Context, req geminiRequest) ([]byte, string, error) {
	gemResp, raw, err := g.call(ctx, "gemini-2.5-flash-image", req)
	if err != nil {
		return nil, "", err
	}
	for _, part := range gemResp.Candidates[0].Content.Parts {
		if part.InlineData != nil && part.InlineData.Data != "" {
			imgBytes, decErr := base64.StdEncoding.DecodeString(part.InlineData.Data)
			if decErr != nil {
				return nil, "", fmt.Errorf("decode image bytes: %w", decErr)
			}
			return imgBytes, part.InlineData.MIMEType, nil
		}
	}
	return nil, "", fmt.Errorf("no image part in gemini response (body: %.300s)", string(raw))
}

// ── Public API ────────────────────────────────────────────────────────────────

// GhostMannequinFromBytes accepts raw image bytes directly, skipping the S3 fetch step.
func (g *GeminiService) GhostMannequinFromBytes(ctx context.Context, imgBytes []byte, mimeType string) ([]byte, string, error) {
	prompt := `Transform this image. Remove the person wearing the dress and recreate the dress as a "ghost mannequin" product shot. The dress should maintain its 3D shape as if worn by an invisible body. Ensure clean edges and internal garment details (like labels or inner lining) are visible where the person's neck/arms were. Background should be solid ivory #faf9f5. High-end fashion editorial style.`

	req := geminiRequest{
		Contents: []geminiContent{
			{
				Role: "user",
				Parts: []geminiPart{
					{InlineData: &geminiBlob{
						MIMEType: mimeType,
						Data:     base64.StdEncoding.EncodeToString(imgBytes),
					}},
					{Text: prompt},
				},
			},
		},
	}

	return g.generateImage(ctx, req)
}

func (g *GeminiService) GhostMannequin(ctx context.Context, imageURL string) ([]byte, string, error) {
	imgBytes, mimeType, err := g.fetchImage(ctx, imageURL)
	if err != nil {
		return nil, "", fmt.Errorf("fetch garment image: %w", err)
	}

	prompt := `Transform this image. Remove the person wearing the dress and recreate the dress as a "ghost mannequin" product shot. The dress should maintain its 3D shape as if worn by an invisible body. Ensure clean edges and internal garment details (like labels or inner lining) are visible where the person's neck/arms were. Background should be solid ivory #faf9f5. High-end fashion editorial style.`

	// Image part first, then text — matches Gemini 2.5 Flash image-gen convention.
	// No responseModalities config: gemini-2.5-flash-image returns image by default.
	req := geminiRequest{
		Contents: []geminiContent{
			{
				Role: "user",
				Parts: []geminiPart{
					{InlineData: &geminiBlob{
						MIMEType: mimeType,
						Data:     base64.StdEncoding.EncodeToString(imgBytes),
					}},
					{Text: prompt},
				},
			},
		},
	}

	return g.generateImage(ctx, req)
}

// GeneratePatternImageFromBytes accepts raw image bytes and returns a technical
// sewing pattern sheet image showing all required pattern pieces.
func (g *GeminiService) GeneratePatternImageFromBytes(ctx context.Context, imgBytes []byte, mimeType string) ([]byte, string, error) {
	prompt := `You are given an image of a garment. Generate a professional technical sewing pattern sheet for this garment.

Requirements:
- Pure white background
- Show ALL required pattern pieces laid out with clear spacing between them
- Each piece has clean black cutting lines (solid outer line)
- Label each piece with its name (e.g. "Front Bodice", "Back Bodice", "Sleeve", "Collar", "Waistband", etc.)
- Include grain line arrows (vertical double-headed arrows) on every piece
- Show seam allowance as a dashed inner line (1.5 cm inside the cutting line)
- Add fold lines (dotted) labelled "FOLD" where applicable
- Include notch marks at key joining points
- Write cut instructions on each piece (e.g. "CUT 2", "CUT 1 ON FOLD")
- Style: clean technical flat illustration — like a Burda or Vogue sewing pattern sheet
- Do NOT draw the garment itself; only draw the flat pattern pieces`

	req := geminiRequest{
		Contents: []geminiContent{
			{
				Role: "user",
				Parts: []geminiPart{
					{InlineData: &geminiBlob{
						MIMEType: mimeType,
						Data:     base64.StdEncoding.EncodeToString(imgBytes),
					}},
					{Text: prompt},
				},
			},
		},
	}

	return g.generateImage(ctx, req)
}

// GeneratePatternImage fetches the garment image from a URL then generates pattern pieces.
func (g *GeminiService) GeneratePatternImage(ctx context.Context, imageURL string) ([]byte, string, error) {
	imgBytes, mimeType, err := g.fetchImage(ctx, imageURL)
	if err != nil {
		return nil, "", fmt.Errorf("fetch garment image: %w", err)
	}
	return g.GeneratePatternImageFromBytes(ctx, imgBytes, mimeType)
}

// VirtualTryOnFromBytes accepts raw bytes for both the dress and person images.
func (g *GeminiService) VirtualTryOnFromBytes(ctx context.Context, dressBytes []byte, dressMime string, personBytes []byte, personMime string) ([]byte, string, error) {
	prompt := `You are given two images: the first is a garment (dress), the second is a person.
Generate a photorealistic image of the person wearing the garment.
Requirements:
- Keep the person's face, hair, skin tone, and body pose exactly as-is
- Fit the garment naturally on the person's body with realistic fabric draping and wrinkles
- Preserve all of the garment's original colors, patterns, textures, and design details
- Match the lighting and shadows consistently between garment and person
- Professional fashion editorial photography style
- Output a clean, high-quality composite image`

	req := geminiRequest{
		Contents: []geminiContent{
			{
				Role: "user",
				Parts: []geminiPart{
					{InlineData: &geminiBlob{MIMEType: dressMime, Data: base64.StdEncoding.EncodeToString(dressBytes)}},
					{InlineData: &geminiBlob{MIMEType: personMime, Data: base64.StdEncoding.EncodeToString(personBytes)}},
					{Text: prompt},
				},
			},
		},
	}

	return g.generateImage(ctx, req)
}

func (g *GeminiService) AnalyzeGarmentForPatterns(ctx context.Context, imageURL string) (*GarmentAnalysis, error) {
	imgBytes, mimeType, err := g.fetchImage(ctx, imageURL)
	if err != nil {
		return nil, fmt.Errorf("fetch garment image: %w", err)
	}

	prompt := `Analyze this garment and return JSON with this exact structure:
{
  "garment_type": "dress|top|skirt|jacket|pants|...",
  "description": "brief description of the garment style",
  "estimated_difficulty": "beginner|intermediate|advanced",
  "pieces": [
    {
      "name": "Bodice Front",
      "description": "main front panel of the bodice",
      "width_ratio": 0.35,
      "height_ratio": 0.4,
      "seam_allowance_cm": 1.5,
      "shape_type": "rectangle",
      "notes": "cut 1 on fold"
    }
  ]
}
Include all necessary pieces: bodice front, bodice back, sleeves, collar, skirt panels, facings, etc.
Use realistic proportions relative to full garment dimensions (0.0 to 1.0).
Return only valid JSON — no markdown, no extra text.`

	req := geminiRequest{
		SystemInstruction: &geminiContent{
			Parts: []geminiPart{{Text: "You are an expert fashion pattern maker with 20+ years of experience. Return only valid JSON with no additional text or markdown fences."}},
		},
		Contents: []geminiContent{
			{
				Role: "user",
				Parts: []geminiPart{
					{Text: prompt},
					{InlineData: &geminiBlob{
						MIMEType: mimeType,
						Data:     base64.StdEncoding.EncodeToString(imgBytes),
					}},
				},
			},
		},
		GenerationConfig: geminiGenerationConfig{
			ResponseMIMEType: "application/json",
			MaxOutputTokens:  2000,
		},
	}

	result, err := g.generateText(ctx, req)
	if err != nil {
		return nil, fmt.Errorf("gemini garment analysis: %w", err)
	}

	var analysis GarmentAnalysis
	if err := json.Unmarshal([]byte(result), &analysis); err != nil {
		return nil, fmt.Errorf("parse garment analysis JSON: %w (response: %.300s)", err, result)
	}
	return &analysis, nil
}

func (g *GeminiService) DescribeGarment(ctx context.Context, imageURL string) (string, error) {
	imgBytes, mimeType, err := g.fetchImage(ctx, imageURL)
	if err != nil {
		return "", fmt.Errorf("fetch garment image: %w", err)
	}

	req := geminiRequest{
		Contents: []geminiContent{
			{
				Role: "user",
				Parts: []geminiPart{
					{Text: "Describe this garment in detail for a virtual try-on system. Include: garment type, color, fabric texture, fit style, length, sleeve style. Be concise (2-3 sentences)."},
					{InlineData: &geminiBlob{
						MIMEType: mimeType,
						Data:     base64.StdEncoding.EncodeToString(imgBytes),
					}},
				},
			},
		},
		GenerationConfig: geminiGenerationConfig{
			MaxOutputTokens: 200,
		},
	}

	return g.generateText(ctx, req)
}
