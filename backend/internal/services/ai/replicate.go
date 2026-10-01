package ai

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"sync"
	"time"
)

type ReplicateService struct {
	apiToken     string
	client       *http.Client
	versionCache map[string]string
	versionMu    sync.RWMutex
}

func NewReplicate(apiToken string) *ReplicateService {
	return &ReplicateService{
		apiToken:     apiToken,
		client:       &http.Client{Timeout: 10 * time.Minute},
		versionCache: make(map[string]string),
	}
}

type replicateInput map[string]interface{}

type replicatePrediction struct {
	ID     string          `json:"id"`
	Status json.RawMessage `json:"status"`
	Output json.RawMessage `json:"output"`
	Error  interface{}     `json:"error"`
	Detail interface{}     `json:"detail"`
}

func (p *replicatePrediction) statusStr() string {
	if p.Status == nil {
		return ""
	}
	var s string
	if err := json.Unmarshal(p.Status, &s); err == nil {
		return s
	}
	return ""
}

func (p *replicatePrediction) errorMsg() string {
	if p.Error != nil {
		return fmt.Sprintf("%v", p.Error)
	}
	if p.Detail != nil {
		return fmt.Sprintf("%v", p.Detail)
	}
	return "unknown replicate error"
}

func (p *replicatePrediction) outputString() (string, error) {
	if p.Output == nil {
		return "", fmt.Errorf("no output from model")
	}
	var s string
	if err := json.Unmarshal(p.Output, &s); err == nil && s != "" {
		return s, nil
	}
	var arr []string
	if err := json.Unmarshal(p.Output, &arr); err == nil && len(arr) > 0 {
		return arr[0], nil
	}
	return "", fmt.Errorf("unexpected output format: %s", string(p.Output))
}

// ── HTTP helpers ──────────────────────────────────────────────────────────────

func (r *ReplicateService) do(ctx context.Context, method, url string, body interface{}) (int, []byte, error) {
	var bodyReader io.Reader
	if body != nil {
		b, err := json.Marshal(body)
		if err != nil {
			return 0, nil, err
		}
		bodyReader = bytes.NewReader(b)
	}
	req, err := http.NewRequestWithContext(ctx, method, url, bodyReader)
	if err != nil {
		return 0, nil, err
	}
	req.Header.Set("Authorization", "Bearer "+r.apiToken)
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	req.Header.Set("Prefer", "wait=60")

	resp, err := r.client.Do(req)
	if err != nil {
		return 0, nil, err
	}
	defer resp.Body.Close()
	data, err := io.ReadAll(resp.Body)
	return resp.StatusCode, data, err
}

func parsePred(data []byte) (*replicatePrediction, error) {
	var pred replicatePrediction
	if err := json.Unmarshal(data, &pred); err != nil {
		return nil, fmt.Errorf("parse replicate response: %w (body: %.200s)", err, string(data))
	}
	return &pred, nil
}

// ── Version lookup ────────────────────────────────────────────────────────────

// latestVersion fetches and caches the latest published version hash for a model.
func (r *ReplicateService) latestVersion(ctx context.Context, owner, model string) (string, error) {
	cacheKey := owner + "/" + model

	r.versionMu.RLock()
	if v, ok := r.versionCache[cacheKey]; ok {
		r.versionMu.RUnlock()
		return v, nil
	}
	r.versionMu.RUnlock()

	url := fmt.Sprintf("https://api.replicate.com/v1/models/%s/%s", owner, model)
	statusCode, data, err := r.do(ctx, "GET", url, nil)
	if err != nil {
		return "", err
	}
	if statusCode >= 400 {
		return "", fmt.Errorf("model %s/%s not found on Replicate (status %d)", owner, model, statusCode)
	}

	var resp struct {
		LatestVersion struct {
			ID string `json:"id"`
		} `json:"latest_version"`
	}
	if err := json.Unmarshal(data, &resp); err != nil {
		return "", fmt.Errorf("parse model response: %w", err)
	}
	if resp.LatestVersion.ID == "" {
		return "", fmt.Errorf("model %s/%s has no published versions", owner, model)
	}

	r.versionMu.Lock()
	r.versionCache[cacheKey] = resp.LatestVersion.ID
	r.versionMu.Unlock()

	return resp.LatestVersion.ID, nil
}

// ── Prediction runner ─────────────────────────────────────────────────────────

func (r *ReplicateService) run(ctx context.Context, owner, model string, input replicateInput) (*replicatePrediction, error) {
	version, err := r.latestVersion(ctx, owner, model)
	if err != nil {
		return nil, err
	}

	statusCode, data, err := r.do(ctx, "POST", "https://api.replicate.com/v1/predictions", map[string]interface{}{
		"version": version,
		"input":   input,
	})
	if err != nil {
		return nil, err
	}

	pred, err := parsePred(data)
	if err != nil {
		return nil, err
	}
	if statusCode >= 400 {
		return nil, fmt.Errorf("replicate %s/%s: %s", owner, model, pred.errorMsg())
	}

	switch pred.statusStr() {
	case "succeeded":
		return pred, nil
	case "failed", "canceled":
		return nil, fmt.Errorf("prediction failed: %s", pred.errorMsg())
	}

	return r.poll(ctx, pred.ID, owner+"/"+model)
}

func (r *ReplicateService) poll(ctx context.Context, predID, modelSlug string) (*replicatePrediction, error) {
	url := "https://api.replicate.com/v1/predictions/" + predID
	for {
		select {
		case <-ctx.Done():
			return nil, ctx.Err()
		default:
		}
		time.Sleep(3 * time.Second)

		statusCode, data, err := r.do(ctx, "GET", url, nil)
		if err != nil {
			return nil, err
		}
		pred, err := parsePred(data)
		if err != nil {
			return nil, err
		}
		if statusCode >= 400 {
			return nil, fmt.Errorf("replicate poll (%s): %s", modelSlug, pred.errorMsg())
		}
		switch pred.statusStr() {
		case "succeeded":
			return pred, nil
		case "failed", "canceled":
			return nil, fmt.Errorf("prediction %s (%s): %s", pred.statusStr(), modelSlug, pred.errorMsg())
		}
	}
}

// ── Public API ────────────────────────────────────────────────────────────────

func (r *ReplicateService) RemoveBackground(ctx context.Context, imageURL string) (string, error) {
	// lucataco/remove-bg is actively maintained and widely used
	pred, err := r.run(ctx, "lucataco", "remove-bg", replicateInput{
		"image": imageURL,
	})
	if err != nil {
		return "", fmt.Errorf("remove background: %w", err)
	}
	return pred.outputString()
}

func (r *ReplicateService) VirtualTryOn(ctx context.Context, garmentURL, personURL, garmentDesc string) (string, error) {
	pred, err := r.run(ctx, "cuuupid", "idm-vton", replicateInput{
		"garm_img":            garmentURL,
		"human_img":           personURL,
		"garment_description": garmentDesc,
		"is_checked":          true,
		"is_checked_crop":     false,
		"denoise_steps":       30,
		"seed":                42,
	})
	if err != nil {
		return "", fmt.Errorf("virtual try-on: %w", err)
	}
	return pred.outputString()
}
